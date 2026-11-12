/**
 * Per-page SEO: title, description, canonical, Open Graph, Twitter card,
 * favicon and optional JSON-LD. All values come from site-data.js.
 *
 * scripts/generate-seo.mjs writes the same tags into each HTML file for
 * crawlers that don't run JavaScript; this module keeps them in sync at
 * runtime (and handles dynamic pages such as individual services).
 */
import { site, absoluteUrl, ROUTES, addressLines, digits, caFullName } from "./config.js";

function setMeta(attr, key, content) {
  if (content == null) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.append(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel, href, extra = {}) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.append(el);
  }
  el.setAttribute("href", href);
  for (const [k, v] of Object.entries(extra)) el.setAttribute(k, v);
}

export function pageTitle(title) {
  const tpl = site.seo?.titleTemplate || "%s";
  return title ? tpl.replace("%s", title) : site.firm.name;
}

/**
 * @param {string} pageId key in ROUTES / seo.pages
 * @param {{title?:string, description?:string, path?:string, noindex?:boolean}} overrides
 */
export function applySeo(pageId, overrides = {}) {
  const cfg = site.seo?.pages?.[pageId] || {};
  const rawTitle = overrides.title ?? cfg.title;
  const title = pageId === "home" && rawTitle ? rawTitle : pageTitle(rawTitle);
  const description = overrides.description || cfg.description || site.seo?.defaultDescription || "";
  const path = overrides.path ?? ROUTES[pageId] ?? "";
  const url = absoluteUrl(path);
  const image = site.website.ogImage ? absoluteUrl(site.website.ogImage) : "";

  document.title = title;
  document.documentElement.lang = site.website.language || "en";
  setMeta("name", "description", description);
  if (site.seo?.keywords?.length) setMeta("name", "keywords", site.seo.keywords.join(", "));
  setMeta("name", "theme-color", site.website.themeColor || "#0d1b2e");
  if (overrides.noindex) setMeta("name", "robots", "noindex");
  setLink("canonical", url);

  setMeta("property", "og:type", "website");
  setMeta("property", "og:site_name", site.firm.name);
  setMeta("property", "og:title", title);
  setMeta("property", "og:description", description);
  setMeta("property", "og:url", url);
  setMeta("property", "og:locale", site.website.locale || "en_IN");
  if (image) setMeta("property", "og:image", image);
  setMeta("name", "twitter:card", image ? "summary_large_image" : "summary");
  setMeta("name", "twitter:title", title);
  setMeta("name", "twitter:description", description);

  if (site.website.favicon) setLink("icon", site.website.favicon, { type: "image/svg+xml" });

  if (pageId === "home") injectStructuredData();
}

function injectStructuredData() {
  const sd = site.seo?.structuredData;
  if (!sd?.enabled || document.getElementById("ld-json")) return;
  const a = site.contact.address || {};
  const data = {
    "@context": "https://schema.org",
    "@type": sd.type || "AccountingService",
    name: site.firm.legalName || site.firm.name,
    url: absoluteUrl(""),
    logo: site.firm.logo?.src ? absoluteUrl(site.firm.logo.src) : undefined,
    image: site.website.ogImage ? absoluteUrl(site.website.ogImage) : undefined,
    description: site.seo?.defaultDescription,
    telephone: site.contact.phonePrimary ? `+${digits(site.contact.phonePrimary)}` : undefined,
    email: site.contact.emailPrimary || undefined,
    address: addressLines().length
      ? {
          "@type": "PostalAddress",
          streetAddress: [a.line1, a.line2].filter(Boolean).join(", "),
          addressLocality: a.city,
          addressRegion: a.state,
          postalCode: a.postalCode,
          addressCountry: a.country === "India" ? "IN" : a.country,
        }
      : undefined,
    areaServed: site.firm.locationsServed,
    founder: { "@type": "Person", name: caFullName(), jobTitle: site.profile.designation },
    hasMap: site.contact.mapsUrl || undefined,
  };
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.id = "ld-json";
  script.textContent = JSON.stringify(data);
  document.head.append(script);
}
