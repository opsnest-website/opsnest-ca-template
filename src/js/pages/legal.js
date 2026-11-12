/** Privacy policy, disclaimer and 404 pages. */
import { h, link, button, when, paragraphs, pageHeader, addressBlock } from "../content-renderer.js";
import { site, pageHref, hasText, mailHref, safeUrl } from "../config.js";

const formatDate = (iso) => {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString(site.website.language || "en-IN", { day: "numeric", month: "long", year: "numeric" });
};

function legalLayout(main, { title, eyebrow, lastUpdated, intro, sections, extra }) {
  const slug = (s, i) => `s-${i + 1}-${String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
  const list = (sections || []).filter((s) => hasText(s.heading));
  main.replaceChildren(
    pageHeader({ eyebrow, title, lead: lastUpdated ? `Last updated ${formatDate(lastUpdated)}` : "", crumbs: [{ label: title }] }),
    h(
      "section",
      { class: "section legal" },
      h(
        "div",
        { class: "container legal__grid" },
        list.length > 2
          ? h(
              "nav",
              { class: "legal__toc", "aria-label": "On this page" },
              h("p", { class: "legal__toc-title" }, "On this page"),
              h("ol", null, list.map((s, i) => h("li", null, h("a", { href: `#${slug(s.heading, i)}` }, s.heading)))),
            )
          : h("div"),
        h(
          "article",
          { class: "prose legal__body" },
          when(intro, () => h("p", { class: "lead" }, intro)),
          list.map((s, i) =>
            h(
              "section",
              { id: slug(s.heading, i) },
              h("h2", null, s.heading),
              paragraphs(s.paragraphs),
              s.list?.length ? h("ul", null, s.list.map((li) => h("li", null, li))) : null,
            ),
          ),
          extra || null,
        ),
      ),
    ),
  );
}

export function renderPrivacy(main) {
  const p = site.privacy || {};
  const form = site.enquiryForm || {};
  const sections = [...(p.sections || [])];
  // Name the form provider automatically once one is configured.
  if (form.endpoint && hasText(form.providerName)) {
    sections.push({
      heading: "Form service provider",
      paragraphs: [`Enquiry form submissions are processed by ${form.providerName}.${safeUrl(form.providerPrivacyUrl) ? " Their privacy policy applies to that processing." : ""}`],
    });
  }
  const email = site.contact.emailPrimary;
  legalLayout(main, {
    title: "Privacy Policy",
    eyebrow: site.firm.legalName,
    lastUpdated: p.lastUpdated,
    intro: p.intro,
    sections,
    extra: h(
      "section",
      { id: "privacy-contact", class: "legal__contact" },
      h("h2", null, p.contactHeading || "Contact"),
      h("p", null, site.firm.legalName || site.firm.name),
      addressBlock(),
      email ? h("p", null, link(mailHref(email, "Privacy enquiry"), email, { className: "text-link" })) : null,
      safeUrl(form.providerPrivacyUrl) ? h("p", null, link(form.providerPrivacyUrl, `${form.providerName || "Form provider"} privacy policy`, { className: "text-link" })) : null,
    ),
  });
}

export function renderDisclaimer(main) {
  const d = site.disclaimer || {};
  legalLayout(main, { title: "Disclaimer", eyebrow: site.firm.legalName, lastUpdated: d.lastUpdated, sections: d.sections });
}

export function renderNotFound(main) {
  main.replaceChildren(
    pageHeader({ eyebrow: "404", title: "Page not found", lead: "The page you were looking for doesn't exist or has moved." }),
    h(
      "section",
      { class: "section" },
      h("div", { class: "container not-found" }, button(pageHref("home"), "Go to homepage", { variant: "primary" }), button(pageHref("services"), "View services", { variant: "ghost", iconAfter: null }), button(pageHref("contact"), "Contact", { variant: "ghost", iconAfter: null })),
    ),
  );
}
