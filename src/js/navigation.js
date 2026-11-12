/**
 * Site chrome shared by every page: draft ribbon, header + mobile menu,
 * footer, floating mobile contact buttons and the entry disclaimer.
 */
import { h, link, icon, img, button, addressBlock, contactMethods, paragraphs, when } from "./content-renderer.js";
import { site, pageHref, isDraft, activeCategories, telHref, whatsappHref, mailHref, hasText, safeUrl } from "./config.js";

const NAV = [
  { id: "home", label: "Home" },
  { id: "about", label: "About the CA" },
  { id: "firm", label: "Our Firm" },
  { id: "services", label: "Services", match: ["services", "service"] },
  { id: "contact", label: "Contact" },
];

const isActive = (item, page) => (item.match || [item.id]).includes(page);

/* ----------------------------------------------------------------- Brand */
function brand({ light = false } = {}) {
  const logo = site.firm.logo || {};
  const mark = logo.src
    ? img(logo.src, "", { width: 44, height: 44, className: "brand__logo", eager: true })
    : h("span", { class: "brand__monogram", "aria-hidden": "true" }, (site.firm.name || "?").trim().charAt(0));
  return link(
    pageHref("home"),
    [
      mark,
      h(
        "span",
        { class: "brand__text" },
        h("span", { class: "brand__name" }, site.firm.name),
        when(site.firm.tagline, () => h("span", { class: "brand__tag" }, site.firm.tagline)),
      ),
    ],
    { className: `brand ${light ? "brand--light" : ""}`.trim(), label: `${site.firm.name}: home` },
  );
}

/* --------------------------------------------------------------- Ribbon */
function draftRibbon() {
  if (!isDraft()) return null;
  return h(
    "div",
    { class: "draft-ribbon", role: "note" },
    h("div", { class: "container draft-ribbon__inner" }, icon("info", { size: 16 }), h("span", null, site.website.draftNotice || "Draft preview: sample content.")),
  );
}

/* ---------------------------------------------------------------- Header */
export function renderHeader(page) {
  const mount = document.getElementById("site-header");
  if (!mount) return;
  const menuId = "mobile-menu";

  const navList = (cls) =>
    h(
      "ul",
      { class: cls },
      NAV.map((item) =>
        h(
          "li",
          null,
          h("a", { href: pageHref(item.id), class: "nav-link", "aria-current": isActive(item, page) ? "page" : null }, item.label),
        ),
      ),
    );

  const phone = site.contact.phonePrimary;
  const toggle = h(
    "button",
    { class: "menu-toggle", type: "button", "aria-expanded": "false", "aria-controls": menuId, "aria-label": "Open menu" },
    icon("menu", { size: 24, className: "menu-toggle__open" }),
    icon("close", { size: 24, className: "menu-toggle__close" }),
  );

  const mobileContacts = contactMethods().map((m) =>
    link(m.href, [icon(m.icon, { size: 20 }), h("span", null, m.label)], { className: `mobile-menu__contact mobile-menu__contact--${m.key}` }),
  );

  const mobileMenu = h(
    "div",
    { id: menuId, class: "mobile-menu", hidden: true },
    h(
      "div",
      { class: "container mobile-menu__inner" },
      h("nav", { "aria-label": "Mobile" }, navList("mobile-menu__list")),
      mobileContacts.length ? h("div", { class: "mobile-menu__contacts" }, mobileContacts) : null,
      addressBlock({ className: "mobile-menu__address" }),
    ),
  );

  const header = h(
    "div",
    { class: "site-header__bar" },
    h(
      "div",
      { class: "container site-header__inner" },
      brand(),
      h("nav", { class: "primary-nav", "aria-label": "Primary" }, navList("primary-nav__list")),
      h(
        "div",
        { class: "header-actions" },
        phone ? link(telHref(phone), [icon("phone", { size: 16 }), h("span", null, phone)], { className: "header-phone" }) : null,
        button(pageHref("contact"), "Contact us", { variant: "primary", size: "sm", iconAfter: null }),
      ),
      toggle,
    ),
  );

  mount.replaceChildren(draftRibbon() || "", header, mobileMenu);
  mount.classList.add("site-header");
  wireMobileMenu(toggle, mobileMenu);
  wireScrollState(mount);
}

function wireMobileMenu(toggle, menu) {
  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if (open) {
      const bar = menu.parentElement.querySelector(".site-header__bar");
      menu.style.setProperty("--menu-top", `${Math.round(bar.getBoundingClientRect().bottom)}px`);
    }
    menu.hidden = !open;
    document.body.classList.toggle("menu-open", open);
    if (open) menu.querySelector("a")?.focus();
  };
  toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
  menu.addEventListener("click", (e) => {
    if (e.target.closest("a")) setOpen(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      setOpen(false);
      toggle.focus();
    }
  });
  window.matchMedia("(min-width: 1024px)").addEventListener("change", (e) => {
    if (e.matches) setOpen(false);
  });
}

function wireScrollState(header) {
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  // Expose the sticky header height (ribbon + bar) to CSS for sticky offsets.
  const bar = header.querySelector(".site-header__bar");
  const measure = () => {
    const bottom = bar.getBoundingClientRect().bottom - header.getBoundingClientRect().top;
    document.documentElement.style.setProperty("--sticky-top", `${Math.round(bottom)}px`);
  };
  measure();
  if ("ResizeObserver" in window) new ResizeObserver(measure).observe(bar);
}

/* ---------------------------------------------------------------- Footer */
export function renderFooter() {
  const mount = document.getElementById("site-footer");
  if (!mount) return;
  const c = site.contact;
  const f = site.footer || {};
  const socials = (site.social || []).filter((s) => safeUrl(s.url));

  const col = (title, ...children) => h("div", { class: "footer-col" }, h("h2", { class: "footer-col__title" }, title), children);

  const footer = h(
    "div",
    { class: "container" },
    h(
      "div",
      { class: "footer-grid" },
      h(
        "div",
        { class: "footer-brand" },
        brand({ light: true }),
        when(f.blurb, () => h("p", { class: "footer-blurb" }, f.blurb)),
        socials.length
          ? h(
              "ul",
              { class: "social-list" },
              socials.map((s) => h("li", null, link(s.url, icon(s.icon || "globe", { size: 18 }), { className: "social-link", label: s.label }))),
            )
          : null,
      ),
      col(
        "Navigate",
        h(
          "ul",
          { class: "footer-links" },
          NAV.map((n) => h("li", null, link(pageHref(n.id), n.label))),
        ),
      ),
      col(
        "Services",
        h(
          "ul",
          { class: "footer-links" },
          activeCategories().map((cat) => h("li", null, link(pageHref("services", { category: cat.id }), cat.name))),
        ),
      ),
      col(
        "Office",
        addressBlock({ className: "footer-address" }),
        h(
          "ul",
          { class: "footer-contact" },
          c.phonePrimary ? h("li", null, link(telHref(c.phonePrimary), [icon("phone", { size: 16 }), c.phonePrimary])) : null,
          c.phoneSecondary ? h("li", null, link(telHref(c.phoneSecondary), [icon("phone", { size: 16 }), c.phoneSecondary])) : null,
          c.whatsapp ? h("li", null, link(whatsappHref(), [icon("whatsapp", { size: 16 }), "WhatsApp"])) : null,
          c.emailPrimary ? h("li", null, link(mailHref(c.emailPrimary), [icon("mail", { size: 16 }), c.emailPrimary])) : null,
        ),
      ),
    ),
    h(
      "div",
      { class: "footer-bottom" },
      h("p", null, f.copyright || `© ${new Date().getFullYear()} ${site.firm.name}`),
      h(
        "ul",
        { class: "footer-legal" },
        h("li", null, link(pageHref("privacy"), "Privacy policy")),
        h("li", null, link(pageHref("disclaimer"), "Disclaimer")),
      ),
      when(f.note, () => h("p", { class: "footer-note" }, f.note)),
    ),
  );
  mount.replaceChildren(footer);
  mount.classList.add("site-footer");
}

/* ------------------------------------------------ Floating mobile actions */
export function renderFloatingContact(page) {
  if (page === "contact") return;
  const c = site.contact;
  const items = [];
  if (c.whatsapp) items.push(link(whatsappHref(), icon("whatsapp", { size: 24 }), { className: "fab fab--whatsapp", label: "Message on WhatsApp" }));
  if (c.phonePrimary) items.push(link(telHref(c.phonePrimary), icon("phone", { size: 22 }), { className: "fab fab--call", label: `Call ${c.phonePrimary}` }));
  if (!items.length) return;
  document.body.append(h("div", { class: "fab-group" }, items));
  document.body.classList.add("has-fab");
}

/* ----------------------------------------------------- Entry disclaimer */
const DISCLAIMER_KEY = "entry-disclaimer-accepted";

function readAccepted(days) {
  try {
    const ts = Number(localStorage.getItem(DISCLAIMER_KEY));
    return ts && Date.now() - ts < days * 86400000;
  } catch {
    return false;
  }
}

export function renderEntryDisclaimer(page) {
  const d = site.website.entryDisclaimer;
  if (!d?.enabled || page === "disclaimer" || page === "privacy") return;
  if (readAccepted(d.rememberDays || 30)) return;
  if (typeof HTMLDialogElement !== "function") return;

  const accept = h("button", { type: "button", class: "btn btn--primary" }, d.acceptLabel || "I agree");
  const dialog = h(
    "dialog",
    { class: "entry-dialog", "aria-labelledby": "entry-dialog-title" },
    h(
      "div",
      { class: "entry-dialog__body" },
      h("p", { class: "eyebrow" }, site.firm.legalName || site.firm.name),
      h("h2", { id: "entry-dialog-title", class: "entry-dialog__title" }, d.title || "Disclaimer"),
      paragraphs(d.paragraphs),
      h(
        "div",
        { class: "entry-dialog__actions" },
        accept,
        hasText(d.declineUrl) ? link(d.declineUrl, d.declineLabel || "Leave", { className: "btn btn--ghost", external: false }) : null,
      ),
      h("p", { class: "entry-dialog__more" }, link(pageHref("disclaimer"), "Read the full disclaimer", { className: "text-link" })),
    ),
  );
  accept.addEventListener("click", () => {
    try {
      localStorage.setItem(DISCLAIMER_KEY, String(Date.now()));
    } catch {
      /* storage unavailable: ask again next visit */
    }
    dialog.close();
  });
  // Esc should not silently dismiss a required acknowledgement.
  dialog.addEventListener("cancel", (e) => e.preventDefault());
  dialog.addEventListener("close", () => dialog.remove());
  document.body.append(dialog);
  dialog.showModal();
  accept.focus();
}
