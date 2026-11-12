/**
 * Configuration layer: reads site-data.js, fills tokens, validates, and
 * exposes derived values (enabled services, contact links, URLs) so that
 * UI modules never reach into raw data or repeat formatting logic.
 */
import rawData from "../data/site-data.js";

/* ---------------------------------------------------------------- Routes
 * Page ids → file names. Structural only; no business content here.
 * Links are written relative to the site folder, so the same files work
 * under "/ca/" and under "/" without rewriting.
 */
export const ROUTES = {
  home: "index.html",
  about: "about.html",
  firm: "firm.html",
  services: "services.html",
  service: "service.html",
  contact: "contact.html",
  privacy: "privacy.html",
  disclaimer: "disclaimer.html",
  notFound: "404.html",
};

/* ---------------------------------------------------------------- Tokens */
function buildTokens(d) {
  const p = d.profile || {};
  const f = d.firm || {};
  const c = d.contact || {};
  return {
    firm: f.name || "",
    firmLegal: f.legalName || f.name || "",
    ca: [p.prefix, p.name].filter(Boolean).join(" "),
    caName: p.name || "",
    designation: p.designation || "",
    city: c.address?.city || "",
    email: c.emailPrimary || "",
    phone: c.phonePrimary || "",
    website: `${d.website?.siteUrl || ""}${d.website?.basePath || "/"}`,
    year: String(new Date().getFullYear()),
  };
}

function fillTokens(value, tokens) {
  if (typeof value === "string") {
    return value.replace(/\{(\w+)\}/g, (m, k) => (k in tokens ? tokens[k] : m));
  }
  if (Array.isArray(value)) return value.map((v) => fillTokens(v, tokens));
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = fillTokens(v, tokens);
    return out;
  }
  return value;
}

/* ------------------------------------------------------------ Validation */
const warnings = [];
function warn(msg) {
  warnings.push(msg);
}

function validate(d) {
  const req = [
    ["website.siteUrl", d.website?.siteUrl],
    ["website.basePath", d.website?.basePath],
    ["profile.name", d.profile?.name],
    ["firm.name", d.firm?.name],
    ["contact.phonePrimary or contact.emailPrimary", d.contact?.phonePrimary || d.contact?.emailPrimary],
  ];
  for (const [path, v] of req) if (!v) warn(`Missing required value: ${path}`);

  const bp = d.website?.basePath || "";
  if (bp && !(bp.startsWith("/") && bp.endsWith("/"))) warn(`website.basePath must start and end with "/" (got "${bp}")`);
  if (d.website?.siteUrl?.endsWith("/")) warn("website.siteUrl should not end with '/'");

  const catIds = new Set((d.categories || []).map((c) => c.id));
  const seen = new Set();
  for (const s of d.services || []) {
    if (!s.id) warn(`A service is missing an id: "${s.name}"`);
    else if (!/^[a-z0-9-]+$/.test(s.id)) warn(`Service id "${s.id}" should use lowercase letters, numbers and hyphens only`);
    if (seen.has(s.id)) warn(`Duplicate service id: "${s.id}"`);
    seen.add(s.id);
    if (!catIds.has(s.category)) warn(`Service "${s.id}" has unknown category "${s.category}"`);
    if (!s.name) warn(`Service "${s.id}" is missing a name`);
  }
  for (const key of ["phonePrimary", "phoneSecondary", "whatsapp"]) {
    const v = d.contact?.[key];
    if (v && digits(v).length < 10) warn(`contact.${key} looks too short: "${v}"`);
  }
  if (d.enquiryForm?.endpoint && !/^https:\/\//.test(d.enquiryForm.endpoint)) {
    warn("enquiryForm.endpoint must be an https:// URL");
  }
  // Absolute image paths break sub-path hosting.
  const imgs = [d.profile?.photograph?.src, d.firm?.logo?.src, d.website?.favicon, d.website?.ogImage];
  for (const src of imgs) if (src && src.startsWith("/")) warn(`Image path "${src}" should not start with "/"`);
}

/* ---------------------------------------------------------------- Export */
const tokens = buildTokens(rawData);
export const site = fillTokens(rawData, tokens);
validate(site);
if (warnings.length) {
  console.groupCollapsed(`[site-data] ${warnings.length} configuration warning(s)`);
  warnings.forEach((w) => console.warn(w));
  console.groupEnd();
}
export const configWarnings = warnings;

/* -------------------------------------------------------------- Helpers */
export const isDraft = () => Boolean(site.website?.draftMode);

/** Should a professional claim be shown? Verified always; unverified only in draft mode. */
export const isPublishable = (item) => Boolean(item) && (item.verified === true || isDraft());

export function digits(v) {
  return String(v || "").replace(/\D/g, "");
}

export function hasText(v) {
  if (Array.isArray(v)) return v.some(hasText);
  return typeof v === "string" ? v.trim().length > 0 : v != null && v !== false;
}

/** Allow only http(s), mailto, tel and relative URLs from configuration. */
export function safeUrl(url) {
  const u = String(url || "").trim();
  if (!u) return "";
  if (/^(https?:|mailto:|tel:)/i.test(u)) return u;
  if (/^[a-z][a-z0-9+.-]*:/i.test(u)) return ""; // javascript:, data:, etc.
  return u;
}

export const isExternal = (url) => /^https?:\/\//i.test(url || "");

/** Internal page link (relative, sub-path safe). */
export function pageHref(id, params) {
  let href = ROUTES[id] || id;
  if (id === "home") href = "./";
  if (params) {
    const qs = new URLSearchParams(params).toString();
    if (qs) href += (href.includes("?") ? "&" : "?") + qs;
  }
  return href;
}

/** Absolute public URL for canonical / OG / sitemap. */
export function absoluteUrl(path = "") {
  const origin = (site.website.siteUrl || "").replace(/\/$/, "");
  const base = site.website.basePath || "/";
  if (isExternal(path)) return path;
  const clean = String(path).replace(/^\.?\//, "");
  return origin + base + (clean === "index.html" ? "" : clean);
}

export function serviceHref(id) {
  return pageHref("service", { id });
}

/* ------------------------------------------------------- Contact helpers */
export function telHref(number) {
  const d = digits(number);
  if (!d) return "";
  return `tel:${String(number).trim().startsWith("+") ? "+" : ""}${d}`;
}

export function whatsappHref(message) {
  const d = digits(site.contact?.whatsapp);
  if (!d) return "";
  const text = message ?? site.contact?.whatsappGreeting ?? "";
  return `https://wa.me/${d}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export function mailHref(email, subject, body) {
  if (!email) return "";
  const params = [];
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  return `mailto:${email}${params.length ? `?${params.join("&")}` : ""}`;
}

export function addressLines() {
  const a = site.contact?.address || {};
  const cityLine = [a.city, a.state].filter(Boolean).join(", ") + (a.postalCode ? ` ${a.postalCode}` : "");
  return [a.line1, a.line2, cityLine.trim(), a.country, a.landmark].filter(hasText);
}

export const caFullName = () => [site.profile.prefix, site.profile.name].filter(Boolean).join(" ");

/* ------------------------------------------------------ Content getters */
const byOrder = (a, b) => (a.order ?? 999) - (b.order ?? 999);

export function enabledServices() {
  return (site.services || []).filter((s) => s.enabled !== false && s.id && s.name).sort(byOrder);
}

export function findService(id) {
  return enabledServices().find((s) => s.id === id) || null;
}

/** Categories that have at least one enabled service, in display order. */
export function activeCategories() {
  const services = enabledServices();
  return (site.categories || [])
    .filter((c) => services.some((s) => s.category === c.id))
    .sort(byOrder)
    .map((c) => ({ ...c, services: services.filter((s) => s.category === c.id) }));
}

export function categoryById(id) {
  return (site.categories || []).find((c) => c.id === id) || null;
}

export function faqsFor(page) {
  return (site.faqs || []).filter((f) => f.enabled !== false && (!f.pages || f.pages.includes(page)));
}

export function teamMembers() {
  const team = site.firm?.team;
  if (!team || team.enabled === false) return [];
  return (team.members || [])
    .filter((m) => m.enabled !== false)
    .map((m) =>
      m.useProfile
        ? {
            name: caFullName(),
            role: site.profile.roleAtFirm,
            photo: site.profile.photograph?.src,
            linkedin: site.profile.links?.find((l) => l.icon === "linkedin")?.url || "",
            ...Object.fromEntries(Object.entries(m).filter(([, v]) => hasText(v))),
          }
        : m,
    );
}

export function testimonials() {
  const t = site.testimonials;
  if (!t || !t.enabled) return [];
  return (t.items || []).filter((i) => i.consentOnFile && isPublishable(i));
}

export function achievements() {
  const a = site.profile?.achievements;
  if (!a || !a.enabled) return [];
  return (a.items || []).filter(isPublishable);
}
