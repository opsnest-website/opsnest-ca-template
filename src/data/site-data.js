/**
 * ============================================================================
 *  SITE DATA: the single source of truth for this website
 * ============================================================================
 *
 *  Every name, number, address, service, FAQ and legal text on the website is
 *  read from this file. Change a value here, save, re-deploy, and every page
 *  that uses it updates automatically. You never need to edit HTML, CSS or
 *  the JavaScript in src/js/ to change content.
 *
 *  HOW TO EDIT SAFELY
 *  - Keep the quotes around text values:  name: "Aarav Mehta",
 *  - Keep the comma at the end of each line inside { } and [ ].
 *  - To hide an optional item, use an empty string "" or set enabled: false.
 *  - Image paths are relative to the website folder, e.g. "assets/images/x.jpg".
 *    Do NOT start them with "/" (that would break /ca/ sub-path hosting).
 *  - Internal links use page file names, e.g. "services.html" or "contact.html".
 *
 *  SAMPLE CONTENT  ⚠
 *  Everything below is SAMPLE / PLACEHOLDER content written to show the layout.
 *  The name "Aarav Mehta", "Artha & Co.", phone numbers, emails and the address
 *  are fictitious. Replace them with real, CA-approved information before
 *  going live. See CONTENT-REVIEW.md for the full pre-publication checklist.
 *
 *  TOKENS
 *  Any text may contain these placeholders, filled in automatically so that
 *  names and numbers are typed only once:
 *    {firm}  {firmLegal}  {ca}  {caName}  {designation}  {city}
 *    {email}  {phone}  {website}  {year}
 *
 *  VERIFICATION FLAGS
 *  Professional claims (qualifications, membership, achievements, credentials,
 *  testimonials) carry `verified: false`. While `website.draftMode` is true,
 *  unverified items are shown with a visible "Unverified sample" tag so you can
 *  preview the layout. When draftMode is false, UNVERIFIED ITEMS ARE NOT SHOWN.
 *  Only set `verified: true` after the CA has confirmed the item is accurate
 *  and permissible to publish.
 * ============================================================================
 */

export const siteData = {
  /* ------------------------------------------------------------------------
   * 1. WEBSITE & DEPLOYMENT
   * ---------------------------------------------------------------------- */
  website: {
    // Public origin of the site, no trailing slash. Used for canonical URLs,
    // Open Graph tags, structured data and sitemap.xml.
    siteUrl: "https://example.com",

    // Folder the site is served from. "/ca/" for https://example.com/ca/,
    // or "/" when served at the domain root. Must start and end with "/".
    // This is the ONLY place the deployment path is configured.
    basePath: "/ca/",

    language: "en-IN",
    locale: "en_IN",
    themeColor: "#0d1b2e",
    favicon: "assets/icons/favicon.svg",
    // Social sharing image (1200×630 PNG or JPG recommended).
    ogImage: "assets/images/og-image.png",

    // DRAFT MODE: shows a "sample content" ribbon and reveals unverified items
    // with a visible tag. Set to false only after the content review is done.
    draftMode: true,
    draftNotice:
      "Preview build: names, numbers and professional details on this site are sample content pending review by the Chartered Accountant.",

    // Entry disclaimer: a one-time acknowledgement shown on first visit.
    // Many CA practices show this; confirm wording with the CA against
    // current ICAI guidance before publishing.
    entryDisclaimer: {
      enabled: true,
      title: "Disclaimer",
      paragraphs: [
        "The rules of the Institute of Chartered Accountants of India (ICAI) restrict Chartered Accountants from soliciting work or advertising their services.",
        "By clicking “I agree”, you acknowledge that you are seeking information about this practice of your own accord, that there has been no solicitation or inducement of any kind, and that information on this website is not professional advice.",
      ],
      acceptLabel: "I agree",
      declineLabel: "Leave site",
      declineUrl: "https://www.google.com/",
      // Acceptance is remembered in the visitor's browser for this many days.
      rememberDays: 30,
    },
  },

  /* ------------------------------------------------------------------------
   * 2. SEO: titles and descriptions per page
   * "%s" in titleTemplate is replaced with the page title.
   * ---------------------------------------------------------------------- */
  seo: {
    titleTemplate: "%s · {firmLegal}",
    defaultDescription:
      "{firm} is a Chartered Accountancy practice in {city} offering income tax, GST, audit, accounting and company law services to individuals and businesses.",
    keywords: [
      "chartered accountant Pune",
      "CA firm Pune",
      "income tax return filing",
      "GST registration and returns",
      "statutory audit",
      "company incorporation",
      "LLP compliance",
    ],
    pages: {
      home: {
        title: "{ca} · {firmLegal}",
        description:
          "{ca} and {firm}, a Chartered Accountancy practice in {city} for income tax, GST, audit, accounting and company compliance.",
      },
      about: {
        title: "About {ca}",
        description:
          "Professional profile of {ca}: qualifications, career, areas of practice and approach to client work.",
      },
      firm: {
        title: "Our Firm",
        description:
          "About {firmLegal}: background, values, team and the clients and locations we serve.",
      },
      services: {
        title: "Services",
        description:
          "Income tax, GST, audit and assurance, accounting, business advisory and company/LLP services offered by {firm}.",
      },
      service: {
        // Title for individual service pages is taken from the service name.
        title: "Service",
        description: "",
      },
      contact: {
        title: "Contact",
        description:
          "Call, WhatsApp, email or visit {firm} in {city}. Office hours, directions and enquiry form.",
      },
      privacy: { title: "Privacy Policy", description: "How this website handles personal information." },
      disclaimer: { title: "Disclaimer", description: "Professional disclaimer and website terms." },
      notFound: { title: "Page not found", description: "" },
    },
    // Schema.org structured data (JSON-LD). Off by default. Enable once the
    // business details are final and the CA approves publishing them this way.
    structuredData: {
      enabled: false,
      type: "AccountingService",
    },
  },

  /* ------------------------------------------------------------------------
   * 3. THE CHARTERED ACCOUNTANT (individual profile)
   * ---------------------------------------------------------------------- */
  profile: {
    prefix: "CA", // shown before the name, e.g. "CA Aarav Mehta"
    name: "Aarav Mehta", // SAMPLE
    designation: "Chartered Accountant",
    roleAtFirm: "Founder & Principal",
    photograph: {
      src: "assets/images/profile-placeholder.svg", // replace with a real portrait (4:5 ratio, ~800×1000)
      alt: "Portrait of {ca}",
      width: 800,
      height: 1000,
    },

    // One or two sentences used in the homepage hero and profile header.
    introduction:
      "I advise individuals, professionals and owner-managed businesses on income tax, GST and statutory compliance, with an emphasis on clear explanations and dependable timelines.",

    // Longer biography (each string is a paragraph).
    biography: [
      "{caName} qualified as a Chartered Accountant and began in audit and direct tax practice, working with manufacturing, trading and services businesses. [SAMPLE: replace with the CA's actual background.]",
      "{caName} founded {firm} to offer a practice where clients deal directly with a qualified professional, receive straightforward advice, and know what is due, when, and why.",
    ],

    // Year the CA began practice. Shown as "In practice since <year>" only if
    // practiceSinceVerified is true (or in draft mode). Leave "" to hide.
    practiceSince: "2015", // SAMPLE
    practiceSinceVerified: false,

    // Short statement for the "Experience" block.
    experienceSummary:
      "Experience across statutory and tax audits, direct and indirect tax compliance, and company law matters for SMEs, startups and individual taxpayers. [SAMPLE]",

    qualifications: [
      {
        title: "Chartered Accountant (ACA)",
        institution: "The Institute of Chartered Accountants of India",
        year: "[Year]",
        verified: false,
      },
      {
        title: "Bachelor of Commerce",
        institution: "[University name]",
        year: "[Year]",
        verified: false,
      },
    ],

    // ICAI membership. Publish only details the CA has approved.
    membership: {
      show: true,
      body: "The Institute of Chartered Accountants of India",
      membershipNumber: "", // e.g. "1XXXXX"; leave "" to hide
      memberSince: "",
      verified: false,
    },

    careerJourney: [
      {
        period: "[Year] – Present",
        role: "Founder & Principal",
        organisation: "{firmLegal}",
        description: "Leads client engagements across taxation, audit and compliance.",
        verified: false,
      },
      {
        period: "[Year] – [Year]",
        role: "Audit & Tax Associate",
        organisation: "[Previous firm]",
        description: "Statutory and tax audits; direct tax compliance and assessments.",
        verified: false,
      },
      {
        period: "[Year] – [Year]",
        role: "Articled Assistant",
        organisation: "[Firm name]",
        description: "Articleship covering audit, taxation and accounting assignments.",
        verified: false,
      },
    ],

    specializations: [
      { title: "Direct taxation", description: "Income tax planning, returns, notices and assessments for individuals and businesses.", icon: "receipt" },
      { title: "GST compliance", description: "Registration, periodic returns, reconciliations and departmental correspondence.", icon: "percent" },
      { title: "Audit & assurance", description: "Statutory, tax and internal audits with practical, well-documented findings.", icon: "shield-check" },
      { title: "Company & LLP law", description: "Incorporation, annual filings and routine corporate compliance.", icon: "landmark" },
    ],

    // Achievements are disabled by default. Enable only with verified,
    // permissible items (no rankings, awards-for-hire or comparative claims).
    achievements: {
      enabled: false,
      items: [
        // { title: "Speaker, [Event]", year: "2024", description: "", verified: false },
      ],
    },

    philosophy: {
      quote: "Good advice should be clear enough that a client can explain it back to you.",
      paragraphs: [
        "Most compliance problems start as communication problems. I prefer to explain the reasoning behind a recommendation, agree timelines in writing, and flag issues early rather than late.",
      ],
    },

    // Permitted professional links (LinkedIn etc.). Leave url "" to hide.
    links: [
      { label: "LinkedIn", url: "https://www.linkedin.com/", icon: "linkedin" }, // SAMPLE URL
    ],
  },

  /* ------------------------------------------------------------------------
   * 4. THE FIRM
   * ---------------------------------------------------------------------- */
  firm: {
    name: "Artha & Co.", // SAMPLE
    legalName: "Artha & Co., Chartered Accountants",
    tagline: "Chartered Accountants",
    logo: {
      src: "assets/images/logo.svg",
      alt: "{firm} logo",
    },
    established: "2016", // SAMPLE; "" to hide
    constitution: "Proprietorship firm", // e.g. "Partnership firm"; "" to hide
    // Firm Registration Number (FRN). Publish only if approved.
    registration: { label: "ICAI Firm Registration No.", value: "", verified: false },

    introduction:
      "{firm} is a Chartered Accountancy practice based in {city}. We work with individuals, professionals and owner-managed businesses on tax, audit, accounting and corporate compliance.",

    background: [
      "The practice was set up to give clients direct access to a qualified Chartered Accountant, supported by a small team that handles day-to-day compliance with care and consistency. [SAMPLE]",
      "Our work is organised around a compliance calendar for each client, so that filings, payments and reviews happen on time and without last-minute surprises.",
    ],

    // Optional milestones. Keep factual; leave [] to hide.
    history: [
      { year: "2016", title: "Practice established", description: "{firm} begins practice in {city}. [SAMPLE]" },
      { year: "2019", title: "Audit & assurance practice", description: "Statutory and tax audit work expands with a dedicated team. [SAMPLE]" },
      { year: "2023", title: "Current office", description: "Practice moves to its present office. [SAMPLE]" },
    ],

    mission:
      "To help clients meet their tax and regulatory obligations accurately and on time, with advice they understand.",
    vision:
      "To be a practice clients trust with their financial compliance year after year, because the work is careful and the communication is clear.",

    values: [
      { title: "Integrity", description: "Advice that follows the law and professional standards, explained plainly.", icon: "scale" },
      { title: "Confidentiality", description: "Client information is handled on a need-to-know basis and kept secure.", icon: "lock" },
      { title: "Diligence", description: "Work is reviewed before it is filed. Deadlines are tracked, not remembered.", icon: "clipboard-check" },
      { title: "Clarity", description: "Fees, scope and timelines agreed up front, in writing.", icon: "eye" },
    ],

    approach: [
      "Every engagement starts with understanding the client's position and documents, then agreeing a written scope and fee. Routine compliance is scheduled on a shared calendar; advisory work is delivered with a short written summary of recommendations and next steps.",
    ],

    locationsServed: ["Pune", "Pimpri-Chinchwad", "Mumbai", "Remote engagements across India"], // SAMPLE

    team: {
      enabled: true,
      members: [
        {
          // useProfile: true copies name, role and photo from `profile` above,
          // so the CA's details are never typed twice.
          useProfile: true,
          qualifications: "ACA, B.Com",
          bio: "Leads client engagements in taxation, audit and compliance.",
          enabled: true,
        },
        {
          name: "[Team member name]",
          role: "Senior Associate, Audit & Assurance",
          qualifications: "[Qualification]",
          bio: "[One-line description of responsibilities.]",
          photo: "",
          linkedin: "",
          enabled: true,
        },
        {
          name: "[Team member name]",
          role: "Associate, GST & Accounting",
          qualifications: "[Qualification]",
          bio: "[One-line description of responsibilities.]",
          photo: "",
          linkedin: "",
          enabled: true,
        },
      ],
    },

    // Office photographs. Add { src, alt, caption } items; [] hides the gallery.
    photos: [],
  },

  /* ------------------------------------------------------------------------
   * 5. CONTACT DETAILS (used everywhere: header, footer, buttons, contact page)
   * ---------------------------------------------------------------------- */
  contact: {
    // Write numbers in international format. Spaces are fine.
    phonePrimary: "+91 98765 43210", // SAMPLE
    phoneSecondary: "+91 20 1234 5678", // SAMPLE; "" to hide
    whatsapp: "+91 98765 43210", // SAMPLE; "" hides all WhatsApp buttons
    whatsappGreeting: "Hello, I would like to make an enquiry.",
    emailPrimary: "contact@example.com", // SAMPLE
    emailSecondary: "", // e.g. "accounts@example.com"
    address: {
      line1: "Office No. [X], [Building name]", // SAMPLE
      line2: "[Road / Area]",
      city: "Pune",
      state: "Maharashtra",
      postalCode: "411001",
      country: "India",
      landmark: "", // optional, e.g. "Near XYZ Metro Station"
    },
    // Google Maps link used for "Get directions".
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Pune%2C+Maharashtra",
    // Google Maps embed URL (Maps → Share → Embed a map → copy the src="..."
    // value). Loaded only after the visitor clicks "Show map". "" to hide.
    mapsEmbedUrl: "",
    hours: [
      { days: "Monday – Friday", time: "10:00 am – 7:00 pm" },
      { days: "Saturday", time: "10:00 am – 2:00 pm" },
      { days: "Sunday & public holidays", time: "Closed" },
    ],
    hoursNote: "Office visits by prior appointment, please.",
    // Online booking link (Calendly, Google Calendar booking page, etc.). "" to hide.
    appointmentUrl: "",
  },

  // Social / professional profiles shown in the footer. Leave url "" to hide.
  social: [
    { label: "LinkedIn", url: "https://www.linkedin.com/", icon: "linkedin" }, // SAMPLE URL
  ],

  /* ------------------------------------------------------------------------
   * 6. SERVICE CATEGORIES
   * `order` controls display order. Categories with no enabled services are
   * hidden automatically.
   * ---------------------------------------------------------------------- */
  categories: [
    { id: "taxation", name: "Taxation & Compliance", description: "Income tax returns, planning, notices and TDS.", icon: "receipt", order: 1 },
    { id: "gst", name: "GST Services", description: "Registration, returns, reconciliation and advisory.", icon: "percent", order: 2 },
    { id: "audit", name: "Audit & Assurance", description: "Statutory, tax and internal audits.", icon: "shield-check", order: 3 },
    { id: "accounting", name: "Accounting & Bookkeeping", description: "Books of account, MIS and payroll support.", icon: "book-open", order: 4 },
    { id: "corporate", name: "Company & LLP Services", description: "Incorporation and ongoing ROC compliance.", icon: "landmark", order: 5 },
    { id: "advisory", name: "Business Advisory", description: "Structuring, projections and financial guidance.", icon: "chart", order: 6 },
  ],

  /* ------------------------------------------------------------------------
   * 7. SERVICES
   * Add as many as you like. Each needs a unique `id` (lowercase, hyphens).
   * The detail page for a service is service.html?id=<id>.
   *   category:  must match a category id above
   *   icon:      see the icon list in README.md
   *   featured:  shown on the homepage
   *   enabled:   false hides it everywhere
   * ---------------------------------------------------------------------- */
  services: [
    {
      id: "income-tax-returns",
      name: "Income Tax Return Filing",
      category: "taxation",
      icon: "receipt",
      order: 1,
      enabled: true,
      featured: true,
      shortDescription: "Preparation and filing of income tax returns for individuals, HUFs, firms and companies.",
      description: [
        "We prepare and file income tax returns after reviewing income from all sources, available deductions and tax already paid through TDS, TCS or advance tax.",
        "Before filing, we reconcile your information with Form 26AS and the Annual Information Statement (AIS) to reduce the chance of mismatches and notices later.",
      ],
      targetAudience: ["Salaried individuals", "Professionals and freelancers", "Business owners", "NRIs with Indian income", "Partnership firms and companies"],
      scope: [
        "Collection and review of income and investment documents",
        "Reconciliation with Form 26AS / AIS / TIS",
        "Computation of total income and tax liability",
        "Filing of the return and e-verification support",
        "Follow-up on refunds and processing intimations",
      ],
      deliverables: ["Computation of income", "Filed ITR and acknowledgement", "Summary of tax position for the year"],
      cta: { label: "Enquire about ITR filing" },
    },
    {
      id: "tax-planning",
      name: "Tax Planning & Advisory",
      category: "taxation",
      icon: "compass",
      order: 2,
      enabled: true,
      featured: false,
      shortDescription: "Lawful planning of tax affairs, regime selection and advice on specific transactions.",
      description: [
        "We review your income, investments and expected transactions to help you plan your tax position within the law, including the choice between the old and new tax regimes where relevant.",
        "For significant transactions such as property sales, ESOPs or business restructuring, we provide a written note on tax implications before you proceed.",
      ],
      targetAudience: ["Individuals with multiple income sources", "Senior executives with ESOPs", "Business owners"],
      scope: ["Review of current tax position", "Regime comparison", "Transaction-specific tax analysis", "Advance tax estimation"],
      deliverables: ["Written tax planning note", "Advance tax schedule"],
      cta: { label: "Discuss tax planning" },
    },
    {
      id: "tax-notices",
      name: "Income Tax Notices & Assessments",
      category: "taxation",
      icon: "file-text",
      order: 3,
      enabled: true,
      featured: true,
      shortDescription: "Responding to notices, scrutiny assessments and appeals before tax authorities.",
      description: [
        "We examine the notice, identify what is being asked and why, and prepare a documented response within the time allowed.",
        "Where required, we represent clients in assessment proceedings and assist with appeals.",
      ],
      targetAudience: ["Individuals and businesses who have received a notice", "Taxpayers under scrutiny assessment"],
      scope: ["Analysis of the notice", "Preparation of submissions and supporting documents", "Online responses and hearings", "Rectification and appeal assistance"],
      deliverables: ["Written response filed with the department", "Status updates through closure"],
      cta: { label: "Get help with a notice" },
    },
    {
      id: "tds-compliance",
      name: "TDS / TCS Compliance",
      category: "taxation",
      icon: "calculator",
      order: 4,
      enabled: true,
      featured: false,
      shortDescription: "Deduction, deposit and quarterly return filing for TDS and TCS.",
      description: ["We help businesses compute withholding correctly, deposit it on time and file quarterly statements, and handle corrections and defaults."],
      targetAudience: ["Businesses and employers", "Firms and companies with withholding obligations"],
      scope: ["TDS/TCS computation", "Challan payments", "Quarterly returns (24Q, 26Q, 27Q, 27EQ)", "Issue of Form 16 / 16A", "Default resolution"],
      deliverables: ["Filed quarterly returns", "TDS certificates"],
      cta: { label: "Enquire about TDS compliance" },
    },
    {
      id: "gst-registration-returns",
      name: "GST Registration & Returns",
      category: "gst",
      icon: "percent",
      order: 1,
      enabled: true,
      featured: true,
      shortDescription: "GST registration, monthly/quarterly returns and annual returns.",
      description: [
        "We handle GST registration and the full cycle of periodic returns, including reconciliation of input tax credit with GSTR-2B before each filing.",
        "For annual compliance, we prepare GSTR-9 and, where applicable, the GSTR-9C reconciliation statement.",
      ],
      targetAudience: ["New and existing businesses", "E-commerce sellers", "Service providers", "Traders and manufacturers"],
      scope: ["GST registration and amendments", "GSTR-1 and GSTR-3B filing", "ITC reconciliation with GSTR-2B", "Annual return (GSTR-9 / 9C)", "LUT filing for exporters"],
      deliverables: ["GST registration certificate", "Filed returns and payment challans", "Monthly reconciliation report"],
      cta: { label: "Enquire about GST services" },
    },
    {
      id: "gst-advisory",
      name: "GST Advisory & Notices",
      category: "gst",
      icon: "message",
      order: 2,
      enabled: true,
      featured: false,
      shortDescription: "Classification, place of supply questions, refunds and departmental notices.",
      description: ["We provide written opinions on GST questions and represent clients in responding to notices, audits and refund applications."],
      targetAudience: ["Businesses with complex supply chains", "Exporters seeking refunds", "Businesses that have received GST notices"],
      scope: ["Classification and rate advice", "Refund applications", "Replies to notices and show-cause notices", "Departmental audit support"],
      deliverables: ["Written advisory note", "Filed replies and applications"],
      cta: { label: "Discuss a GST matter" },
    },
    {
      id: "statutory-audit",
      name: "Statutory Audit",
      category: "audit",
      icon: "shield-check",
      order: 1,
      enabled: true,
      featured: true,
      shortDescription: "Audit of financial statements under the Companies Act, 2013 and other statutes.",
      description: [
        "We conduct statutory audits in accordance with the Standards on Auditing issued by ICAI, with a planned approach and clear communication of observations to management.",
      ],
      targetAudience: ["Private limited companies", "LLPs requiring audit", "Societies and trusts"],
      scope: ["Audit planning and risk assessment", "Verification of transactions and balances", "Internal control review", "Audit report and CARO reporting"],
      deliverables: ["Independent auditor's report", "Management letter with observations"],
      cta: { label: "Enquire about statutory audit" },
    },
    {
      id: "tax-audit",
      name: "Tax Audit",
      category: "audit",
      icon: "clipboard-check",
      order: 2,
      enabled: true,
      featured: false,
      shortDescription: "Tax audit under Section 44AB and filing of Form 3CA/3CB-3CD.",
      description: ["For businesses and professionals whose turnover or receipts cross the prescribed limits, we conduct the tax audit and file the report within the due date."],
      targetAudience: ["Businesses and professionals above the Section 44AB thresholds"],
      scope: ["Review of books and records", "Verification of clauses in Form 3CD", "Filing of the tax audit report"],
      deliverables: ["Tax audit report (Form 3CA/3CB and 3CD)"],
      cta: { label: "Enquire about tax audit" },
    },
    {
      id: "internal-audit",
      name: "Internal Audit",
      category: "audit",
      icon: "search",
      order: 3,
      enabled: false, // EXAMPLE of a disabled service: it is hidden everywhere.
      featured: false,
      shortDescription: "Process reviews and internal control testing.",
      description: ["Risk-based internal audits for owner-managed businesses."],
      targetAudience: ["Growing SMEs"],
      scope: ["Process walkthroughs", "Control testing", "Reporting"],
      deliverables: ["Internal audit report"],
      cta: { label: "Enquire about internal audit" },
    },
    {
      id: "bookkeeping",
      name: "Accounting & Bookkeeping",
      category: "accounting",
      icon: "book-open",
      order: 1,
      enabled: true,
      featured: true,
      shortDescription: "Maintenance of books of account, reconciliations and monthly MIS.",
      description: [
        "We maintain your books on Tally, Zoho Books or the software you already use, reconcile bank and ledger balances, and close the books each month.",
        "A short monthly summary helps owners see where the business stands without reading full financial statements.",
      ],
      targetAudience: ["Small and medium businesses", "Startups", "Professionals and clinics"],
      scope: ["Day-to-day bookkeeping", "Bank and ledger reconciliations", "Month-end closing", "MIS reports", "Finalisation of accounts"],
      deliverables: ["Updated books of account", "Monthly MIS summary", "Year-end financial statements"],
      cta: { label: "Enquire about bookkeeping" },
    },
    {
      id: "payroll",
      name: "Payroll Compliance",
      category: "accounting",
      icon: "users",
      order: 2,
      enabled: true,
      featured: false,
      shortDescription: "Salary processing support with PF, ESI, professional tax and TDS.",
      description: ["We help employers process payroll and meet related statutory obligations each month."],
      targetAudience: ["Employers with salaried staff"],
      scope: ["Salary computation", "PF / ESI / PT returns", "TDS on salary", "Form 16"],
      deliverables: ["Monthly payroll register", "Filed statutory returns"],
      cta: { label: "Enquire about payroll" },
    },
    {
      id: "company-incorporation",
      name: "Company & LLP Incorporation",
      category: "corporate",
      icon: "building",
      order: 1,
      enabled: true,
      featured: true,
      shortDescription: "Choosing the right structure and registering a company, LLP or firm.",
      description: [
        "We help you choose between a private limited company, LLP, partnership or proprietorship based on liability, compliance and tax considerations, then complete the registration.",
      ],
      targetAudience: ["Founders and new ventures", "Existing businesses converting their structure"],
      scope: ["Structure advice", "Name reservation", "Incorporation filings (SPICe+ / FiLLiP)", "PAN, TAN and bank account support", "Post-incorporation compliance checklist"],
      deliverables: ["Certificate of incorporation", "Compliance calendar for the first year"],
      cta: { label: "Enquire about incorporation" },
    },
    {
      id: "roc-compliance",
      name: "ROC Annual Compliance",
      category: "corporate",
      icon: "landmark",
      order: 2,
      enabled: true,
      featured: false,
      shortDescription: "Annual returns, financial statement filings and event-based ROC filings.",
      description: ["We manage annual filings with the Registrar of Companies and event-based filings such as director changes or changes in capital."],
      targetAudience: ["Private limited companies", "LLPs"],
      scope: ["AOC-4 and MGT-7 / 7A", "LLP Form 8 and Form 11", "DIR-3 KYC", "Event-based filings"],
      deliverables: ["Filed forms and acknowledgements", "Updated statutory registers"],
      cta: { label: "Enquire about ROC compliance" },
    },
    {
      id: "business-advisory",
      name: "Business Advisory",
      category: "advisory",
      icon: "chart",
      order: 1,
      enabled: true,
      featured: false,
      shortDescription: "Financial projections, project reports and guidance on business decisions.",
      description: ["We prepare projections and project reports for bank finance, and help owners think through financial decisions such as pricing, cash flow and expansion."],
      targetAudience: ["Businesses seeking bank finance", "Owners planning expansion"],
      scope: ["Projected financial statements", "CMA data and project reports", "Cash-flow planning", "Working capital review"],
      deliverables: ["Project report / CMA data", "Written recommendations"],
      cta: { label: "Discuss your business" },
    },
  ],

  /* ------------------------------------------------------------------------
   * 8. CLIENT SEGMENTS (who the firm serves)
   * ---------------------------------------------------------------------- */
  clientSegments: [
    { title: "Salaried individuals", description: "Returns, regime choice and notices.", icon: "user" },
    { title: "Professionals", description: "Doctors, consultants and freelancers.", icon: "briefcase" },
    { title: "Startups", description: "Incorporation, compliance and first-year set-up.", icon: "rocket" },
    { title: "SMEs & traders", description: "GST, books, audit and payroll.", icon: "store" },
    { title: "Manufacturers", description: "Audit, GST and costing support.", icon: "factory" },
    { title: "NRIs", description: "Indian income, property sales and repatriation.", icon: "globe" },
    { title: "Trusts & NGOs", description: "Audits and registrations.", icon: "heart" },
  ],

  /* ------------------------------------------------------------------------
   * 9. HOW WE WORK (process steps) and OUR COMMITMENTS ("why clients choose us")
   * Commitments are written as factual practices, not comparative claims.
   * ---------------------------------------------------------------------- */
  process: [
    { title: "Initial conversation", description: "A short call or meeting to understand what you need and what documents exist." },
    { title: "Scope & engagement", description: "A written engagement letter setting out the scope, timeline and fee." },
    { title: "Work & review", description: "We prepare the work, review it internally, and walk you through it before filing." },
    { title: "Filing & follow-up", description: "We file, share acknowledgements, and track any follow-up from the authorities." },
  ],

  commitments: [
    { title: "Direct access to the CA", description: "You work with the Chartered Accountant responsible for your engagement, not a call centre.", icon: "user" },
    { title: "Written scope and fees", description: "Engagement letters set out what is included before work begins.", icon: "file-text" },
    { title: "A compliance calendar", description: "Due dates are tracked for you, with reminders before documents are needed.", icon: "calendar" },
    { title: "Confidential handling", description: "Documents are shared through secure channels and accessed only by the team on your file.", icon: "lock" },
  ],

  /* ------------------------------------------------------------------------
   * 10. FAQS. `pages` decides where each FAQ appears: "home", "services",
   * "contact". Set enabled: false to hide one.
   * ---------------------------------------------------------------------- */
  faqs: [
    {
      question: "How do I start working with the firm?",
      answer: "Call, WhatsApp or email us with a brief description of what you need. We'll arrange a short conversation and then send a written scope and fee before any work begins.",
      pages: ["contact", "services"],
      enabled: true,
    },
    {
      question: "Which documents are needed for filing an income tax return?",
      answer: "Typically PAN, Aadhaar, Form 16 (if salaried), bank statements, interest certificates, investment proofs and details of any capital gains. We send a checklist tailored to your situation.",
      pages: ["services"],
      enabled: true,
    },
    {
      question: "Do you work with clients outside {city}?",
      answer: "Yes. Most compliance work can be handled remotely through secure document sharing and video calls.",
      pages: ["contact", "services"],
      enabled: true,
    },
    {
      question: "How are fees decided?",
      answer: "Fees depend on the scope and complexity of the work. They are agreed in writing before the engagement starts.",
      pages: ["contact"],
      enabled: true,
    },
    {
      question: "Is my information kept confidential?",
      answer: "Yes. Chartered Accountants are bound by professional confidentiality obligations, and client documents are accessed only by the team members working on the engagement.",
      pages: ["contact"],
      enabled: true,
    },
  ],

  /* ------------------------------------------------------------------------
   * 11. TESTIMONIALS: DISABLED by default.
   * Publishing testimonials may not be permissible for Chartered Accountants.
   * Enable only after the CA confirms it is allowed under current ICAI
   * guidance and the client has given written consent.
   * ---------------------------------------------------------------------- */
  testimonials: {
    enabled: false,
    items: [
      // { quote: "", author: "", context: "", consentOnFile: false, verified: false },
    ],
  },

  /* ------------------------------------------------------------------------
   * 12. CREDENTIALS & REGISTRATIONS (shown on the firm page)
   * ---------------------------------------------------------------------- */
  credentials: [
    { label: "Member", value: "The Institute of Chartered Accountants of India", verified: false },
    { label: "Peer review certificate", value: "[Certificate details, if applicable]", verified: false },
  ],

  /* ------------------------------------------------------------------------
   * 13. ENQUIRY FORM
   * The site is static, so the form needs a third-party form service to
   * deliver submissions (e.g. Formspree, Getform, Basin, Web3Forms).
   * Leave `endpoint` empty and the form is clearly marked as not connected;
   * visitors can still send their enquiry by WhatsApp or email.
   * NEVER put secret API keys here: this file is public.
   * ---------------------------------------------------------------------- */
  enquiryForm: {
    endpoint: "", // e.g. "https://formspree.io/f/abcdwxyz"
    providerName: "", // e.g. "Formspree", shown in the privacy policy
    providerPrivacyUrl: "",
    // "json" sends application/json (Formspree, Getform). "form" sends
    // standard form data (most other services).
    format: "json",
    // Hidden "honeypot" spam field. Many services (e.g. Formspree) recognise
    // "_gotcha". Bots fill it in; real visitors never see it.
    honeypotField: "_gotcha",
    // Extra fixed fields sent with each submission (no secrets!).
    extraFields: { _subject: "New website enquiry" },
    successMessage: "Thank you. Your enquiry has been sent. We usually reply within one working day.",
    errorMessage: "Sorry, your enquiry could not be sent. Please try again, or contact us by phone, WhatsApp or email.",
    notConnectedMessage:
      "Online form submission is not set up on this website yet. Your details won't be sent from here. Use the buttons below to send the same message by WhatsApp or email instead.",
    consentText: "I agree that the details I have entered may be used to respond to my enquiry, as described in the",
  },

  /* ------------------------------------------------------------------------
   * 14. PAGE COPY: headings and short text for each section.
   * Set `enabled: false` on a section to hide it.
   * ---------------------------------------------------------------------- */
  pages: {
    home: {
      hero: {
        eyebrow: "{designation} · {city}",
        headline: "Careful advice on tax, audit and compliance.",
        lead: "", // "" uses profile.introduction
        primaryCta: { label: "Contact us", href: "contact.html" },
        secondaryCta: { label: "Explore services", href: "services.html" },
      },
      firmIntro: { enabled: true, eyebrow: "The practice", title: "A small practice, run with discipline." },
      services: { enabled: true, eyebrow: "Services", title: "What we help with", intro: "Core areas of practice. Each links to the scope of work and what you receive.", linkLabel: "View all services" },
      segments: { enabled: true, eyebrow: "Who we serve", title: "Clients we work with", intro: "" },
      commitments: { enabled: true, eyebrow: "Working with us", title: "What you can expect", intro: "" },
      profile: { enabled: true, eyebrow: "The Chartered Accountant", title: "", linkLabel: "Read full profile" },
      process: { enabled: true, eyebrow: "How we work", title: "From first call to filing", intro: "" },
      testimonials: { enabled: true, eyebrow: "Client feedback", title: "In clients' words" },
      contact: { enabled: true, eyebrow: "Get in touch", title: "Discuss your requirement", intro: "Call, send a WhatsApp message or email. We'll respond within one working day." },
    },
    about: {
      eyebrow: "About the CA",
      bioTitle: "Profile",
      qualificationsTitle: "Qualifications & membership",
      journeyTitle: "Career",
      specializationsTitle: "Areas of practice",
      achievementsTitle: "Professional recognition",
      philosophyTitle: "Approach",
      ctaTitle: "Speak with the CA directly",
      ctaText: "For an initial conversation about your requirement, call or message the office.",
    },
    firm: {
      eyebrow: "Our firm",
      backgroundTitle: "Background",
      historyTitle: "Milestones",
      missionTitle: "Mission",
      visionTitle: "Vision",
      valuesTitle: "Values",
      approachTitle: "How engagements are run",
      teamTitle: "Team",
      segmentsTitle: "Clients we serve",
      presenceTitle: "Where we work",
      credentialsTitle: "Registrations",
      photosTitle: "Our office",
    },
    services: {
      eyebrow: "Services",
      title: "Areas of practice",
      intro: "Choose a category, or open any service to see the scope of work, who it's for and what you receive.",
      allLabel: "All services",
      faqTitle: "Common questions",
    },
    service: {
      audienceTitle: "Who this is for",
      scopeTitle: "Scope of work",
      deliverablesTitle: "What you receive",
      relatedTitle: "Related services",
      asideTitle: "Enquire about this service",
      asideText: "Share a few details and we'll come back to you within one working day.",
      notFoundTitle: "Service not found",
      notFoundText: "This service may have been renamed or is no longer offered.",
    },
    contact: {
      eyebrow: "Contact",
      title: "Get in touch",
      intro: "Choose whichever is most convenient. For document-heavy matters, email is usually best.",
      formTitle: "Send an enquiry",
      formIntro: "Tell us briefly what you need. Please don't include PAN, Aadhaar or bank details here.",
      hoursTitle: "Office hours",
      mapTitle: "Location",
      faqTitle: "Before you get in touch",
    },
  },

  /* ------------------------------------------------------------------------
   * 15. LEGAL PAGES. Sample text only; have it reviewed before publishing.
   * ---------------------------------------------------------------------- */
  privacy: {
    lastUpdated: "2026-11-12",
    intro: "This policy explains what information this website collects, why, and how it is handled. It applies only to this website.",
    sections: [
      {
        heading: "Information we collect",
        paragraphs: ["We collect only the information you choose to give us when you contact us: typically your name, phone number, email address, company name, the service you are interested in and your message."],
        list: [],
      },
      {
        heading: "Purpose of collection",
        paragraphs: ["We use this information solely to respond to your enquiry and, if you engage us, to provide professional services. We do not sell or rent personal information, and we do not use it for unsolicited marketing."],
        list: [],
      },
      {
        heading: "Enquiry form",
        paragraphs: [
          "When the enquiry form is connected, submissions are delivered to {firm} through a third-party form service, which processes the data on our behalf. If you choose WhatsApp or email instead, your message is handled by that service under its own terms.",
          "Please do not send PAN, Aadhaar, bank details or other sensitive documents through the website form.",
        ],
        list: [],
      },
      {
        heading: "Cookies and tracking",
        paragraphs: ["This website does not use analytics or advertising cookies. Your browser stores a small preference to remember that you accepted the entry disclaimer. Fonts are served from this website, not from third parties."],
        list: [],
      },
      {
        heading: "Third-party services",
        paragraphs: ["Links to WhatsApp, Google Maps, LinkedIn and other external sites take you to services that have their own privacy policies. The office map is loaded from Google only if you click “Show map”."],
        list: [],
      },
      {
        heading: "Data retention and security",
        paragraphs: ["Enquiries are kept only as long as needed to respond and for any related engagement, or as required by law. We take reasonable steps to protect information in our possession."],
        list: [],
      },
      {
        heading: "Your choices",
        paragraphs: ["You can ask us to see, correct or delete personal information you have sent us by writing to {email}."],
        list: [],
      },
    ],
    contactHeading: "Privacy enquiries",
  },

  disclaimer: {
    lastUpdated: "2026-11-12",
    sections: [
      {
        heading: "No solicitation",
        paragraphs: ["This website is meant only to provide information about {firm} to those who seek it. It is not intended to solicit work or advertise, in keeping with the rules of the Institute of Chartered Accountants of India."],
      },
      {
        heading: "Not professional advice",
        paragraphs: ["Content on this website is general in nature and does not constitute professional advice. Tax and regulatory provisions change frequently. Please consult us before acting on any information here. No client relationship is created by using this website or contacting us through it."],
      },
      {
        heading: "Accuracy",
        paragraphs: ["While we try to keep information current, we make no representation that it is complete or up to date, and we accept no liability for any loss arising from reliance on it."],
      },
      {
        heading: "External links",
        paragraphs: ["Links to third-party websites are provided for convenience. We are not responsible for their content or practices."],
      },
    ],
  },

  /* ------------------------------------------------------------------------
   * 16. FOOTER
   * ---------------------------------------------------------------------- */
  footer: {
    blurb: "A Chartered Accountancy practice in {city} for tax, audit, accounting and corporate compliance.",
    copyright: "© {year} {firmLegal}. All rights reserved.",
    note: "Information on this website is general in nature and is not professional advice.",
  },
};

export default siteData;
