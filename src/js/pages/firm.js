/** Our Firm: the practice's identity, distinct from the CA's personal profile. */
import { h, icon, img, link, when, paragraphs, section, sectionHead, pageHeader, reveal, verifyTag, iconBadge, ctaBand, addressBlock } from "../content-renderer.js";
import { site, pageHref, isPublishable, hasText, teamMembers, safeUrl } from "../config.js";

export function renderFirm(main) {
  const f = site.firm;
  const c = site.pages?.firm || {};
  const blocks = [];

  // Background + history
  const bgHead = sectionHead({ eyebrow: c.backgroundTitle, title: f.introduction });
  bgHead.classList.add("bio-head");
  const history = (f.history || []).filter((x) => hasText(x.title));
  const facts = [
    hasText(f.established) ? ["Established", f.established] : null,
    hasText(f.constitution) ? ["Constitution", f.constitution] : null,
    hasText(f.registration?.value) && isPublishable(f.registration) ? [f.registration.label, f.registration.value, verifyTag(f.registration)] : null,
    hasText(site.contact.address?.city) ? ["Office", site.contact.address.city] : null,
  ].filter(Boolean);

  blocks.push(
    section(
      { className: "firm-background", labelledBy: bgHead.headingId },
      h(
        "div",
        { class: "split split--wide-left" },
        h("div", { class: "prose" }, reveal(bgHead), reveal(h("div", null, paragraphs(f.background)))),
        facts.length
          ? reveal(
              h(
                "aside",
                { class: "fact-panel" },
                h("dl", { class: "fact-list fact-list--stacked" }, facts.map(([k, v, tag]) => h("div", null, h("dt", null, k), h("dd", null, v, tag || null)))),
              ),
              80,
            )
          : null,
      ),
      history.length
        ? h(
            "div",
            { class: "milestones" },
            h("h2", { class: "subhead" }, c.historyTitle || "Milestones"),
            h(
              "ol",
              { class: "milestone-list" },
              history.map((m, i) => reveal(h("li", { class: "milestone" }, h("span", { class: "milestone__year" }, m.year), h("h3", { class: "milestone__title" }, m.title), when(m.description, () => h("p", null, m.description))), i * 60)),
            ),
          )
        : null,
    ),
  );

  // Mission & vision
  if (hasText(f.mission) || hasText(f.vision)) {
    blocks.push(
      h(
        "section",
        { class: "section section--navy mission", "aria-label": "Mission and vision" },
        h(
          "div",
          { class: "container mission__grid" },
          when(f.mission, () => reveal(h("article", { class: "mission__item" }, h("p", { class: "eyebrow eyebrow--light" }, c.missionTitle || "Mission"), h("p", { class: "mission__text" }, f.mission)))),
          when(f.vision, () => reveal(h("article", { class: "mission__item" }, h("p", { class: "eyebrow eyebrow--light" }, c.visionTitle || "Vision"), h("p", { class: "mission__text" }, f.vision)), 80)),
        ),
      ),
    );
  }

  // Values
  if (f.values?.length) {
    const head = sectionHead({ eyebrow: c.valuesTitle, title: "What guides our work" });
    blocks.push(
      section(
        { className: "values", labelledBy: head.headingId },
        reveal(head),
        h("div", { class: "card-grid card-grid--4" }, f.values.map((v, i) => reveal(h("article", { class: "feature-card" }, iconBadge(v.icon), h("h3", null, v.title), h("p", null, v.description)), i * 60))),
      ),
    );
  }

  // Approach + process
  if (hasText(f.approach) || site.process?.length) {
    const head = sectionHead({ eyebrow: c.approachTitle, title: "A defined way of working" });
    blocks.push(
      section(
        { className: "approach", tone: "paper", labelledBy: head.headingId },
        h(
          "div",
          { class: "split" },
          h("div", { class: "prose" }, reveal(head), reveal(h("div", null, paragraphs(f.approach)))),
          site.process?.length
            ? h(
                "ol",
                { class: "process-steps process-steps--vertical" },
                site.process.map((step, i) =>
                  reveal(h("li", { class: "process-step" }, h("span", { class: "process-step__num", "aria-hidden": "true" }, String(i + 1).padStart(2, "0")), h("h3", { class: "process-step__title" }, step.title), h("p", null, step.description)), i * 60),
                ),
              )
            : null,
        ),
      ),
    );
  }

  // Team
  const team = teamMembers();
  if (team.length) {
    const head = sectionHead({ eyebrow: c.teamTitle, title: "The people on your file" });
    blocks.push(
      section(
        { className: "team", labelledBy: head.headingId },
        reveal(head),
        h(
          "ul",
          { class: "team-grid" },
          team.map((m, i) =>
            reveal(
              h(
                "li",
                { class: "team-card" },
                h(
                  "div",
                  { class: "team-card__photo" },
                  m.photo ? img(m.photo, `Photo of ${m.name}`, { width: 400, height: 500 }) : h("span", { class: "team-card__initials", "aria-hidden": "true" }, initials(m.name)),
                ),
                h(
                  "div",
                  { class: "team-card__body" },
                  h("h3", { class: "team-card__name" }, m.name),
                  h("p", { class: "team-card__role" }, m.role),
                  when(m.qualifications, () => h("p", { class: "team-card__qual" }, m.qualifications)),
                  when(m.bio, () => h("p", { class: "team-card__bio" }, m.bio)),
                  safeUrl(m.linkedin) ? link(m.linkedin, [icon("linkedin", { size: 16 }), "LinkedIn"], { className: "text-link text-link--small" }) : null,
                ),
              ),
              i * 60,
            ),
          ),
        ),
      ),
    );
  }

  // Clients + geography
  const segs = site.clientSegments || [];
  const locations = f.locationsServed || [];
  if (segs.length || locations.length) {
    const head = sectionHead({ eyebrow: c.segmentsTitle, title: "Who we serve, and where" });
    head.querySelector(".eyebrow")?.classList.add("eyebrow--light");
    blocks.push(
      section(
        { className: "reach", tone: "navy", labelledBy: head.headingId },
        reveal(head),
        h(
          "div",
          { class: "reach__grid" },
          segs.length
            ? h("ul", { class: "segment-list" }, segs.map((s) => h("li", null, icon(s.icon, { size: 20 }), h("span", null, h("strong", null, s.title), when(s.description, () => h("span", null, s.description))))))
            : null,
          locations.length || addressBlock()
            ? reveal(
                h(
                  "div",
                  { class: "presence" },
                  h("h3", { class: "presence__title" }, icon("map-pin", { size: 18 }), c.presenceTitle || "Where we work"),
                  locations.length ? h("ul", { class: "presence__list" }, locations.map((l) => h("li", null, l))) : null,
                  h("div", { class: "presence__office" }, h("p", { class: "presence__label" }, "Office"), addressBlock()),
                ),
                80,
              )
            : null,
        ),
      ),
    );
  }

  // Credentials
  const creds = (site.credentials || []).filter((x) => hasText(x.value) && isPublishable(x));
  if (creds.length) {
    const head = sectionHead({ eyebrow: c.credentialsTitle, title: "Registrations & memberships" });
    blocks.push(
      section(
        { className: "credentials", labelledBy: head.headingId },
        reveal(head),
        h("dl", { class: "credential-table" }, creds.map((x) => h("div", null, h("dt", null, x.label), h("dd", null, x.value, verifyTag(x))))),
      ),
    );
  }

  // Office photos
  const photos = (f.photos || []).filter((p) => p.src);
  if (photos.length) {
    const head = sectionHead({ eyebrow: c.photosTitle, title: "The office" });
    blocks.push(
      section(
        { className: "gallery", tone: "paper", labelledBy: head.headingId },
        reveal(head),
        h("div", { class: "gallery-grid" }, photos.map((p) => reveal(h("figure", null, img(p.src, p.alt, { width: 800, height: 600 }), when(p.caption, () => h("figcaption", null, p.caption)))))),
      ),
    );
  }

  blocks.push(ctaBand({ eyebrow: "Contact", title: "Discuss an engagement", text: "Tell us what you need and we'll suggest the right next step." }));

  main.replaceChildren(
    pageHeader({
      eyebrow: c.eyebrow,
      title: f.legalName || f.name,
      lead: [hasText(f.established) ? `Established ${f.established}` : "", site.contact.address?.city].filter(hasText).join(" · "),
      crumbs: [{ label: "Our Firm" }],
      aside: link(pageHref("about"), [h("span", { class: "page-header__aside-label" }, "Led by"), h("span", { class: "page-header__aside-name" }, [site.profile.prefix, site.profile.name].filter(Boolean).join(" ")), icon("arrow-right", { size: 16 })], { className: "page-header__aside" }),
    }),
    ...blocks,
  );
}

function initials(name = "") {
  const parts = name.replace(/^\[|\]$/g, "").replace(/^CA\s+/i, "").split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] || "") + (parts.length > 1 ? parts[parts.length - 1][0] : "");
}
