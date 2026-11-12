/**
 * Contact page: every contact method from site-data.js, office hours,
 * click-to-load map, FAQs and the enquiry form.
 *
 * The form NEVER reports success unless a configured third-party endpoint
 * returns an OK response. With no endpoint it is clearly marked as not
 * connected, and visitors can send the same message via WhatsApp or email.
 */
import { h, icon, link, when, section, sectionHead, pageHeader, reveal, contactMethods, addressBlock, hoursList, faqList } from "./content-renderer.js";
import { site, pageHref, enabledServices, findService, whatsappHref, mailHref, safeUrl, telHref, faqsFor } from "./config.js";

/* --------------------------------------------------------- Method cards */
function methodCards() {
  const c = site.contact;
  const cards = contactMethods().map((m) => ({ ...m }));
  if (c.phoneSecondary) {
    const i = cards.findIndex((x) => x.key === "call");
    cards.splice(i + 1, 0, { key: "call2", label: "Office line", value: c.phoneSecondary, href: telHref(c.phoneSecondary), icon: "phone", action: "Call the office" });
  }
  if (c.emailSecondary) cards.push({ key: "email2", label: "Email", value: c.emailSecondary, href: mailHref(c.emailSecondary, "Website enquiry"), icon: "mail", action: "Alternate email" });
  if (c.mapsUrl) cards.push({ key: "directions", label: "Directions", value: "Open in Google Maps", href: c.mapsUrl, icon: "navigation", action: "Get directions" });
  if (safeUrl(c.appointmentUrl)) cards.push({ key: "appointment", label: "Appointment", value: "Choose a time online", href: c.appointmentUrl, icon: "calendar", action: "Book an appointment" });

  return h(
    "ul",
    { class: "method-cards" },
    cards.map((m, i) =>
      reveal(
        h(
          "li",
          null,
          link(m.href, [
            h("span", { class: `method-card__icon method-card__icon--${m.key}` }, icon(m.icon, { size: 22 })),
            h("span", { class: "method-card__label" }, m.action),
            h("span", { class: "method-card__value" }, m.value),
          ], { className: "method-card" }),
        ),
        (i % 3) * 50,
      ),
    ),
  );
}

/* ------------------------------------------------------------------ Map */
function mapBlock() {
  const src = safeUrl(site.contact.mapsEmbedUrl);
  if (!src || !/^https:\/\//.test(src)) return null;
  const holder = h("div", { class: "map-embed" });
  const btn = h("button", { type: "button", class: "btn btn--outline" }, icon("map-pin", { size: 18 }), h("span", null, "Show map"));
  holder.append(h("div", { class: "map-embed__placeholder" }, h("p", null, "The map is loaded from Google Maps when you choose to show it."), btn));
  btn.addEventListener("click", () => {
    holder.replaceChildren(h("iframe", { src, title: `Map showing the location of ${site.firm.name}`, loading: "lazy", referrerpolicy: "no-referrer-when-downgrade", allowfullscreen: true }));
  });
  return holder;
}

/* ----------------------------------------------------------------- Form */
const FIELD_RULES = {
  name: { required: true, min: 2, msg: "Please enter your full name." },
  phone: { required: true, test: (v) => v.replace(/\D/g, "").length >= 10 && /^[+\d\s()-]+$/.test(v), msg: "Please enter a valid phone number (at least 10 digits)." },
  email: { required: false, test: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v), msg: "Please enter a valid email address." },
  company: { required: false },
  service: { required: false },
  message: { required: true, min: 10, msg: "Please describe your requirement in a few words (10+ characters)." },
  consent: { required: true, msg: "Please confirm you agree to the privacy policy." },
};

function field({ name, label, type = "text", required, autocomplete, hint, inputmode, options, rows }) {
  const id = `f-${name}`;
  const errId = `${id}-error`;
  const hintId = hint ? `${id}-hint` : null;
  let control;
  if (options) {
    control = h("select", { id, name, "aria-describedby": [hintId, errId].filter(Boolean).join(" ") }, options.map((o) => h("option", { value: o.value }, o.label)));
  } else if (type === "textarea") {
    control = h("textarea", { id, name, rows: rows || 5, required, "aria-required": required ? "true" : null, "aria-describedby": [hintId, errId].filter(Boolean).join(" "), maxlength: 2000 });
  } else {
    control = h("input", { id, name, type, required, autocomplete, inputmode, "aria-required": required ? "true" : null, "aria-describedby": [hintId, errId].filter(Boolean).join(" "), maxlength: 200 });
  }
  return h(
    "div",
    { class: `field field--${name}` },
    h("label", { for: id, class: "field__label" }, label, required ? h("span", { class: "field__req", "aria-hidden": "true" }, " *") : h("span", { class: "field__opt" }, " (optional)")),
    control,
    hint ? h("p", { id: hintId, class: "field__hint" }, hint) : null,
    h("p", { id: errId, class: "field__error", "aria-live": "polite" }),
  );
}

function buildForm() {
  const cfg = site.enquiryForm || {};
  const endpoint = /^https:\/\//.test(cfg.endpoint || "") ? cfg.endpoint : "";
  const connected = Boolean(endpoint);
  const preselect = findService(new URLSearchParams(location.search).get("service"));

  const serviceOptions = [
    { value: "", label: "Select a service" },
    ...enabledServices().map((s) => ({ value: s.name, label: s.name })),
    { value: "Other / not sure", label: "Other / not sure" },
  ];

  const consent = h(
    "div",
    { class: "field field--consent" },
    h(
      "label",
      { class: "checkbox" },
      h("input", { type: "checkbox", name: "consent", id: "f-consent", required: true, "aria-describedby": "f-consent-error" }),
      h("span", null, `${cfg.consentText || "I agree to the"} `, link(pageHref("privacy"), "privacy policy", { className: "text-link" }), "."),
    ),
    h("p", { id: "f-consent-error", class: "field__error", "aria-live": "polite" }),
  );

  const honeypotName = cfg.honeypotField || "_gotcha";
  const honeypot = h(
    "div",
    { class: "hp-field", "aria-hidden": "true" },
    h("label", { for: "f-hp" }, "Leave this field empty"),
    h("input", { id: "f-hp", type: "text", name: honeypotName, tabindex: "-1", autocomplete: "off" }),
  );

  const statusBox = h("div", { class: "form-status", role: "status", "aria-live": "polite", hidden: true });
  const submit = h(
    "button",
    { type: "submit", class: "btn btn--primary btn--lg", disabled: !connected, "aria-disabled": connected ? null : "true" },
    h("span", null, connected ? "Send enquiry" : "Online submission unavailable"),
  );

  const waBtn = site.contact.whatsapp ? h("button", { type: "button", class: "btn btn--whatsapp", dataset: { send: "whatsapp" } }, icon("whatsapp", { size: 18 }), h("span", null, "Send via WhatsApp")) : null;
  const mailBtn = site.contact.emailPrimary ? h("button", { type: "button", class: "btn btn--outline", dataset: { send: "email" } }, icon("mail", { size: 18 }), h("span", null, "Send via email")) : null;

  const notice = connected
    ? null
    : h("div", { class: "notice notice--info", role: "note" }, icon("info", { size: 20 }), h("p", null, cfg.notConnectedMessage));

  const form = h(
    "form",
    { class: "enquiry-form", novalidate: true, action: endpoint || null, method: "post", dataset: { connected: String(connected) } },
    notice,
    h(
      "div",
      { class: "form-grid" },
      field({ name: "name", label: "Full name", required: true, autocomplete: "name" }),
      field({ name: "phone", label: "Phone number", type: "tel", required: true, autocomplete: "tel", inputmode: "tel" }),
      field({ name: "email", label: "Email address", type: "email", autocomplete: "email" }),
      field({ name: "company", label: "Company / organisation", autocomplete: "organization" }),
      field({ name: "service", label: "Service required", options: serviceOptions }),
      field({ name: "message", label: "Your message", type: "textarea", required: true }),
    ),
    consent,
    honeypot,
    statusBox,
    h(
      "div",
      { class: "form-actions" },
      submit,
      waBtn || mailBtn ? h("div", { class: "form-alt" }, h("p", { class: "form-alt__label" }, connected ? "Or send the same message by:" : "Send your message by:"), h("div", { class: "form-alt__buttons" }, waBtn, mailBtn)) : null,
    ),
  );

  if (preselect) form.elements.service.value = preselect.name;
  wireForm(form, { cfg, endpoint, connected, honeypotName, statusBox, submit });
  return form;
}

function validateForm(form) {
  let firstInvalid = null;
  for (const [name, rule] of Object.entries(FIELD_RULES)) {
    const el = form.elements[name];
    if (!el) continue;
    const value = el.type === "checkbox" ? el.checked : String(el.value || "").trim();
    let ok = true;
    if (el.type === "checkbox") ok = !rule.required || value;
    else if (!value) ok = !rule.required;
    else if (rule.min && value.length < rule.min) ok = false;
    else if (rule.test && !rule.test(value)) ok = false;
    setError(el, ok ? "" : rule.msg);
    if (!ok && !firstInvalid) firstInvalid = el;
  }
  if (firstInvalid) firstInvalid.focus();
  return !firstInvalid;
}

function setError(el, msg) {
  const err = document.getElementById(`${el.id}-error`);
  if (err) err.textContent = msg;
  el.toggleAttribute("aria-invalid", Boolean(msg));
  el.closest(".field")?.classList.toggle("has-error", Boolean(msg));
}

function collect(form) {
  const v = (n) => String(form.elements[n]?.value || "").trim();
  return { name: v("name"), phone: v("phone"), email: v("email"), company: v("company"), service: v("service"), message: v("message") };
}

function composeMessage(d) {
  return [
    `Enquiry for ${site.firm.name}`,
    "",
    `Name: ${d.name}`,
    `Phone: ${d.phone}`,
    d.email && `Email: ${d.email}`,
    d.company && `Company: ${d.company}`,
    d.service && `Service: ${d.service}`,
    "",
    d.message,
  ]
    .filter((x) => x !== false && x !== "")
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");
}

function showStatus(box, type, text) {
  box.hidden = false;
  box.className = `form-status form-status--${type}`;
  box.replaceChildren(icon(type === "success" ? "check" : type === "error" ? "alert" : "info", { size: 20 }), h("p", null, text));
}

function wireForm(form, { cfg, endpoint, connected, honeypotName, statusBox, submit }) {
  // Live re-validation once a field has shown an error.
  form.addEventListener("input", (e) => {
    const el = e.target;
    if (el.closest(".has-error")) {
      const rule = FIELD_RULES[el.name];
      if (!rule) return;
      const value = el.type === "checkbox" ? el.checked : el.value.trim();
      const ok = el.type === "checkbox" ? value : (!rule.required && !value) || ((!rule.min || value.length >= rule.min) && (!rule.test || rule.test(value)));
      if (ok) setError(el, "");
    }
  });

  // WhatsApp / email fallback: opens the visitor's own app; nothing is "submitted".
  form.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-send]");
    if (!btn) return;
    if (!validateForm(form)) return;
    const data = collect(form);
    const text = composeMessage(data);
    const href = btn.dataset.send === "whatsapp" ? whatsappHref(text) : mailHref(site.contact.emailPrimary, `Enquiry${data.service ? `: ${data.service}` : ""} (${data.name})`, text);
    if (btn.dataset.send === "whatsapp") window.open(href, "_blank", "noopener");
    else window.location.href = href;
    showStatus(statusBox, "info", btn.dataset.send === "whatsapp"
      ? "WhatsApp has been opened with your message. Please press send in WhatsApp to deliver it."
      : "Your email app has been opened with your message. Please press send in your email app to deliver it.");
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!connected) {
      showStatus(statusBox, "info", cfg.notConnectedMessage);
      return;
    }
    if (!validateForm(form)) return;
    if (form.elements[honeypotName]?.value) return; // bot: silently ignore, never claim success

    const data = { ...collect(form), consent: "yes", ...(cfg.extraFields || {}) };
    submit.disabled = true;
    form.setAttribute("aria-busy", "true");
    submit.querySelector("span").textContent = "Sending…";
    try {
      const isJson = cfg.format !== "form";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: isJson ? { "Content-Type": "application/json", Accept: "application/json" } : { Accept: "application/json" },
        body: isJson ? JSON.stringify(data) : new URLSearchParams(data),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      form.reset();
      showStatus(statusBox, "success", cfg.successMessage || "Thank you, your enquiry has been sent.");
    } catch (err) {
      console.warn("Enquiry submission failed:", err);
      showStatus(statusBox, "error", cfg.errorMessage || "Sorry, your enquiry could not be sent.");
    } finally {
      submit.disabled = false;
      form.removeAttribute("aria-busy");
      submit.querySelector("span").textContent = "Send enquiry";
    }
  });
}

/* ----------------------------------------------------------------- Page */
export function renderContact(main) {
  const c = site.pages?.contact || {};
  const faqs = faqList(faqsFor("contact"));

  const formHead = sectionHead({ eyebrow: "Enquiry", title: c.formTitle, intro: c.formIntro });
  const visit = h(
    "aside",
    { class: "visit-card" },
    h("h2", { class: "visit-card__title" }, icon("map-pin", { size: 20 }), "Office"),
    addressBlock(),
    site.contact.mapsUrl ? link(site.contact.mapsUrl, ["Get directions", icon("arrow-up-right", { size: 16 })], { className: "text-link" }) : null,
    h("h2", { class: "visit-card__title" }, icon("clock", { size: 20 }), c.hoursTitle || "Office hours"),
    hoursList(),
    when(site.contact.hoursNote, () => h("p", { class: "visit-card__note" }, site.contact.hoursNote)),
    mapBlock(),
  );

  const faqHead = sectionHead({ eyebrow: "FAQ", title: c.faqTitle || "Questions" });

  main.replaceChildren(
    pageHeader({ eyebrow: c.eyebrow, title: c.title || "Contact", lead: c.intro, crumbs: [{ label: "Contact" }] }),
    h("section", { class: "section section--tight contact-methods", "aria-label": "Ways to contact us" }, h("div", { class: "container" }, methodCards())),
    section(
      { className: "contact-main", tone: "paper", labelledBy: formHead.headingId },
      h("div", { class: "contact-layout" }, h("div", { class: "form-card" }, formHead, buildForm()), visit),
    ),
    faqs ? section({ className: "faq-section", labelledBy: faqHead.headingId }, h("div", { class: "split" }, reveal(faqHead), faqs)) : null,
  );
}
