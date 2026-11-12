/**
 * Services listing (services.html) and service detail (service.html?id=...).
 * Both render any number of services/categories from site-data.js; adding a
 * service never requires touching this file.
 */
import { h, icon, link, button, when, paragraphs, checkList, section, sectionHead, pageHeader, reveal, iconBadge, faqList, contactButtons, ctaBand } from "./content-renderer.js";
import { site, pageHref, serviceHref, activeCategories, findService, categoryById, enabledServices, faqsFor } from "./config.js";
import { applySeo } from "./seo.js";

/* ----------------------------------------------------------- Service card */
export function serviceCard(svc) {
  return h(
    "article",
    { class: "service-card", dataset: { category: svc.category } },
    iconBadge(svc.icon),
    h("h3", { class: "service-card__title" }, link(serviceHref(svc.id), svc.name, { className: "service-card__link" })),
    h("p", { class: "service-card__desc" }, svc.shortDescription),
    svc.targetAudience?.length ? h("p", { class: "service-card__for" }, h("span", null, "For: "), svc.targetAudience.slice(0, 3).join(", ")) : null,
    h("span", { class: "service-card__more", "aria-hidden": "true" }, "View details", icon("arrow-right", { size: 16 })),
  );
}

/* --------------------------------------------------------- Services page */
export function renderServices(main) {
  const c = site.pages?.services || {};
  const cats = activeCategories();
  const params = new URLSearchParams(location.search);
  let active = cats.some((x) => x.id === params.get("category")) ? params.get("category") : "all";

  const chips = [{ id: "all", name: c.allLabel || "All" }, ...cats].map((cat) =>
    h("button", { type: "button", class: "filter-chip", "aria-pressed": String(cat.id === active), dataset: { filter: cat.id } }, cat.name),
  );
  const status = h("p", { class: "visually-hidden", role: "status", "aria-live": "polite" });

  const groups = cats.map((cat) =>
    h(
      "section",
      { class: "service-group", id: `category-${cat.id}`, dataset: { category: cat.id }, "aria-labelledby": `cat-${cat.id}` },
      h(
        "header",
        { class: "service-group__head" },
        h("span", { class: "service-group__icon" }, icon(cat.icon, { size: 22 })),
        h("div", null, h("h2", { id: `cat-${cat.id}`, class: "service-group__title" }, cat.name), when(cat.description, () => h("p", { class: "service-group__desc" }, cat.description))),
        h("span", { class: "service-group__count" }, `${cat.services.length} ${cat.services.length === 1 ? "service" : "services"}`),
      ),
      h("div", { class: "service-grid" }, cat.services.map((s) => serviceCard(s))),
    ),
  );

  const apply = (id, announce = true) => {
    active = id;
    chips.forEach((ch) => ch.setAttribute("aria-pressed", String(ch.dataset.filter === id)));
    groups.forEach((g) => (g.hidden = id !== "all" && g.dataset.category !== id));
    const count = id === "all" ? enabledServices().length : cats.find((x) => x.id === id)?.services.length || 0;
    if (announce) status.textContent = `Showing ${count} ${count === 1 ? "service" : "services"}`;
    const url = new URL(location.href);
    if (id === "all") url.searchParams.delete("category");
    else url.searchParams.set("category", id);
    history.replaceState(null, "", url);
  };
  chips.forEach((ch) => ch.addEventListener("click", () => apply(ch.dataset.filter)));

  const faqs = faqsFor("services");
  const faqHead = sectionHead({ eyebrow: "FAQ", title: c.faqTitle || "Common questions" });

  main.replaceChildren(
    pageHeader({ eyebrow: c.eyebrow, title: c.title || "Services", lead: c.intro, crumbs: [{ label: "Services" }] }),
    h(
      "section",
      { class: "section services-list", "aria-label": "Services by category" },
      h(
        "div",
        { class: "container" },
        cats.length > 1 ? h("div", { class: "filter-bar", role: "group", "aria-label": "Filter services by category" }, chips) : null,
        status,
        groups.length ? groups : h("p", null, "Service information will be available soon."),
      ),
    ),
    faqs.length ? section({ className: "faq-section", tone: "paper", labelledBy: faqHead.headingId }, h("div", { class: "split" }, reveal(faqHead), faqList(faqs))) : null,
    ctaBand({ eyebrow: "Enquiries", title: "Not sure which service you need?", text: "Describe your situation and we'll point you in the right direction." }),
  );
  apply(active, false);
}

/* ---------------------------------------------------- Service detail page */
export function renderServiceDetail(main) {
  const id = new URLSearchParams(location.search).get("id");
  const svc = id ? findService(id) : null;
  const c = site.pages?.service || {};

  if (!svc) {
    applySeo("service", { title: c.notFoundTitle || "Service not found", noindex: true });
    main.replaceChildren(
      pageHeader({ title: c.notFoundTitle || "Service not found", lead: c.notFoundText, crumbs: [{ label: "Services", href: pageHref("services") }, { label: "Not found" }] }),
      section({}, h("p", null, button(pageHref("services"), "View all services", { variant: "primary" }))),
    );
    return;
  }

  const cat = categoryById(svc.category);
  applySeo("service", { title: svc.name, description: svc.shortDescription, path: serviceHref(svc.id) });

  const related = enabledServices().filter((s) => s.category === svc.category && s.id !== svc.id).slice(0, 3);
  const block = (title, body, cls = "") => (body ? h("section", { class: `detail-block ${cls}`.trim() }, h("h2", { class: "detail-block__title" }, title), body) : null);

  const aside = h(
    "aside",
    { class: "enquiry-card", "aria-labelledby": "enquiry-card-title" },
    h("h2", { id: "enquiry-card-title", class: "enquiry-card__title" }, c.asideTitle || "Enquire"),
    when(c.asideText, () => h("p", null, c.asideText)),
    button(pageHref("contact", { service: svc.id }), svc.cta?.label || "Send an enquiry", { variant: "primary" }),
    contactButtons({ serviceName: svc.name, variant: "outline", include: ["call", "whatsapp"] }),
  );

  main.replaceChildren(
    pageHeader({
      eyebrow: cat?.name,
      title: svc.name,
      lead: svc.shortDescription,
      crumbs: [{ label: "Services", href: pageHref("services") }, cat ? { label: cat.name, href: pageHref("services", { category: cat.id }) } : null, { label: svc.name }].filter(Boolean),
    }),
    h(
      "section",
      { class: "section service-detail" },
      h(
        "div",
        { class: "container service-detail__grid" },
        h(
          "div",
          { class: "service-detail__main prose" },
          reveal(h("div", { class: "detail-intro" }, paragraphs(svc.description))),
          reveal(block(c.audienceTitle || "Who this is for", svc.targetAudience?.length ? h("ul", { class: "chip-list" }, svc.targetAudience.map((a) => h("li", { class: "chip" }, a))) : null)),
          reveal(block(c.scopeTitle || "Scope of work", checkList(svc.scope))),
          reveal(block(c.deliverablesTitle || "Deliverables", checkList(svc.deliverables, "check-list check-list--gold"), "detail-block--boxed")),
        ),
        aside,
      ),
    ),
    related.length
      ? section(
          { className: "related", tone: "paper" },
          h("h2", { class: "subhead" }, c.relatedTitle || "Related services"),
          h("div", { class: "service-grid service-grid--3" }, related.map((s) => serviceCard(s))),
        )
      : null,
    ctaBand({ eyebrow: "Enquiries", title: svc.cta?.label || "Discuss your requirement", text: "Call or message the office to talk through your requirement.", serviceName: svc.name }),
  );
}
