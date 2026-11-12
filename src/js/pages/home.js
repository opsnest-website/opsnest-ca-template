/** Homepage: composed entirely from site-data.js. */
import {
  h,
  icon,
  img,
  link,
  button,
  when,
  paragraphs,
  section,
  sectionHead,
  reveal,
  verifyTag,
  iconBadge,
  addressBlock,
  hoursList,
  contactMethods,
} from "../content-renderer.js";
import {
  site,
  pageHref,
  serviceHref,
  enabledServices,
  activeCategories,
  categoryById,
  isPublishable,
  hasText,
  caFullName,
  achievements,
  testimonials,
} from "../config.js";

const copy = () => site.pages?.home || {};
const on = (s) => s && s.enabled !== false;

/* ------------------------------------------------------------------ Hero */
function hero() {
  const c = copy().hero || {};
  const p = site.profile;
  const photo = p.photograph || {};
  const showSince = hasText(p.practiceSince) && isPublishable({ verified: p.practiceSinceVerified });

  const facts = [
    showSince ? { k: "In practice since", v: p.practiceSince, tag: verifyTag({ verified: p.practiceSinceVerified }) } : null,
    hasText(site.firm.established) ? { k: "Firm established", v: site.firm.established } : null,
    hasText(site.contact.address?.city) ? { k: "Office", v: site.contact.address.city } : null,
  ].filter(Boolean);

  return h(
    "section",
    { class: "hero", "aria-labelledby": "hero-title" },
    h("div", { class: "hero__backdrop", "aria-hidden": "true" }),
    h(
      "div",
      { class: "container hero__grid" },
      h(
        "div",
        { class: "hero__text" },
        when(c.eyebrow, () => h("p", { class: "eyebrow hero__eyebrow" }, c.eyebrow)),
        h("h1", { id: "hero-title", class: "hero__title" }, c.headline || caFullName()),
        h("p", { class: "hero__lead" }, c.lead || p.introduction),
        h(
          "div",
          { class: "hero__actions" },
          c.primaryCta ? button(c.primaryCta.href, c.primaryCta.label, { variant: "primary", size: "lg" }) : null,
          c.secondaryCta ? button(c.secondaryCta.href, c.secondaryCta.label, { variant: "ghost", size: "lg", iconAfter: null }) : null,
        ),
        facts.length
          ? h(
              "dl",
              { class: "hero__facts" },
              facts.map((f) => h("div", { class: "hero__fact" }, h("dt", null, f.k), h("dd", null, f.v, f.tag || null))),
            )
          : null,
      ),
      h(
        "figure",
        { class: "hero__portrait" },
        h(
          "div",
          { class: "portrait-frame" },
          img(photo.src, photo.alt, { width: photo.width, height: photo.height, eager: true, className: "portrait-frame__img" }),
        ),
        h(
          "figcaption",
          { class: "portrait-card" },
          h("span", { class: "portrait-card__name" }, caFullName()),
          h("span", { class: "portrait-card__role" }, [p.roleAtFirm, site.firm.name].filter(hasText).join(", ")),
        ),
      ),
    ),
    practiceStrip(),
  );
}

/** Thin strip of practice areas linking into the services page. */
function practiceStrip() {
  const cats = activeCategories();
  if (!cats.length) return null;
  return h(
    "div",
    { class: "practice-strip" },
    h(
      "div",
      { class: "container" },
      h(
        "ul",
        { class: "practice-strip__list", "aria-label": "Areas of practice" },
        cats.map((cat) => h("li", null, link(pageHref("services", { category: cat.id }), [icon(cat.icon, { size: 18 }), h("span", null, cat.name)]))),
      ),
    ),
  );
}

/* ---------------------------------------------------------- Firm intro */
function firmIntro() {
  const s = copy().firmIntro;
  if (!on(s)) return null;
  const f = site.firm;
  const facts = [
    hasText(f.established) ? ["Established", f.established] : null,
    hasText(f.constitution) ? ["Constitution", f.constitution] : null,
    f.locationsServed?.length ? ["Serving", f.locationsServed.join(" · ")] : null,
  ].filter(Boolean);
  const head = sectionHead({ eyebrow: s.eyebrow, title: s.title });
  return section(
    { className: "firm-intro", labelledBy: head.headingId },
    h(
      "div",
      { class: "split split--wide-left" },
      reveal(head),
      reveal(
        h(
          "div",
          { class: "firm-intro__body" },
          h("p", { class: "lead" }, f.introduction),
          paragraphs(f.background?.[1] || f.background?.[0]),
          facts.length ? h("dl", { class: "fact-list" }, facts.map(([k, v]) => h("div", null, h("dt", null, k), h("dd", null, v)))) : null,
          link(pageHref("firm"), ["About the firm", icon("arrow-right", { size: 16 })], { className: "text-link" }),
        ),
        80,
      ),
    ),
  );
}

/* ------------------------------------------------------ Featured services */
function featuredServices() {
  const s = copy().services;
  if (!on(s)) return null;
  let list = enabledServices().filter((x) => x.featured);
  if (!list.length) list = enabledServices().slice(0, 6);
  if (!list.length) return null;
  const head = sectionHead({
    eyebrow: s.eyebrow,
    title: s.title,
    intro: s.intro,
    action: button(pageHref("services"), s.linkLabel || "All services", { variant: "ghost" }),
  });
  return section(
    { className: "featured-services", tone: "paper", labelledBy: head.headingId },
    reveal(head),
    h(
      "ol",
      { class: "service-index" },
      list.map((svc, i) =>
        reveal(
          h(
            "li",
            { class: "service-index__item" },
            link(serviceHref(svc.id), [
              h("span", { class: "service-index__num", "aria-hidden": "true" }, String(i + 1).padStart(2, "0")),
              h(
                "span",
                { class: "service-index__body" },
                h("span", { class: "service-index__cat" }, categoryById(svc.category)?.name || ""),
                h("span", { class: "service-index__name" }, svc.name),
                h("span", { class: "service-index__desc" }, svc.shortDescription),
              ),
              h("span", { class: "service-index__arrow", "aria-hidden": "true" }, icon("arrow-up-right", { size: 20 })),
            ]),
          ),
          (i % 2) * 60,
        ),
      ),
    ),
  );
}

/* ------------------------------------------------------- Client segments */
function segments() {
  const s = copy().segments;
  const list = site.clientSegments || [];
  if (!on(s) || !list.length) return null;
  const head = sectionHead({ eyebrow: s.eyebrow, title: s.title, intro: s.intro });
  head.querySelector(".eyebrow")?.classList.add("eyebrow--light");
  return section(
    { className: "segments", tone: "navy", labelledBy: head.headingId },
    reveal(head),
    h(
      "ul",
      { class: "segment-grid" },
      list.map((seg, i) =>
        reveal(
          h(
            "li",
            { class: "segment" },
            h("span", { class: "segment__icon" }, icon(seg.icon, { size: 22 })),
            h("h3", { class: "segment__title" }, seg.title),
            when(seg.description, () => h("p", { class: "segment__desc" }, seg.description)),
          ),
          (i % 4) * 50,
        ),
      ),
    ),
  );
}

/* ----------------------------------------------------------- Commitments */
function commitments() {
  const s = copy().commitments;
  const list = site.commitments || [];
  if (!on(s) || !list.length) return null;
  const head = sectionHead({ eyebrow: s.eyebrow, title: s.title, intro: s.intro });
  return section(
    { className: "commitments", labelledBy: head.headingId },
    h(
      "div",
      { class: "split" },
      reveal(head),
      h(
        "div",
        { class: "commitment-grid" },
        list.map((item, i) =>
          reveal(
            h("article", { class: "commitment" }, iconBadge(item.icon), h("h3", { class: "commitment__title" }, item.title), h("p", null, item.description)),
            (i % 2) * 70,
          ),
        ),
      ),
    ),
  );
}

/* ------------------------------------------------------- Profile teaser */
function profileTeaser() {
  const s = copy().profile;
  if (!on(s)) return null;
  const p = site.profile;
  const quals = (p.qualifications || []).filter(isPublishable);
  const ach = achievements();
  const photo = p.photograph || {};
  const id = "profile-teaser-title";

  return h(
    "section",
    { class: "section profile-teaser", "aria-labelledby": id },
    h(
      "div",
      { class: "container profile-teaser__grid" },
      reveal(
        h(
          "div",
          { class: "profile-teaser__media" },
          h("div", { class: "portrait-frame portrait-frame--small" }, img(photo.src, photo.alt, { width: photo.width, height: photo.height, className: "portrait-frame__img" })),
        ),
      ),
      reveal(
        h(
          "div",
          { class: "profile-teaser__body" },
          when(s.eyebrow, () => h("p", { class: "eyebrow" }, s.eyebrow)),
          h("h2", { id, class: "section-title" }, s.title || caFullName()),
          h("p", { class: "profile-teaser__role" }, [p.designation, p.roleAtFirm].filter(hasText).join(" · ")),
          h("p", { class: "lead" }, p.experienceSummary || p.introduction),
          quals.length
            ? h(
                "ul",
                { class: "credential-list" },
                quals.map((q) =>
                  h("li", null, icon("graduation", { size: 18 }), h("span", null, h("strong", null, q.title), when(q.institution, () => h("span", null, q.institution))), verifyTag(q)),
                ),
              )
            : null,
          ach.length
            ? h(
                "ul",
                { class: "credential-list" },
                ach.map((a) => h("li", null, icon("award", { size: 18 }), h("span", null, h("strong", null, a.title), when(a.year, () => h("span", null, a.year))), verifyTag(a))),
              )
            : null,
          p.specializations?.length
            ? h("ul", { class: "chip-list", "aria-label": "Areas of practice" }, p.specializations.map((sp) => h("li", { class: "chip" }, sp.title)))
            : null,
          link(pageHref("about"), [s.linkLabel || "Read full profile", icon("arrow-right", { size: 16 })], { className: "text-link" }),
        ),
        80,
      ),
    ),
  );
}

/* --------------------------------------------------------------- Process */
function processSteps() {
  const s = copy().process;
  const steps = site.process || [];
  if (!on(s) || !steps.length) return null;
  const head = sectionHead({ eyebrow: s.eyebrow, title: s.title, intro: s.intro });
  return section(
    { className: "process", tone: "paper", labelledBy: head.headingId },
    reveal(head),
    h(
      "ol",
      { class: "process-steps" },
      steps.map((step, i) =>
        reveal(
          h(
            "li",
            { class: "process-step" },
            h("span", { class: "process-step__num", "aria-hidden": "true" }, String(i + 1).padStart(2, "0")),
            h("h3", { class: "process-step__title" }, step.title),
            h("p", null, step.description),
          ),
          i * 70,
        ),
      ),
    ),
  );
}

/* ----------------------------------------------------------- Testimonials */
function testimonialSection() {
  const s = copy().testimonials;
  const items = testimonials();
  if (!on(s) || !items.length) return null;
  const head = sectionHead({ eyebrow: s.eyebrow, title: s.title });
  return section(
    { className: "testimonials", labelledBy: head.headingId },
    reveal(head),
    h(
      "div",
      { class: "testimonial-grid" },
      items.map((t) =>
        reveal(
          h(
            "figure",
            { class: "testimonial" },
            h("blockquote", null, h("p", null, t.quote)),
            h("figcaption", null, h("strong", null, t.author), when(t.context, () => h("span", null, t.context)), verifyTag(t)),
          ),
        ),
      ),
    ),
  );
}

/* ------------------------------------------------------- Contact section */
function contactSection() {
  const s = copy().contact;
  if (!on(s)) return null;
  const c = site.contact;
  const methods = contactMethods();
  if (c.mapsUrl) methods.push({ key: "directions", label: "Visit", value: [c.address?.city, c.address?.state].filter(Boolean).join(", "), href: c.mapsUrl, icon: "navigation", action: "Get directions" });
  const head = sectionHead({ eyebrow: s.eyebrow, title: s.title, intro: s.intro });
  head.querySelector(".eyebrow")?.classList.add("eyebrow--light");

  return h(
    "section",
    { class: "section home-contact", "aria-labelledby": head.headingId },
    h(
      "div",
      { class: "container" },
      reveal(
        h(
          "div",
          { class: "home-contact__panel" },
          h(
            "div",
            { class: "home-contact__info" },
            head,
            h(
              "div",
              { class: "home-contact__meta" },
              h("div", null, h("h3", { class: "meta-title" }, icon("map-pin", { size: 16 }), "Office"), addressBlock()),
              h("div", null, h("h3", { class: "meta-title" }, icon("clock", { size: 16 }), "Hours"), hoursList()),
            ),
          ),
          h(
            "ul",
            { class: "method-list" },
            methods.map((m) =>
              h(
                "li",
                null,
                link(m.href, [
                  h("span", { class: `method-list__icon method-list__icon--${m.key}` }, icon(m.icon, { size: 22 })),
                  h("span", { class: "method-list__text" }, h("span", { class: "method-list__label" }, m.action), h("span", { class: "method-list__value" }, m.value)),
                  icon("arrow-right", { size: 18, className: "method-list__arrow" }),
                ], { className: "method-list__link" }),
              ),
            ),
            h("li", null, link(pageHref("contact"), [h("span", { class: "method-list__icon" }, icon("message", { size: 22 })), h("span", { class: "method-list__text" }, h("span", { class: "method-list__label" }, "Send an enquiry"), h("span", { class: "method-list__value" }, "Enquiry form & FAQs")), icon("arrow-right", { size: 18, className: "method-list__arrow" })], { className: "method-list__link" })),
          ),
        ),
      ),
    ),
  );
}

export function renderHome(main) {
  main.replaceChildren(
    ...[hero(), firmIntro(), featuredServices(), segments(), profileTeaser(), commitments(), processSteps(), testimonialSection(), contactSection()].filter(Boolean),
  );
}
