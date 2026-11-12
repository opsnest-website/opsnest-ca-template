# Pre-publication content review

Complete this checklist with the Chartered Accountant before setting `website.draftMode` to `false` and publishing.

**This website template does not make the site ICAI-compliant by itself.** The controls in it (verification flags, testimonials switched off, an entry disclaimer, non-comparative wording) are there to help. The CA remains responsible for checking all content against the ICAI Code of Ethics, current Council guidelines on websites and advertising, and any other applicable law, as they stand at the time of publication.

## 1. Replace all sample content

Search `src/data/site-data.js` for `SAMPLE`, `[`, `example.com` and `98765`. Nothing in the file should still be fictitious.

- [ ] `profile`: real name, designation, introduction, biography, experience summary
- [ ] `firm`: real firm name, legal name, constitution, established year, background, history
- [ ] `contact`: real phone numbers, WhatsApp, email(s), full address, maps link, hours
- [ ] `social` and `profile.links`: real LinkedIn URLs, or `""` to hide them
- [ ] `firm.team.members`: real people (with their consent), or remove the placeholders
- [ ] `firm.locationsServed`, `clientSegments`: only locations and client types actually served
- [ ] `services`: only services the firm actually provides; disable the rest
- [ ] `seo.keywords` and descriptions use the real city
- [ ] Logo (`assets/images/logo.svg`), favicon (`assets/icons/favicon.svg`), portrait and `og-image.png` replaced

## 2. Items that need the CA's approval

Each item is hidden in production until marked `verified: true`.

| Item | Location in `site-data.js` |
|---|---|
| Qualifications (titles, institutions, years) | `profile.qualifications[]` |
| ICAI membership body, number, member-since | `profile.membership` |
| Year practice began | `profile.practiceSince` + `practiceSinceVerified` |
| Career history | `profile.careerJourney[]` |
| Achievements / recognition (off by default) | `profile.achievements` |
| Firm registration number (FRN) | `firm.registration` |
| Credentials / peer review | `credentials[]` |
| Testimonials (off by default; also need `consentOnFile`) | `testimonials` |

- [ ] Each item above is accurate, current and permissible to publish
- [ ] Membership and registration numbers are published only if the CA chooses to

## 3. Wording

- [ ] No claims of being "best", "leading", "top", "No. 1" or similar, and no comparisons with other firms
- [ ] No statistics (client counts, success rates, savings) unless verified and permissible
- [ ] No client names, logos or case details without written authorisation
- [ ] No fee quotes or discount offers, unless confirmed as permissible
- [ ] "What you can expect" (`commitments`) describes practices the firm actually follows
- [ ] Service descriptions are accurate and current (thresholds, form names, due dates)

## 4. Legal pages and disclaimers

- [ ] Entry disclaimer text (`website.entryDisclaimer`) reviewed; keep it, change it or set `enabled: false`
- [ ] Disclaimer page (`disclaimer`) reviewed
- [ ] Privacy policy (`privacy`) reviewed and matches how enquiries are actually handled
- [ ] If a form service is connected, `enquiryForm.providerName` and `providerPrivacyUrl` are set
- [ ] `lastUpdated` dates set

## 5. Technical go-live

The **release gate** in CI (`scripts/check-release.mjs`) checks the mechanical items automatically and blocks deployment until they pass. Run `node scripts/check-release.mjs` locally to see the same report. It cannot judge wording or accuracy; sections 2–4 above remain the CA's responsibility.

Automated (deployment is blocked until these pass):

- [ ] `website.draftMode` is `false`
- [ ] No `[placeholders]`, `SAMPLE` markers, `example.com` addresses or template names/numbers left in published content
- [ ] `website.siteUrl` + `website.basePath` match the GitHub Pages address
- [ ] Placeholder portrait replaced; all referenced images exist
- [ ] No configuration errors

Manual:

- [ ] Logo, favicon and social image replaced (reported as advisory)
- [ ] `seo.structuredData.enabled` decided
- [ ] Enquiry form tested end-to-end (if an endpoint is configured)
- [ ] Every Call, WhatsApp, email and map link tested on a phone after deploy
- [ ] Sitemap line added to the domain-root `robots.txt`
