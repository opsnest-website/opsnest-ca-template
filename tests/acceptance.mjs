#!/usr/bin/env node
/**
 * Acceptance tests (optional; not needed to run the site).
 *
 *   npm install          # installs Playwright (dev only)
 *   npx playwright install chromium
 *   npm test
 *
 * Starts a tiny static server for the site under "/" and under "/ca/",
 * then checks pages, links, navigation, contact links, services, the
 * enquiry form and draft-mode behaviour. A temporary copy of the site with
 * modified site-data.js verifies that content changes need no UI edits.
 */
import http from "node:http";
import { readFile, stat, cp, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, extname, dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import { chromium } from "playwright";

const ROOT = resolve(process.env.PROJECT_ROOT || join(dirname(fileURLToPath(import.meta.url)), ".."));

// Tests read the live configuration, so they keep passing after the sample
// content is replaced with real content.
const loadConfig = (dir) => import(`${pathToFileURL(join(dir, "src/js/config.js")).href}?v=${Date.now()}${Math.random()}`);
const CFG = await loadConfig(ROOT);
const SERVICES = CFG.enabledServices();
if (!SERVICES.length) throw new Error("site-data.js has no enabled services; at least one is required.");
const FIRST_SERVICE = SERVICES[0];
const PAGES = ["index.html", "about.html", "firm.html", "services.html", `service.html?id=${FIRST_SERVICE.id}`, "contact.html", "privacy.html", "disclaimer.html", "404.html"];
const digitsOf = (v) => String(v || "").replace(/\D/g, "");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".woff2": "font/woff2", ".xml": "application/xml", ".txt": "text/plain", ".json": "application/json" };

let failures = 0;
let passes = 0;
const ok = (cond, msg) => {
  if (cond) passes++;
  else {
    failures++;
    console.log(`  ✗ ${msg}`);
  }
};
const section = (t) => console.log(`\n▸ ${t}`);

/* ------------------------------------------------------- static server */
function serve(dir, prefix) {
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, "http://x");
    let p = decodeURIComponent(url.pathname);
    if (!p.startsWith(prefix)) return send404();
    p = p.slice(prefix.length);
    if (p === "" || p.endsWith("/")) p += "index.html";
    if (p.includes("..")) return send404();
    try {
      const file = join(dir, p);
      if (!(await stat(file)).isFile()) return send404();
      res.writeHead(200, { "Content-Type": TYPES[extname(file)] || "application/octet-stream" });
      res.end(await readFile(file));
    } catch {
      send404();
    }
    async function send404() {
      // Like nginx `error_page 404 /ca/404.html`
      res.writeHead(404, { "Content-Type": "text/html" });
      res.end(await readFile(join(dir, "404.html")));
    }
  });
  return new Promise((r) => server.listen(0, () => r({ server, base: `http://localhost:${server.address().port}${prefix}` })));
}

/** Copy the site to a temp folder, optionally edit site-data.js, and regenerate SEO files. */
async function copySite(edit) {
  const dir = await mkdtemp(join(tmpdir(), "ca-site-"));
  await cp(ROOT, dir, { recursive: true, filter: (s) => !/node_modules|[\\/]\.git([\\/]|$)/.test(s) });
  if (edit) {
    const f = join(dir, "src/data/site-data.js");
    await writeFile(f, edit(await readFile(f, "utf8")));
  }
  // Exit code ignored here: configuration warnings are reported by the release check.
  spawnSync(process.execPath, [join(dir, "scripts/generate-seo.mjs")], { stdio: "ignore" });
  return dir;
}

async function newPage(browser, { width = 1280, accepted = true } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
  if (accepted) await ctx.addInitScript(() => localStorage.setItem("entry-disclaimer-accepted", String(Date.now())));
  const page = await ctx.newPage();
  page.problems = [];
  page.on("pageerror", (e) => page.problems.push(`pageerror: ${e.message}`));
  page.on("console", (m) => m.type() === "error" && page.problems.push(`console: ${m.text()}`));
  page.on("response", (r) => r.status() >= 400 && !r.url().includes("does-not-exist") && page.problems.push(`HTTP ${r.status()} ${r.url()}`));
  return page;
}

/* --------------------------------------------------------------- suites */
async function suiteBase(browser, dir, prefix) {
  const { server, base } = await serve(dir, prefix);
  section(`Deployment under "${prefix}"`);
  const page = await newPage(browser);
  const internal = new Set();

  for (const p of PAGES) {
    page.problems = [];
    const res = await page.goto(base + p, { waitUntil: "networkidle" });
    ok(res.status() === 200, `${p} returns 200`);
    ok(await page.locator("#site-header .brand").count(), `${p} renders header`);
    ok(await page.locator("#site-footer .footer-grid").count(), `${p} renders footer`);
    ok((await page.locator("main h1").count()) === 1, `${p} has exactly one h1`);
    ok(page.problems.length === 0, `${p} has no errors: ${page.problems.join(" | ")}`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    ok(overflow <= 0, `${p} has no horizontal overflow (${overflow}px)`);
    const hrefs = await page.$$eval("a[href]", (as) => as.map((a) => a.href));
    hrefs.filter((h) => h.startsWith(base) || h.startsWith(new URL(base).origin)).forEach((h) => internal.add(h.split("#")[0]));
  }

  // Deep 404 must still load assets (absolute <base> written from basePath).
  page.problems = [];
  const r404 = await page.goto(base + "does-not-exist/deeper/page", { waitUntil: "networkidle" });
  ok(r404.status() === 404 && (await page.locator("h1").textContent()).includes("not found"), "deep unknown URL renders styled 404 page");
  // The document itself is a 404 (the browser logs that); every asset must load.
  const assetProblems = page.problems.filter((x) => !x.startsWith("console: Failed to load resource"));
  ok(assetProblems.length === 0, `deep 404 loads all assets: ${assetProblems.join(" | ")}`);

  section(`Internal links under "${prefix}" (${internal.size})`);
  for (const href of internal) {
    ok(href.startsWith(base), `link stays inside base path: ${href}`);
    const res = await page.request.get(href);
    ok(res.status() === 200, `link resolves: ${href} → ${res.status()}`);
  }

  section("Navigation");
  await page.goto(base, { waitUntil: "networkidle" });
  for (const label of ["About the CA", "Our Firm", "Services", "Contact", "Home"]) {
    await page.locator(".primary-nav a", { hasText: label }).click();
    await page.waitForLoadState("networkidle");
    const current = await page.locator('.primary-nav a[aria-current="page"]').textContent();
    ok(current === label, `nav "${label}" navigates and is marked active (got "${current}")`);
  }

  section("Mobile menu");
  const m = await newPage(browser, { width: 390 });
  await m.goto(base + "services.html", { waitUntil: "networkidle" });
  ok(await m.locator(".primary-nav").isHidden(), "desktop nav hidden on mobile");
  const toggle = m.locator(".menu-toggle");
  await toggle.click();
  ok((await toggle.getAttribute("aria-expanded")) === "true" && (await m.locator("#mobile-menu").isVisible()), "menu opens");
  await m.keyboard.press("Escape");
  ok(await m.locator("#mobile-menu").isHidden(), "Escape closes menu");
  await toggle.click();
  await m.locator("#mobile-menu a", { hasText: "Our Firm" }).click();
  await m.waitForLoadState("networkidle");
  ok(m.url().endsWith("firm.html"), "menu link navigates");
  ok(await m.locator(".fab-group").isVisible(), "floating contact buttons on mobile");
  await m.context().close();

  await page.context().close();
  server.close();
}

async function suiteContent(browser, dir) {
  const { server, base } = await serve(dir, "/ca/");
  const { site } = CFG;
  const page = await newPage(browser);

  section("Contact links come from configuration");
  const phones = [site.contact.phonePrimary, site.contact.phoneSecondary].map(digitsOf).filter(Boolean);
  const waDigits = digitsOf(site.contact.whatsapp);
  const emails = [site.contact.emailPrimary, site.contact.emailSecondary].filter(Boolean);
  for (const p of ["index.html", "contact.html", `service.html?id=${FIRST_SERVICE.id}`]) {
    await page.goto(base + p, { waitUntil: "networkidle" });
    const tels = await page.$$eval('a[href^="tel:"]', (a) => a.map((x) => x.getAttribute("href")));
    const was = await page.$$eval('a[href*="wa.me"]', (a) => a.map((x) => x.getAttribute("href")));
    const mails = await page.$$eval('a[href^="mailto:"]', (a) => a.map((x) => x.getAttribute("href")));
    ok(phones.length ? tels.length && tels.every((t) => phones.includes(digitsOf(t))) : !tels.length, `${p}: tel links match config`);
    ok(waDigits ? was.length && was.every((w) => w.includes(`wa.me/${waDigits}`)) : !was.length, `${p}: WhatsApp links match config`);
    ok(emails.length ? mails.length && mails.every((x) => emails.some((e) => x === `mailto:${e}` || x.startsWith(`mailto:${e}?`))) : !mails.length, `${p}: mailto links match config`);
  }

  section("Services");
  await page.goto(base + "services.html", { waitUntil: "networkidle" });
  const enabled = site.services.filter((s) => s.enabled !== false);
  const disabled = site.services.filter((s) => s.enabled === false);
  ok((await page.locator(".service-card").count()) === enabled.length, `all ${enabled.length} enabled services rendered`);
  for (const s of disabled) {
    ok((await page.getByText(s.name, { exact: true }).count()) === 0, `disabled service "${s.id}" not listed`);
    await page.goto(base + `service.html?id=${s.id}`, { waitUntil: "networkidle" });
    ok((await page.locator('meta[name="robots"][content="noindex"]').count()) === 1 && (await page.locator("h1").textContent()) !== s.name, `disabled service "${s.id}" detail is not reachable`);
    await page.goto(base + "services.html", { waitUntil: "networkidle" });
  }
  const cats = CFG.activeCategories();
  if (cats.length > 1) {
    await page.locator(`.filter-chip[data-filter="${cats[1].id}"]`).click();
    const visibleGroups = await page.locator(".service-group:visible").count();
    ok(visibleGroups === 1 && page.url().includes(`category=${cats[1].id}`), "category filter shows one group and updates URL");
  }
  await page.locator(".service-card__link:visible").first().click();
  await page.waitForLoadState("networkidle");
  ok(page.url().includes("service.html?id="), "service card opens detail page");

  section("Enquiry form without endpoint");
  await page.goto(base + `contact.html?service=${FIRST_SERVICE.id}`, { waitUntil: "networkidle" });
  ok(await page.locator('.enquiry-form button[type="submit"]').isDisabled(), "submit is disabled when not connected");
  ok(await page.locator(".enquiry-form .notice").isVisible(), "not-connected notice is shown");
  ok((await page.locator("#f-service").inputValue()) === FIRST_SERVICE.name, "service pre-selected from URL");
  await page.locator('[data-send]').first().click();
  ok((await page.locator(".field.has-error").count()) >= 3, "validation flags missing required fields");
  ok((await page.locator(".form-status--success").count()) === 0, "never reports success without endpoint");

  await page.context().close();
  server.close();
}

async function suiteMutated(browser) {
  const oldNumbers = [CFG.site.contact.phonePrimary, CFG.site.contact.whatsapp].map(digitsOf).filter(Boolean);
  const category = CFG.site.categories[0].id;
  const tmp = await copySite((src) =>
    src
      .replace(/(\bphonePrimary:\s*)"[^"]*"/, '$1"+91 91111 22222"')
      .replace(/(\bwhatsapp:\s*)"[^"]*"/, '$1"+91 91111 22222"')
      .replace(/(\bdraftMode:\s*)(true|false)/, "$1false")
      .replace(/(entryDisclaimer:\s*\{\s*enabled:\s*)(true|false)/, "$1true")
      .replace(/(\bendpoint:\s*)"[^"]*"/, '$1"https://forms.example.test/submit"')
      .replace(/(\bformat:\s*)"[^"]*"/, '$1"json"')
      .replace(
        /(\n\s*services:\s*\[\s*\n)/,
        `$1    { id: "brand-new-service", name: "Brand New Test Service", category: "${category}", icon: "target", order: 0, enabled: true, featured: true, shortDescription: "Added only in site-data.js.", description: ["Detail text."], targetAudience: ["Testers"], scope: ["Scope item"], deliverables: ["Deliverable item"], cta: { label: "Ask about it" } },\n`,
      ),
  );

  const { server, base } = await serve(tmp, CFG.site.website.basePath || "/");
  const page = await newPage(browser);

  section("Adding a service needs no UI changes");
  await page.goto(base + "services.html", { waitUntil: "networkidle" });
  ok(await page.getByText("Brand New Test Service").count(), "new service appears on services page");
  await page.goto(base + "service.html?id=brand-new-service", { waitUntil: "networkidle" });
  ok((await page.locator("h1").textContent()) === "Brand New Test Service", "new service detail page renders");
  await page.goto(base, { waitUntil: "networkidle" });
  ok(await page.getByText("Brand New Test Service").count(), "featured new service appears on homepage");

  section("Changing contact details updates every page");
  for (const p of PAGES) {
    await page.goto(base + p, { waitUntil: "networkidle" });
    // Compare with spaces, dashes, brackets and "+" stripped, so formatting can't hide the old number.
    const squashed = (await page.content()).replace(/[\s()+\-]/g, "");
    const stale = oldNumbers.filter((n) => n !== "919111122222" && squashed.includes(n.slice(-10)));
    ok(stale.length === 0, `${p}: old number gone`);
    const links = await page.$$eval('a[href^="tel:+9191111"], a[href*="wa.me/919111122222"]', (a) => a.length);
    ok(links > 0, `${p}: new number used in links`);
  }

  section("Draft mode off hides unverified claims");
  await page.goto(base + "about.html", { waitUntil: "networkidle" });
  ok((await page.locator(".tag--unverified").count()) === 0, "no unverified tags");
  ok((await page.locator(".draft-ribbon").count()) === 0, "no draft ribbon");
  const unverifiedQuals = (CFG.site.profile.qualifications || []).filter((q) => q.verified !== true);
  for (const q of unverifiedQuals) ok((await page.getByText(q.title, { exact: true }).count()) === 0, `unverified qualification "${q.title}" hidden`);
  const verifiedJobs = (CFG.site.profile.careerJourney || []).filter((j) => j.verified === true).length;
  ok((await page.locator(".timeline__item").count()) === verifiedJobs, "only verified career entries shown");
  for (const p of ["index.html", "firm.html"]) {
    await page.goto(base + p, { waitUntil: "networkidle" });
    ok((await page.locator(".tag--unverified").count()) === 0, `${p}: no unverified tags`);
  }

  section("Enquiry form with endpoint");
  await page.goto(base + "contact.html", { waitUntil: "networkidle" });
  const fill = async () => {
    await page.fill("#f-name", "Test Person");
    await page.fill("#f-phone", "+91 90000 00000");
    await page.fill("#f-email", "test@example.com");
    await page.fill("#f-message", "Please call me about GST.");
    await page.check("#f-consent");
  };
  let payload = null;
  await page.route("https://forms.example.test/**", (route) => route.fulfill({ status: 500, body: "{}" }));
  await fill();
  await page.click('.enquiry-form button[type="submit"]');
  await page.locator(".form-status").waitFor();
  ok(await page.locator(".form-status--error").isVisible(), "server error shows error state");
  ok((await page.locator(".form-status--success").count()) === 0, "no false success on server error");
  await page.unroute("https://forms.example.test/**");
  await page.route("https://forms.example.test/**", (route) => {
    payload = JSON.parse(route.request().postData());
    route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' });
  });
  await page.click('.enquiry-form button[type="submit"]');
  await page.locator(".form-status--success").waitFor();
  ok(payload?.name === "Test Person" && payload?.consent === "yes", "payload sent to endpoint");
  ok(await page.locator(".form-status--success").isVisible(), "success only after OK response");

  section("Entry disclaimer");
  const fresh = await newPage(browser, { accepted: false });
  await fresh.goto(base, { waitUntil: "networkidle" });
  ok(await fresh.locator("dialog.entry-dialog").isVisible(), "shown on first visit");
  await fresh.locator("dialog.entry-dialog .btn--primary").click();
  const closed = await fresh.locator("dialog.entry-dialog").waitFor({ state: "detached", timeout: 3000 }).then(() => true, () => false);
  ok(closed, "closes on accept");
  await fresh.reload({ waitUntil: "networkidle" });
  ok((await fresh.locator("dialog.entry-dialog").count()) === 0, "remembered after accept");
  await fresh.context().close();

  await page.context().close();
  server.close();
  await rm(tmp, { recursive: true, force: true });
}

/* ----------------------------------------------------------------- main */
const browser = await chromium.launch();
try {
  // Test the configured base path, plus "/ca/" and "/" so either deployment works.
  const bases = [...new Set([CFG.site.website.basePath || "/", "/ca/", "/"])];
  for (const bp of bases) {
    const dir = await copySite((src) => src.replace(/(\bbasePath:\s*)"[^"]*"/, `$1"${bp}"`));
    await suiteBase(browser, dir, bp);
    if (bp === "/ca/") await suiteContent(browser, dir);
    await rm(dir, { recursive: true, force: true });
  }
  await suiteMutated(browser);
} finally {
  await browser.close();
}
console.log(`\n${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
