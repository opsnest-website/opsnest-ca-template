#!/usr/bin/env node
/**
 * Release-readiness check: is site-data.js ready to go live?
 *
 *   node scripts/check-release.mjs              # exit 1 if anything blocks release
 *   node scripts/check-release.mjs --advisory   # report only, always exit 0
 *
 * Environment:
 *   EXPECTED_BASE_URL  e.g. "https://example.com/ca"; siteUrl + basePath must match it.
 *                      (CI passes the GitHub Pages URL here.)
 *
 * BLOCKING (errors):
 *   - website.draftMode is not false
 *   - configuration warnings (bad ids, unknown categories, malformed paths...)
 *   - siteUrl/basePath don't match the deployment URL
 *   - visible content still contains template sample data or placeholders
 *     ([brackets], "SAMPLE", example.com, the sample names/numbers)
 *   - the placeholder portrait is still in use
 *   - referenced images are missing
 *   - testimonials enabled without consent + verification
 * ADVISORY (warnings):
 *   - sample logo / favicon / social image unchanged
 *   - enquiry form not connected (the WhatsApp/email fallback still works)
 *   - structured data off, unverified items that will be hidden
 */
import { readFile, access } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { site, configWarnings, teamMembers, isExternal } from "../src/js/config.js";
import rawData from "../src/data/site-data.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA_FILE = "src/data/site-data.js";
const advisory = process.argv.includes("--advisory");
const source = await readFile(join(root, DATA_FILE), "utf8");
const sourceLines = source.split("\n");

const errors = [];
const warnings = [];
// Find the line in site-data.js for an annotation, skipping comment lines.
// `needle` may be a list of candidates, most specific first.
const isComment = (l) => /^\s*(\*|\/\/|\/\*)/.test(l);
const lineOf = (needles) => {
  for (const needle of [].concat(needles).filter(Boolean)) {
    const n = String(needle).slice(0, 40);
    const i = sourceLines.findIndex((l) => !isComment(l) && l.includes(n));
    if (i >= 0) return i + 1;
  }
  return 0;
};
const error = (msg, needle) => errors.push({ msg, line: lineOf(needle) });
const warn = (msg, needle) => warnings.push({ msg, line: lineOf(needle) });

/* --------------------------------------------------------- 1. Draft mode */
if (site.website?.draftMode !== false) {
  error("website.draftMode must be false before going live (it shows sample-content banners and unverified claims).", "draftMode:");
}

/* ------------------------------------------------- 2. Config validation */
configWarnings.forEach((w) => error(`Configuration: ${w}`));

/* ------------------------------------------------ 3. Deployment address */
const siteUrl = (site.website?.siteUrl || "").replace(/\/$/, "");
const basePath = site.website?.basePath || "/";
const configured = `${siteUrl}${basePath}`.replace(/\/$/, "");
if (!/^https:\/\//.test(siteUrl)) error(`website.siteUrl must be an https:// address (got "${siteUrl}").`, "siteUrl:");
if (/example\.(com|org|net)/i.test(siteUrl)) error(`website.siteUrl is still the sample "${siteUrl}".`, "siteUrl:");
const expected = (process.env.EXPECTED_BASE_URL || "").replace(/\/$/, "");
if (expected && expected.toLowerCase() !== configured.toLowerCase()) {
  error(`siteUrl + basePath is "${configured}/" but the site is being deployed to "${expected}/". Update website.siteUrl / website.basePath.`, "basePath:");
}

/* ------------------------------------ 4. Sample / placeholder content */
const SAMPLE_PATTERNS = [
  [/\[[^\]\n]{2,60}\]/, "placeholder in [brackets]"],
  [/\bSAMPLE\b/, "marked SAMPLE"],
  [/\bexample\.(com|org|net)\b/i, "example.com address"],
  [/Aarav Mehta|\bAarav\b/, "template sample name"],
  [/Artha\b/, "template sample firm name"],
  [/98765\s?43210|1234\s?5678/, "template sample phone number"],
  [/^https:\/\/(www\.)?linkedin\.com\/?$/i, "LinkedIn URL without a profile path"],
];

// Content that is never published when draftMode is false.
const SKIP_PATHS = new Set(["website.draftNotice", "website.siteUrl", "enquiryForm.extraFields", "seo.structuredData"]);
const hidden = (obj) =>
  obj && typeof obj === "object" && !Array.isArray(obj) && (obj.enabled === false || obj.show === false || ("verified" in obj && obj.verified !== true));

function walk(value, path) {
  if (SKIP_PATHS.has(path)) return;
  if (typeof value === "string") {
    for (const [re, label] of SAMPLE_PATTERNS) {
      if (re.test(value)) {
        const key = path.split(".").pop().replace(/\[\d+\]$/, "");
        const quoted = JSON.stringify(value).slice(0, 36);
        error(`${path}: ${label}: "${value.length > 70 ? `${value.slice(0, 70)}…` : value}"`, [`${key}: ${quoted}`, quoted, value]);
        break;
      }
    }
    return;
  }
  if (Array.isArray(value)) return value.forEach((v, i) => walk(v, `${path}[${i}]`));
  if (value && typeof value === "object") {
    if (hidden(value)) return;
    for (const [k, v] of Object.entries(value)) walk(v, path ? `${path}.${k}` : k);
  }
}
// Scan the raw file (before {tokens} are filled) so each problem is reported
// once, at its source; e.g. a sample firm name is flagged at firm.name only.
// Sections that only render when explicitly enabled are skipped.
const scan = structuredClone(rawData);
if (!scan.website?.entryDisclaimer?.enabled) delete scan.website.entryDisclaimer;
if (!scan.testimonials?.enabled) delete scan.testimonials;
if (!scan.profile?.achievements?.enabled) delete scan.profile.achievements;
if (scan.profile && scan.profile.practiceSinceVerified !== true) delete scan.profile.practiceSince;
if (scan.firm?.team?.enabled === false) delete scan.firm.team;
walk(scan, "");

/* -------------------------------------------------------- 5. Assets */
const PLACEHOLDER_PORTRAIT = "assets/images/profile-placeholder.svg";
const SAMPLE_HASHES = {
  "0d63dc15261fff838757b4509b45c6131d1aaa0ca316ffddf0cefb0baf604111": "sample social-share image (og-image.png)",
  "2c72c8baea23db3e373e8601bf8897d4bd374fd394b0c109b4ba6616d1c097ff": "sample logo",
  "5e49add980fe72b3af515216226080287b5714c33461f8766fa4cfe893bfa4d6": "sample favicon",
};
const assets = [
  ["profile.photograph.src", site.profile?.photograph?.src],
  ["firm.logo.src", site.firm?.logo?.src],
  ["website.favicon", site.website?.favicon],
  ["website.ogImage", site.website?.ogImage],
  ...teamMembers().map((m, i) => [`firm.team.members[${i}].photo`, m.photo]),
  ...(site.firm?.photos || []).map((p, i) => [`firm.photos[${i}].src`, p.src]),
].filter(([, src]) => src && !isExternal(src));

for (const [path, src] of assets) {
  const file = join(root, src);
  try {
    await access(file);
  } catch {
    error(`${path}: file not found: "${src}"`, src);
    continue;
  }
  if (src === PLACEHOLDER_PORTRAIT) {
    if (path.startsWith("firm.team")) continue; // team entry copies the profile photo; reported once below
    error(`${path}: still uses the placeholder portrait. Add a real photograph.`, `src: "${src}`);
    continue;
  }
  const hash = createHash("sha256").update(await readFile(file)).digest("hex");
  if (SAMPLE_HASHES[hash]) warn(`${path}: "${src}" is the template's ${SAMPLE_HASHES[hash]}. Replace it with the firm's own.`, src);
}

/* ------------------------------------------------ 6. Required details */
const c = site.contact || {};
if (!c.phonePrimary && !c.emailPrimary) error("contact: at least a phone number or an email is required.", "phonePrimary:");
if (!c.address?.line1 || !c.address?.city) error("contact.address: line1 and city are required.", "address:");
if (!site.privacy?.lastUpdated) error("privacy.lastUpdated is required.", "lastUpdated:");
if (!site.disclaimer?.lastUpdated) error("disclaimer.lastUpdated is required.", "lastUpdated:");

/* ------------------------------------------------ 7. Testimonials */
if (site.testimonials?.enabled) {
  (site.testimonials.items || []).forEach((t, i) => {
    if (!t.consentOnFile || t.verified !== true) {
      error(`testimonials.items[${i}]: needs consentOnFile: true and verified: true (or disable testimonials).`, t.quote);
    }
  });
}

/* ------------------------------------------------ 8. Advisory notes */
if (!site.enquiryForm?.endpoint) warn("enquiryForm.endpoint is empty: the online form is disabled (visitors can still use WhatsApp/email).", "endpoint:");
else if (!site.enquiryForm?.providerName) warn("enquiryForm.providerName is empty: the privacy policy won't name the form provider.", "providerName:");
if (!site.seo?.structuredData?.enabled) warn("seo.structuredData is off (optional: enable once details are approved).", "structuredData:");
const hiddenClaims = [
  ...(site.profile?.qualifications || []).filter((q) => q.verified !== true).map((q) => `qualification "${q.title}"`),
  ...(site.profile?.careerJourney || []).filter((j) => j.verified !== true).map((j) => `career entry "${j.role}"`),
  ...(site.credentials || []).filter((x) => x.verified !== true).map((x) => `credential "${x.label}"`),
  ...(site.profile?.membership?.show && site.profile.membership.verified !== true ? ["ICAI membership"] : []),
];
if (hiddenClaims.length) warn(`${hiddenClaims.length} unverified item(s) will be HIDDEN on the live site: ${hiddenClaims.join(", ")}.`, "verified: false");

/* ------------------------------------------------------------ Report */
const gha = Boolean(process.env.GITHUB_ACTIONS);
const esc = (s) => String(s).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
const annotate = (level, { msg, line }) =>
  gha ? `::${level} file=${DATA_FILE}${line ? `,line=${line}` : ""},title=Release check::${esc(msg)}` : `  ${level === "error" ? "✗" : "!"} ${msg}${line ? `  (${DATA_FILE}:${line})` : ""}`;

const blockingLevel = advisory ? "warning" : "error";
console.log(`Release check for ${configured}/`);
if (errors.length) {
  console.log(`\n${errors.length} blocking issue(s):`);
  errors.forEach((e) => console.log(annotate(blockingLevel, e)));
}
if (warnings.length) {
  console.log(`\n${warnings.length} advisory note(s):`);
  warnings.forEach((w) => console.log(annotate("warning", w)));
}

if (process.env.GITHUB_STEP_SUMMARY) {
  const { appendFile } = await import("node:fs/promises");
  const row = (icon, x) => `| ${icon} | ${x.msg.replace(/\|/g, "\\|")} | ${x.line ? `\`${DATA_FILE}:${x.line}\`` : ""} |`;
  const md = [
    `## Release check: ${errors.length ? (advisory ? "⚠️ not ready to go live" : "❌ blocked") : "✅ ready"}`,
    "",
    `Deploy target: \`${configured}/\` · draftMode: \`${site.website?.draftMode}\``,
    "",
    errors.length || warnings.length ? "| | Issue | Where |\n|---|---|---|" : "_No issues._",
    ...errors.map((e) => row("❌", e)),
    ...warnings.map((w) => row("⚠️", w)),
    "",
  ].join("\n");
  await appendFile(process.env.GITHUB_STEP_SUMMARY, md);
}

if (!errors.length) console.log(`\n✓ Ready to go live${warnings.length ? " (see advisory notes)" : ""}.`);
else if (advisory) console.log("\nNot ready to go live yet. Deployment will be blocked until these are fixed.");
process.exit(errors.length && !advisory ? 1 : 0);
