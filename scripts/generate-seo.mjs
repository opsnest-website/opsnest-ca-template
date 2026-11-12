#!/usr/bin/env node
/**
 * Optional helper: writes SEO tags, sitemap.xml, robots.txt and the 404 base
 * path from src/data/site-data.js.
 *
 *   node scripts/generate-seo.mjs
 *
 * The site works without running this (tags are also set in the browser),
 * but running it after editing site-data.js gives social-media previews and
 * crawlers that don't execute JavaScript the correct titles, descriptions
 * and canonical URLs. Requires Node 18+; no packages needed.
 */
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { site, ROUTES, absoluteUrl, enabledServices, serviceHref, configWarnings } from "../src/js/config.js";
import { pageTitle } from "../src/js/seo.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function seoBlock(pageId) {
  const cfg = site.seo?.pages?.[pageId] || {};
  const title = pageId === "home" && cfg.title ? cfg.title : pageTitle(cfg.title);
  const description = cfg.description || site.seo?.defaultDescription || "";
  const url = absoluteUrl(ROUTES[pageId]);
  const image = site.website.ogImage ? absoluteUrl(site.website.ogImage) : "";
  const lines = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}">`,
    site.seo?.keywords?.length ? `<meta name="keywords" content="${esc(site.seo.keywords.join(", "))}">` : "",
    `<meta name="theme-color" content="${esc(site.website.themeColor || "#0d1b2e")}">`,
    pageId === "notFound" ? `<meta name="robots" content="noindex">` : `<link rel="canonical" href="${esc(url)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="${esc(site.firm.name)}">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(description)}">`,
    `<meta property="og:url" content="${esc(url)}">`,
    `<meta property="og:locale" content="${esc(site.website.locale || "en_IN")}">`,
    image ? `<meta property="og:image" content="${esc(image)}">` : "",
    `<meta name="twitter:card" content="${image ? "summary_large_image" : "summary"}">`,
    site.website.favicon ? `<link rel="icon" href="${esc(site.website.favicon)}" type="image/svg+xml">` : "",
  ].filter(Boolean);
  return lines.map((l) => `  ${l}`).join("\n");
}

function replaceBetween(html, name, content) {
  const re = new RegExp(`(<!-- ${name}:START[^>]*-->)[\\s\\S]*?(\\s*<!-- ${name}:END -->)`);
  if (!re.test(html)) return html;
  return html.replace(re, `$1\n${content}$2`);
}

async function main() {
  const lang = site.website.language || "en";
  for (const [pageId, file] of Object.entries(ROUTES)) {
    const path = join(root, file);
    let html;
    try {
      html = await readFile(path, "utf8");
    } catch {
      console.warn(`skip: ${file} not found`);
      continue;
    }
    html = replaceBetween(html, "SEO", seoBlock(pageId));
    html = html.replace(/<html lang="[^"]*">/, `<html lang="${esc(lang)}">`);
    if (pageId === "notFound") html = replaceBetween(html, "BASE", `  <base href="${esc(site.website.basePath || "/")}">`);
    await writeFile(path, html);
    console.log(`updated ${file}`);
  }

  // sitemap.xml
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    ...["home", "about", "firm", "services", "contact", "privacy", "disclaimer"].map((id) => absoluteUrl(ROUTES[id])),
    ...enabledServices().map((s) => absoluteUrl(serviceHref(s.id))),
  ];
  const sitemap =
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>${esc(u)}</loc><lastmod>${today}</lastmod></url>`).join("\n") +
    `\n</urlset>\n`;
  await writeFile(join(root, "sitemap.xml"), sitemap);
  console.log(`wrote sitemap.xml (${urls.length} URLs)`);

  // robots.txt (only effective at the domain root; see README)
  const robots = `# Crawlers read robots.txt only from the domain root.\n# If this site lives in a sub-folder (e.g. /ca/), add the Sitemap line\n# below to the robots.txt at your domain root.\nUser-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl("sitemap.xml")}\n`;
  await writeFile(join(root, "robots.txt"), robots);
  console.log("wrote robots.txt");

  if (configWarnings.length) {
    console.warn(`\n${configWarnings.length} configuration warning(s):`);
    configWarnings.forEach((w) => console.warn(`  - ${w}`));
    process.exitCode = 1;
  }
}

main();
