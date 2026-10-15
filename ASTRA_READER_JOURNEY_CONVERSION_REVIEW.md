# Astra Productions — Reader-journey and conversion sprint

Date: October 16, 2026
Branch: `astra-site-upgrade-preview-20261015` — preview only

## Purpose

Help a prospective author recognize a practical issue while scrolling: a recommendation or trailer can make a reader curious, but disconnected book links, bios, reading orders, video and purchase destinations can make the next action unclear. A good author website organizes the reader journey; a trailer helps communicate a story. Neither automatically produces traffic or book sales.

## Implemented on the preview

- Added the editorial section after the published trailer gallery: **“A reader hears about your book. Then what?”**
- Contrasts the fragmented online presentation of an author's work with a practical single home: author, books, reading order, trailer, purchase links and optionally reader signup.
- Ends with the reflective question: **“What happens after someone becomes interested in my book?”**
- Provides two distinct CTAs: **Review my reader path** and **I already know what I need — request a quote**.
- The homepage form offers the two options, dynamically updates explanatory text and submit label, and submits the selected `inquiry_type`.
- Server validates the allowed values, labels the internal email and confirmation appropriately, and defaults old forms to `review` for backwards compatibility.
- Updated thank-you language so quote requests aren't promised a free review.
- Aligned fixed delivery time/revision claims in the homepage FAQ/bundle to quote-based schedules; previously advertised starting prices remain unchanged.
- Clarified the proposed Spotlight as a limited pilot subject to author approval, not automatic guaranteed free distribution.

## Verified

- `node --test tests/*.test.mjs`: 44 passing automated test results, including mocked review and quote email paths, no real external provider calls.
- `npm run build`: passed.
- `node scripts/check-static-links.mjs`: 13 pages, 461 internal references, zero errors; 36 external URLs require separate checking.
- Puppeteer viewport test at 360 / 390 / 768 / 1024 / 1440 pixels: the homepage section exists, no horizontal overflow or runtime errors, correct quote intent and payload, plus query-prefill support.
- Mocked browser request for `/api/inquiry` only; **no real emails were sent**.

## Release gates and measurement roadmap

- Keep production `main` and `astraproductions.co` unchanged without a separate explicit launch approval.
- Conduct one authorized real end-to-end Cloudflare/Resend staging inquiry to verify both internal notification and visitor confirmation.
- Confirm rights to individual client trailer frames, images, website screenshots, and author-facing quotes before indexing the redesigned site.
- Conversion events remain **unmeasured**: current `data-analytics-event` labels are not proof of live analytics. Before launch, agree on a suitable analytics platform, set privacy disclosures and track service visits, inquiry-intent choices, submission success, and source/qualified lead follow-through without unnecessarily collecting personal data.
- Evaluate actual submission rates and paid outcomes before further A/B testing or design changes.
