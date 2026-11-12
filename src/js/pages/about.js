/** About the CA: the individual's professional profile. */
import { h, icon, img, link, when, paragraphs, section, sectionHead, pageHeader, reveal, verifyTag, iconBadge, ctaBand } from "../content-renderer.js";
import { site, pageHref, isPublishable, hasText, caFullName, achievements, safeUrl } from "../config.js";

export function renderAbout(main) {
  const p = site.profile;
  const c = site.pages?.about || {};
  const photo = p.photograph || {};
  const quals = (p.qualifications || []).filter(isPublishable);
  const m = p.membership || {};
  const showMembership = m.show && hasText(m.body) && isPublishable(m);
  const journey = (p.careerJourney || []).filter(isPublishable);
  const ach = achievements();
  const links = (p.links || []).filter((l) => safeUrl(l.url));
  const showSince = hasText(p.practiceSince) && isPublishable({ verified: p.practiceSinceVerified });

  const portraitCard = h(
    "aside",
    { class: "profile-card" },
    h("div", { class: "portrait-frame portrait-frame--card" }, img(photo.src, photo.alt, { width: photo.width, height: photo.height, eager: true, className: "portrait-frame__img" })),
    h(
      "dl",
      { class: "profile-card__facts" },
      h("div", null, h("dt", null, "Designation"), h("dd", null, p.designation)),
      when(p.roleAtFirm, () => h("div", null, h("dt", null, "Role"), h("dd", null, `${p.roleAtFirm}, ${site.firm.name}`))),
      showSince ? h("div", null, h("dt", null, "In practice since"), h("dd", null, p.practiceSince, verifyTag({ verified: p.practiceSinceVerified }))) : null,
      showMembership && hasText(m.membershipNumber) ? h("div", null, h("dt", null, "ICAI membership no."), h("dd", null, m.membershipNumber, verifyTag(m))) : null,
    ),
    links.length
      ? h("ul", { class: "profile-card__links" }, links.map((l) => h("li", null, link(l.url, [icon(l.icon || "globe", { size: 16 }), l.label]))))
      : null,
  );

  const bioHead = sectionHead({ eyebrow: c.bioTitle, title: p.introduction, level: "h2" });
  bioHead.classList.add("bio-head");

  const blocks = [];

  // Biography + experience
  blocks.push(
    section(
      { className: "profile-bio", labelledBy: bioHead.headingId },
      h(
        "div",
        { class: "profile-layout" },
        reveal(portraitCard),
        h(
          "div",
          { class: "profile-layout__main prose" },
          reveal(bioHead),
          reveal(h("div", null, paragraphs(p.biography), when(p.experienceSummary, () => h("p", { class: "callout" }, p.experienceSummary)))),
        ),
      ),
    ),
  );

  // Qualifications & membership
  if (quals.length || showMembership) {
    const head = sectionHead({ eyebrow: c.qualificationsTitle, title: "Qualifications" });
    blocks.push(
      section(
        { className: "qualifications", tone: "paper", labelledBy: head.headingId },
        reveal(head),
        h(
          "ul",
          { class: "qual-grid" },
          quals.map((q) =>
            reveal(
              h(
                "li",
                { class: "qual" },
                iconBadge("graduation"),
                h("div", null, h("h3", { class: "qual__title" }, q.title), h("p", { class: "qual__meta" }, [q.institution, q.year].filter(hasText).join(" · ")), verifyTag(q)),
              ),
            ),
          ),
          showMembership
            ? reveal(
                h(
                  "li",
                  { class: "qual" },
                  iconBadge("shield-check"),
                  h(
                    "div",
                    null,
                    h("h3", { class: "qual__title" }, "Member"),
                    h("p", { class: "qual__meta" }, [m.body, hasText(m.memberSince) ? `since ${m.memberSince}` : ""].filter(hasText).join(" ")),
                    verifyTag(m),
                  ),
                ),
              )
            : null,
        ),
      ),
    );
  }

  // Career journey
  if (journey.length) {
    const head = sectionHead({ eyebrow: c.journeyTitle, title: "Career journey" });
    blocks.push(
      section(
        { className: "journey", labelledBy: head.headingId },
        h(
          "div",
          { class: "split" },
          reveal(head),
          h(
            "ol",
            { class: "timeline" },
            journey.map((j) =>
              reveal(
                h(
                  "li",
                  { class: "timeline__item" },
                  h("p", { class: "timeline__period" }, j.period),
                  h("h3", { class: "timeline__title" }, j.role),
                  when(j.organisation, () => h("p", { class: "timeline__org" }, j.organisation)),
                  when(j.description, () => h("p", null, j.description)),
                  verifyTag(j),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  // Specializations
  if (p.specializations?.length) {
    const head = sectionHead({ eyebrow: c.specializationsTitle, title: "Areas of specialisation" });
    blocks.push(
      section(
        { className: "specializations", tone: "paper", labelledBy: head.headingId },
        reveal(head),
        h(
          "div",
          { class: "card-grid card-grid--4" },
          p.specializations.map((sp, i) => reveal(h("article", { class: "feature-card" }, iconBadge(sp.icon), h("h3", null, sp.title), h("p", null, sp.description)), i * 60)),
        ),
        h("p", { class: "section-foot" }, link(pageHref("services"), ["See services offered by the firm", icon("arrow-right", { size: 16 })], { className: "text-link" })),
      ),
    );
  }

  // Achievements (only when enabled + publishable)
  if (ach.length) {
    const head = sectionHead({ eyebrow: c.achievementsTitle, title: "Professional recognition" });
    blocks.push(
      section(
        { className: "achievements", labelledBy: head.headingId },
        reveal(head),
        h(
          "ul",
          { class: "qual-grid" },
          ach.map((a) => reveal(h("li", { class: "qual" }, iconBadge("award"), h("div", null, h("h3", { class: "qual__title" }, a.title), h("p", { class: "qual__meta" }, [a.year, a.description].filter(hasText).join(" · ")), verifyTag(a))))),
        ),
      ),
    );
  }

  // Philosophy
  const ph = p.philosophy || {};
  if (hasText(ph.quote) || hasText(ph.paragraphs)) {
    blocks.push(
      h(
        "section",
        { class: "section philosophy", "aria-label": c.philosophyTitle || "Approach" },
        h(
          "div",
          { class: "container philosophy__inner" },
          reveal(
            h(
              "figure",
              { class: "pull-quote" },
              when(c.philosophyTitle, () => h("p", { class: "eyebrow eyebrow--light" }, c.philosophyTitle)),
              when(ph.quote, () => h("blockquote", null, h("p", null, ph.quote))),
              h("figcaption", null, caFullName()),
            ),
          ),
          reveal(h("div", { class: "philosophy__text" }, paragraphs(ph.paragraphs)), 80),
        ),
      ),
    );
  }

  blocks.push(ctaBand({ eyebrow: "Contact", title: c.ctaTitle, text: c.ctaText }));

  main.replaceChildren(
    pageHeader({
      eyebrow: c.eyebrow,
      title: caFullName(),
      lead: [p.designation, p.roleAtFirm ? `${p.roleAtFirm}, ${site.firm.name}` : ""].filter(hasText).join(" · "),
      crumbs: [{ label: "About the CA" }],
    }),
    ...blocks,
  );
}
