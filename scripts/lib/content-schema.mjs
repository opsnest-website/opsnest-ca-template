/**
 * Mapping between site-data.js and the spreadsheet files in content/.
 *
 * - SETTINGS: every single value (text, number, yes/no, list of lines) lives
 *   in 01-settings.csv as one row. Rows listed in SETTINGS_META get a friendly
 *   label, section and help text; any other value in site-data.js is added
 *   automatically, so nothing is ever lost.
 * - TABLES: lists of records (services, FAQs, team...) get their own file,
 *   one row per item.
 *
 * Column types:
 *   text    plain text
 *   lines   one item / paragraph per line inside the cell (Alt+Enter in Excel)
 *   list    like lines, but commas also separate items
 *   bool    yes / no
 *   number  a number
 */

export const TABLES = [
  {
    file: "02-services.csv",
    path: "services",
    title: "Services offered. One row per service.",
    columns: [
      ["id", "Service ID", "text", "Unique, lowercase-with-hyphens, e.g. gst-returns. Used in the page address."],
      ["name", "Service name", "text"],
      ["category", "Category ID", "text", "Must match an ID in 03-service-categories.csv"],
      ["shortDescription", "Short description", "text", "One sentence"],
      ["description", "Detailed description", "lines", "One paragraph per line"],
      ["targetAudience", "Who it is for", "lines", "One per line"],
      ["scope", "Scope of work", "lines", "One per line"],
      ["deliverables", "What the client receives", "lines", "One per line"],
      ["cta.label", "Enquiry button text", "text"],
      ["icon", "Icon", "text", "See icon list in HOW-TO-FILL.md"],
      ["order", "Display order", "number"],
      ["featured", "Show on homepage", "bool"],
      ["enabled", "Show on website", "bool"],
    ],
  },
  {
    file: "03-service-categories.csv",
    path: "categories",
    columns: [
      ["id", "Category ID", "text", "Lowercase, no spaces"],
      ["name", "Category name", "text"],
      ["description", "Description", "text"],
      ["icon", "Icon", "text"],
      ["order", "Display order", "number"],
    ],
  },
  {
    file: "04-faqs.csv",
    path: "faqs",
    columns: [
      ["question", "Question", "text"],
      ["answer", "Answer", "text"],
      ["pages", "Show on pages", "list", "services and/or contact"],
      ["enabled", "Show on website", "bool"],
    ],
  },
  {
    file: "05-team.csv",
    path: "firm.team.members",
    columns: [
      ["useProfile", "Is this the CA (copy name & photo from profile)", "bool"],
      ["name", "Name", "text"],
      ["role", "Role", "text"],
      ["qualifications", "Qualifications", "text"],
      ["bio", "One-line description", "text"],
      ["photo", "Photo file", "text", "e.g. assets/images/team-priya.jpg (leave empty for initials)"],
      ["linkedin", "LinkedIn URL", "text"],
      ["enabled", "Show on website", "bool"],
    ],
  },
  {
    file: "06-qualifications.csv",
    path: "profile.qualifications",
    columns: [
      ["title", "Qualification", "text"],
      ["institution", "Institution", "text"],
      ["year", "Year", "text"],
      ["verified", "Verified by the CA", "bool", "Only 'yes' rows appear on the live site"],
    ],
  },
  {
    file: "07-career.csv",
    path: "profile.careerJourney",
    columns: [
      ["period", "Period", "text", "e.g. 2018 – Present"],
      ["role", "Role", "text"],
      ["organisation", "Organisation", "text"],
      ["description", "Description", "text"],
      ["verified", "Verified by the CA", "bool"],
    ],
  },
  {
    file: "08-lists.csv",
    title: "Short lists shown as cards. The 'List' column says where each row appears.",
    multi: {
      field: ["list", "List"],
      targets: {
        "Areas of specialisation": "profile.specializations",
        "Firm values": "firm.values",
        "Firm milestones": "firm.history",
        "Client segments": "clientSegments",
        "How we work (steps)": "process",
        "What clients can expect": "commitments",
      },
    },
    columns: [
      ["year", "Year (milestones only)", "text"],
      ["title", "Title", "text"],
      ["description", "Description", "text"],
      ["icon", "Icon", "text"],
    ],
  },
  {
    file: "09-office-hours.csv",
    path: "contact.hours",
    columns: [
      ["days", "Days", "text"],
      ["time", "Hours", "text"],
    ],
  },
  {
    file: "10-links.csv",
    multi: { field: ["where", "Shown on"], targets: { "Profile page": "profile.links", Footer: "social" } },
    columns: [
      ["label", "Label", "text"],
      ["url", "Link (URL)", "text", "Full profile link, e.g. https://www.linkedin.com/in/name"],
      ["icon", "Icon", "text"],
    ],
  },
  {
    file: "11-credentials.csv",
    path: "credentials",
    columns: [
      ["label", "Label", "text"],
      ["value", "Details", "text"],
      ["verified", "Verified by the CA", "bool"],
    ],
  },
  {
    file: "12-achievements.csv",
    path: "profile.achievements.items",
    columns: [
      ["title", "Title", "text"],
      ["year", "Year", "text"],
      ["description", "Description", "text"],
      ["verified", "Verified by the CA", "bool"],
    ],
  },
  {
    file: "13-testimonials.csv",
    path: "testimonials.items",
    columns: [
      ["quote", "Quote", "text"],
      ["author", "Client name", "text"],
      ["context", "Context", "text"],
      ["consentOnFile", "Written consent on file", "bool"],
      ["verified", "Verified by the CA", "bool"],
    ],
  },
  {
    file: "14-office-photos.csv",
    path: "firm.photos",
    columns: [
      ["src", "Photo file", "text", "e.g. assets/images/office-1.jpg"],
      ["alt", "Description (for accessibility)", "text"],
      ["caption", "Caption", "text"],
    ],
  },
  {
    file: "15-legal.csv",
    multi: { field: ["page", "Page"], targets: { "Privacy policy": "privacy.sections", Disclaimer: "disclaimer.sections" } },
    columns: [
      ["heading", "Heading", "text"],
      ["paragraphs", "Paragraphs", "lines", "One paragraph per line"],
      ["list", "Bullet points", "lines", "Optional, one per line"],
    ],
  },
  {
    file: "16-seo-pages.csv",
    keyed: { field: ["page", "Page"], path: "seo.pages" },
    columns: [
      ["title", "Browser tab / Google title", "text"],
      ["description", "Google description", "text", "About 150 characters"],
    ],
  },
];

/** Every array/object path handled by a table (excluded from settings). */
export const TABLE_PATHS = new Set(
  TABLES.flatMap((t) => (t.multi ? Object.values(t.multi.targets) : [t.path || t.keyed.path])),
);

/** Phone fields: Excel turns "+91 …" into a formula, so "+" is optional in the sheet. */
export const PHONE_KEYS = new Set(["contact.phonePrimary", "contact.phoneSecondary", "contact.whatsapp"]);

/**
 * Friendly labels for the most important settings, in display order.
 * [key, section, label, help]
 */
export const SETTINGS_META = [
  ["website.draftMode", "1. Website", "Draft mode (sample banner)", "Must be 'no' before the site can go live"],
  ["website.siteUrl", "1. Website", "Website domain", "e.g. https://yourdomain.com (no trailing /)"],
  ["website.basePath", "1. Website", "Folder on the domain", "/ca/ for yourdomain.com/ca/, or / for the root"],
  ["website.entryDisclaimer.enabled", "1. Website", "Show entry disclaimer pop-up", "yes / no"],
  ["website.entryDisclaimer.paragraphs", "1. Website", "Entry disclaimer text", "One paragraph per line"],

  ["profile.prefix", "2. CA profile", "Prefix before name", "Usually CA"],
  ["profile.name", "2. CA profile", "Full name", "Without the CA prefix"],
  ["profile.designation", "2. CA profile", "Designation", ""],
  ["profile.roleAtFirm", "2. CA profile", "Role at the firm", "e.g. Founder & Principal"],
  ["profile.photograph.src", "2. CA profile", "Photo file", "Put the photo in assets/images/ and write its path, e.g. assets/images/ca-photo.jpg"],
  ["profile.introduction", "2. CA profile", "Introduction (homepage)", "One or two sentences"],
  ["profile.biography", "2. CA profile", "Biography", "One paragraph per line"],
  ["profile.experienceSummary", "2. CA profile", "Experience summary", "One or two sentences"],
  ["profile.practiceSince", "2. CA profile", "In practice since (year)", "Leave empty to hide"],
  ["profile.practiceSinceVerified", "2. CA profile", "Practice year verified", "yes / no"],
  ["profile.membership.show", "2. CA profile", "Show ICAI membership", "yes / no"],
  ["profile.membership.membershipNumber", "2. CA profile", "ICAI membership number", "Only if the CA wants it published"],
  ["profile.membership.memberSince", "2. CA profile", "Member since (year)", ""],
  ["profile.membership.verified", "2. CA profile", "Membership details verified", "yes / no"],
  ["profile.philosophy.quote", "2. CA profile", "Personal quote / philosophy", ""],
  ["profile.philosophy.paragraphs", "2. CA profile", "Approach paragraph(s)", "One paragraph per line"],
  ["profile.achievements.enabled", "2. CA profile", "Show achievements section", "Keep 'no' unless approved (see 12-achievements.csv)"],

  ["firm.name", "3. Firm", "Firm name (short)", "e.g. Mehta & Co."],
  ["firm.legalName", "3. Firm", "Firm name (full)", "e.g. Mehta & Co., Chartered Accountants"],
  ["firm.tagline", "3. Firm", "Tagline under the logo", ""],
  ["firm.logo.src", "3. Firm", "Logo file", "e.g. assets/images/logo.svg"],
  ["firm.established", "3. Firm", "Year established", "Leave empty to hide"],
  ["firm.constitution", "3. Firm", "Type of firm", "e.g. Partnership firm"],
  ["firm.registration.value", "3. Firm", "ICAI Firm Registration No. (FRN)", "Only if the CA wants it published"],
  ["firm.registration.verified", "3. Firm", "FRN verified", "yes / no"],
  ["firm.introduction", "3. Firm", "Firm introduction", "Two or three sentences"],
  ["firm.background", "3. Firm", "Firm background", "One paragraph per line"],
  ["firm.mission", "3. Firm", "Mission", ""],
  ["firm.vision", "3. Firm", "Vision", ""],
  ["firm.approach", "3. Firm", "How engagements are run", "One paragraph per line"],
  ["firm.locationsServed", "3. Firm", "Locations served", "One per line"],
  ["firm.team.enabled", "3. Firm", "Show team section", "yes / no (team members are in 05-team.csv)"],

  ["contact.phonePrimary", "4. Contact", "Main phone number", "With country code, e.g. 91 98765 43210 (the + is added automatically)"],
  ["contact.phoneSecondary", "4. Contact", "Office / second phone", "Leave empty to hide"],
  ["contact.whatsapp", "4. Contact", "WhatsApp number", "Leave empty to hide WhatsApp buttons"],
  ["contact.whatsappGreeting", "4. Contact", "WhatsApp first message", ""],
  ["contact.emailPrimary", "4. Contact", "Main email", ""],
  ["contact.emailSecondary", "4. Contact", "Second email", "Leave empty to hide"],
  ["contact.address.line1", "4. Contact", "Address line 1", ""],
  ["contact.address.line2", "4. Contact", "Address line 2", ""],
  ["contact.address.city", "4. Contact", "City", ""],
  ["contact.address.state", "4. Contact", "State", ""],
  ["contact.address.postalCode", "4. Contact", "PIN code", ""],
  ["contact.address.country", "4. Contact", "Country", ""],
  ["contact.address.landmark", "4. Contact", "Landmark", "Optional"],
  ["contact.mapsUrl", "4. Contact", "Google Maps link", "Google Maps → Share → Copy link"],
  ["contact.mapsEmbedUrl", "4. Contact", "Google Maps embed link", "Optional: Maps → Share → Embed a map → copy the src=\"…\" link"],
  ["contact.hoursNote", "4. Contact", "Note under office hours", ""],
  ["contact.appointmentUrl", "4. Contact", "Online booking link", "Optional (Calendly etc.)"],

  ["enquiryForm.endpoint", "5. Enquiry form", "Form service address", "From Formspree etc. Leave empty to use WhatsApp/email only"],
  ["enquiryForm.providerName", "5. Enquiry form", "Form service name", "e.g. Formspree"],
  ["enquiryForm.providerPrivacyUrl", "5. Enquiry form", "Form service privacy policy link", ""],
  ["enquiryForm.successMessage", "5. Enquiry form", "Message after sending", ""],

  ["testimonials.enabled", "6. Optional sections", "Show testimonials", "Keep 'no' unless the CA confirms it is permitted"],
  ["seo.structuredData.enabled", "6. Optional sections", "Google business data (JSON-LD)", "yes / no"],

  ["seo.titleTemplate", "7. Google / SEO", "Title pattern", "%s is replaced by the page name"],
  ["seo.defaultDescription", "7. Google / SEO", "Default description", ""],
  ["seo.keywords", "7. Google / SEO", "Keywords", "One per line"],

  ["pages.home.hero.eyebrow", "8. Homepage text", "Small line above headline", ""],
  ["pages.home.hero.headline", "8. Homepage text", "Main headline", "Short, under 8 words"],
  ["pages.home.hero.lead", "8. Homepage text", "Text under headline", "Leave empty to use the CA introduction"],

  ["privacy.lastUpdated", "9. Legal", "Privacy policy last updated", "Date, e.g. 2026-11-12"],
  ["disclaimer.lastUpdated", "9. Legal", "Disclaimer last updated", "Date"],
  ["footer.blurb", "10. Footer", "Footer description", ""],
  ["footer.copyright", "10. Footer", "Copyright line", "{year} and {firmLegal} are filled in automatically"],
  ["footer.note", "10. Footer", "Footer note", ""],
];

export const SETTINGS_HEADER = ["Section", "Setting", "Value", "Help", "key (do not edit)", "type (do not edit)"];
