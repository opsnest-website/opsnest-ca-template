/**
 * Content renderer: a tiny DOM builder plus shared UI components.
 *
 * All configurable text is inserted with textContent / attributes; never as
 * HTML. That keeps the site safe even if site-data.js contains "<" or quotes.
 */
import { icon } from "./icons.js";
import {
  site,
  safeUrl,
  isExternal,
  hasText,
  isDraft,
  telHref,
  whatsappHref,
  mailHref,
  addressLines,
  pageHref,
} from "./config.js";

/* ------------------------------------------------------------- h() */
export function h(tag, props, ...children) {
  const el = document.createElement(tag);
  if (props) {
    for (const [k, v] of Object.entries(props)) {
      if (v == null || v === false) continue;
      if (k === "class") el.className = v;
      else if (k === "dataset") Object.assign(el.dataset, v);
      else if (k === "style" && typeof v === "object") Object.assign(el.style, v);
      else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === "href" || k === "src" || k === "action") {
        const url = safeUrl(v);
        if (url) el.setAttribute(k, url);
      } else if (v === true) el.setAttribute(k, "");
      else el.setAttribute(k, String(v));
    }
  }
  appendChildren(el, children);
  return el;
}

export function appendChildren(el, children) {
  for (const c of children.flat(Infinity)) {
    if (c == null || c === false || c === "") continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

/** Render only when the value has content. */
export const when = (cond, fn) => (hasText(cond) ? fn() : null);

export { icon };

/* ------------------------------------------------------------ Primitives */
export function link(href, children, { className = "", label, external } = {}) {
  const url = safeUrl(href);
  const ext = external ?? isExternal(url);
  return h(
    "a",
    {
      href: url,
      class: className || null,
      "aria-label": label || null,
      target: ext ? "_blank" : null,
      rel: ext ? "noopener noreferrer" : null,
    },
    children,
  );
}

export function button(href, label, { variant = "primary", iconName, iconAfter = "arrow-right", size, ariaLabel } = {}) {
  if (!href) return null;
  const cls = ["btn", `btn--${variant}`, size ? `btn--${size}` : ""].filter(Boolean).join(" ");
  return link(
    href,
    [iconName ? icon(iconName, { size: 18 }) : null, h("span", null, label), iconAfter ? icon(iconAfter, { size: 18, className: "btn__arrow" }) : null],
    { className: cls, label: ariaLabel },
  );
}

export function img(src, alt, { width, height, className, eager = false, sizes } = {}) {
  if (!src) return null;
  return h("img", {
    src,
    alt: alt || "",
    width,
    height,
    class: className,
    loading: eager ? "eager" : "lazy",
    decoding: "async",
    fetchpriority: eager ? "high" : null,
    sizes,
  });
}

export const paragraphs = (items, className) =>
  (Array.isArray(items) ? items : [items]).filter(hasText).map((p) => h("p", { class: className }, p));

export function checkList(items, className = "check-list") {
  const list = (items || []).filter(hasText);
  if (!list.length) return null;
  return h(
    "ul",
    { class: className },
    list.map((i) => h("li", null, icon("check", { size: 18, className: "check-list__icon" }), h("span", null, i))),
  );
}

/** "Unverified sample" tag shown only in draft mode next to unverified claims. */
export function verifyTag(item) {
  if (!isDraft() || !item || item.verified === true) return null;
  return h("span", { class: "tag tag--unverified", title: "Shown only in draft mode. Mark verified: true in site-data.js after review." }, "Unverified sample");
}

export function iconBadge(name, variant = "") {
  return h("span", { class: `icon-badge ${variant ? `icon-badge--${variant}` : ""}`.trim() }, icon(name || "dot", { size: 22 }));
}

/* -------------------------------------------------------------- Sections */
export function section({ id, className = "", tone, labelledBy }, ...children) {
  return h(
    "section",
    { id, class: `section ${tone ? `section--${tone}` : ""} ${className}`.trim(), "aria-labelledby": labelledBy },
    h("div", { class: "container" }, children),
  );
}

let headingSeq = 0;
export function sectionHead({ eyebrow, title, intro, align = "left", level = "h2", action } = {}) {
  const id = `h-${++headingSeq}`;
  const head = h(
    "header",
    { class: `section-head section-head--${align}` },
    h(
      "div",
      { class: "section-head__text" },
      when(eyebrow, () => h("p", { class: "eyebrow" }, eyebrow)),
      when(title, () => h(level, { id, class: "section-title" }, title)),
      when(intro, () => h("p", { class: "section-intro" }, intro)),
    ),
    action || null,
  );
  head.headingId = hasText(title) ? id : null;
  return head;
}

/** Inner-page header band with breadcrumb. */
export function pageHeader({ eyebrow, title, lead, crumbs = [], aside }) {
  return h(
    "section",
    { class: "page-header" },
    h(
      "div",
      { class: "container page-header__inner" },
      h(
        "div",
        { class: "page-header__text" },
        crumbs.length
          ? h(
              "nav",
              { class: "breadcrumb", "aria-label": "Breadcrumb" },
              h(
                "ol",
                null,
                h("li", null, link(pageHref("home"), "Home")),
                crumbs.map((c, i) =>
                  h("li", null, i === crumbs.length - 1 ? h("span", { "aria-current": "page" }, c.label) : link(c.href, c.label)),
                ),
              ),
            )
          : null,
        when(eyebrow, () => h("p", { class: "eyebrow eyebrow--light" }, eyebrow)),
        h("h1", { class: "page-title" }, title),
        when(lead, () => h("p", { class: "page-lead" }, lead)),
      ),
      aside || null,
    ),
  );
}

/* ------------------------------------------------------- Contact methods */
/**
 * Every way to reach the office, derived only from site.contact.
 * Each item: { key, label, value, href, icon, external }.
 */
export function contactMethods({ serviceName } = {}) {
  const c = site.contact || {};
  const methods = [];
  if (c.phonePrimary)
    methods.push({ key: "call", label: "Call", value: c.phonePrimary, href: telHref(c.phonePrimary), icon: "phone", action: "Call now" });
  if (c.whatsapp) {
    const msg = serviceName ? `Hello, I would like to enquire about ${serviceName}.` : undefined;
    methods.push({ key: "whatsapp", label: "WhatsApp", value: c.whatsapp, href: whatsappHref(msg), icon: "whatsapp", action: "Message on WhatsApp", external: true });
  }
  if (c.emailPrimary) {
    const subject = serviceName ? `Enquiry: ${serviceName}` : "Website enquiry";
    methods.push({ key: "email", label: "Email", value: c.emailPrimary, href: mailHref(c.emailPrimary, subject), icon: "mail", action: "Send an email" });
  }
  return methods;
}

/** Compact row of contact buttons (hero, CTAs, service pages). */
export function contactButtons({ serviceName, variant = "light", include = ["call", "whatsapp", "email"] } = {}) {
  const methods = contactMethods({ serviceName }).filter((m) => include.includes(m.key));
  if (!methods.length) return null;
  return h(
    "div",
    { class: "contact-buttons" },
    methods.map((m) => button(m.href, m.action, { variant: m.key === "whatsapp" ? "whatsapp" : variant, iconName: m.icon, iconAfter: null })),
  );
}

export function addressBlock({ className = "address" } = {}) {
  const lines = addressLines();
  if (!lines.length) return null;
  return h("address", { class: className }, lines.map((l, i) => [i ? h("br") : null, l]));
}

export function hoursList(className = "hours") {
  const hours = (site.contact?.hours || []).filter((r) => hasText(r.days));
  if (!hours.length) return null;
  return h(
    "dl",
    { class: className },
    hours.map((r) => h("div", { class: "hours__row" }, h("dt", null, r.days), h("dd", null, r.time))),
  );
}

/* --------------------------------------------------------------- FAQ list */
export function faqList(faqs) {
  if (!faqs?.length) return null;
  return h(
    "div",
    { class: "faq" },
    faqs.map((f) =>
      h(
        "details",
        { class: "faq__item" },
        h("summary", { class: "faq__q" }, h("span", null, f.question), icon("plus", { size: 20, className: "faq__icon" })),
        h("div", { class: "faq__a" }, paragraphs(f.answer)),
      ),
    ),
  );
}

/* --------------------------------------------------------------- CTA band */
export function ctaBand({ eyebrow, title, text, serviceName } = {}) {
  const head = sectionHead({ eyebrow, title, intro: text });
  return h(
    "section",
    { class: "cta-band", "aria-labelledby": head.headingId },
    h(
      "div",
      { class: "container cta-band__inner" },
      head,
      h(
        "div",
        { class: "cta-band__actions" },
        contactButtons({ serviceName, variant: "light" }),
        h("p", { class: "cta-band__more" }, link(pageHref("contact"), ["All contact options", icon("arrow-right", { size: 16 })], { className: "text-link text-link--light" })),
      ),
    ),
  );
}

/* --------------------------------------------------- Reveal on scroll */
export function enableReveal(root = document) {
  const items = root.querySelectorAll("[data-reveal]");
  if (!items.length) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
  );
  items.forEach((el) => io.observe(el));
}

/** Mark an element for reveal animation and return it. */
export function reveal(el, delay = 0) {
  if (!el) return el;
  el.setAttribute("data-reveal", "");
  if (delay) el.style.setProperty("--reveal-delay", `${delay}ms`);
  return el;
}
