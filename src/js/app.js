/**
 * Application entry point. Each HTML page declares <body data-page="...">;
 * this module renders the shared chrome and the matching page from
 * site-data.js.
 */
import { renderHeader, renderFooter, renderFloatingContact, renderEntryDisclaimer } from "./navigation.js";
import { applySeo } from "./seo.js";
import { enableReveal, h } from "./content-renderer.js";
import { renderHome } from "./pages/home.js";
import { renderAbout } from "./pages/about.js";
import { renderFirm } from "./pages/firm.js";
import { renderServices, renderServiceDetail } from "./services.js";
import { renderContact } from "./contact.js";
import { renderPrivacy, renderDisclaimer, renderNotFound } from "./pages/legal.js";

const PAGES = {
  home: renderHome,
  about: renderAbout,
  firm: renderFirm,
  services: renderServices,
  service: renderServiceDetail, // sets its own SEO from the service
  contact: renderContact,
  privacy: renderPrivacy,
  disclaimer: renderDisclaimer,
  notFound: renderNotFound,
};

function boot() {
  const page = document.body.dataset.page || "home";
  const main = document.getElementById("main");

  if (page !== "service") applySeo(page, page === "notFound" ? { noindex: true } : {});
  renderHeader(page);

  try {
    (PAGES[page] || renderNotFound)(main);
  } catch (err) {
    console.error(err);
    main.replaceChildren(
      h("div", { class: "container section" }, h("h1", null, "Something went wrong"), h("p", null, "This page could not be displayed. Please check src/data/site-data.js for errors (see the browser console).")),
    );
  }

  renderFooter();
  renderFloatingContact(page);
  enableReveal();
  document.documentElement.classList.add("is-ready");

  // Honour #anchors after content has rendered.
  if (location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();

  renderEntryDisclaimer(page);
}

boot();
