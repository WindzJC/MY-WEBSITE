# Astra Productions Website Upgrade Preview

Status: Cloudflare preview deployed for review only. NOT live-domain production, NOT approved for final publication.
Preview worktree: D:/VS/astra-website-upgrade-preview
Source main checkout: D:/VS/MY WEBSITE (untouched)
Preview branch: astra-site-upgrade-preview-20261015

## Delivered in preview
- Homepage repositioned around From the story to the reader.
- Clearer primary actions, featured work moved near opening, 3 service categories, streamlined audit, creation-to-promotion explanation, and about section; testimonial block removed.
- Updated /our-work: 2 verified author website examples and 11 published Astra YouTube videos; concept preview removed.
- Three project detail pages under /projects.
- New /discover-books: preliminary reader showcase referencing only existing public portfolio projects and verified external links.
- All existing pricing tiers preserved: $499, $999, $1299, $399.
- Existing inquiry form and /api/inquiry code untouched.
- Added clean routes, Vite multi-page build inputs, and book-trailers service page with realistic production scope and deliverables.
- Added a proposed Astra Author Spotlight one-time organic publishing pilot, scope and rights limits, and a separate future paid-promotion direction.

## Publication requirements
1. Obtain author/client permissions before developing complete author profiles and using new materials.
2. Confirm approved official covers, portraits, book copy and current retailer links.
3. Obtain confirmation that project descriptions and featured client works are approved for expanded reuse.
4. Test contact form delivery in an authorized staging environment without generating fake leads.
5. Review performance, accessibility and mobile layout.
6. New pages are marked noindex, follow pending approval. Remove noindex only after review and decide sitemap policy.
7. Advertising management and production deployment are NOT part of this preview.

Use npm ci then npm run build or npm run dev from this worktree.
This branch is reserved for preview review. Do not merge to main or deploy to production without approval.

## Latest quality verification
- 44 browser page/viewport checks across 360, 390, 768 and 1440 widths: passed with zero errors after mobile menu and media corrections.
- Gallery images fetched and verified; author concept removed from author websites as well as Our Work.
- Contact form markup is present, but successful live email delivery was NOT exercised.

## Film-inspired cinematic design revision (2026-10-15)
- Original Astra branded full-width hero and visual system with local stills from published Astra trailers, not Film 14 assets or copied text.
- Rebuilt film-first featured work, three visual service panels, high-contrast conversion actions, swipeable mobile trailer previews and coordinated internal-page styling.
- Kept real-book portfolio, approved project boundaries, original service prices, free review and inquiry form.
- Browser smoke checks: 40 routes/viewport combinations, zero failures. Contact delivery and permissions still require sign-off before production.

## Full-site cinematic redesign + separated portfolio galleries (2026-10-15)

- Removed category filter pills from /our-work and replaced with two prominent project entry points.
- Created /our-work/book-trailers containing 10 published video teasers/trailers; excluded separately classified author-profile video.
- Created /our-work/author-websites with exactly 2 completed client websites, no concepts.
- Rebuilt /author-websites and /book-trailers as premium cinematic service pages with real imagery, scoped process details, realistic limits and preserved starting prices ($499/$999).
- Rebuilt /discover-books, 3 project detail pages, /privacy, and /thank-you to share a consistent studio header and overall visual direction with homepage.
- Unified navigation: Home, Our Work, Book Trailers, Author Websites, Discover Books, After Production, plus Start a Project CTA.
- Preserved homepage inquiry form and existing /api/inquiry code; changed no production checkout files.
- Added Vite MPA inputs, canonical path mapping and clean URL rewrites for nested gallery routes.
- QA: Vite production build passed, 40 browser page-width checks passed (0 failures after tablet overflow fix), 6 utility page-width checks passed, 10-page asset/link checks passed.
- The site remains preview-only: verify expanded permissions/rights, external book links, legal copy, mobile/browser coverage and actual staging inquiry delivery before production launch.
- Codex CLI was available but its cached version/model configuration could not execute this redesign reliably; implementation and QA were completed directly.

## Sprint: factual case studies + safe inquiry QA (2026-10-15)
- Codex GPT-6 Astra Medium created the three premium factual studies: /projects/queen-of-intelligence, /projects/hide-and-seek and /projects/john-oross.
- Expanded gallery/service links to the factual case studies, preserving direct public video and author website access.
- Added tracked npm run test:inquiry for 31 zero-network mock verification tests (all passing).
- Staging GET/HEAD /api/inquiry: HTTP 405, Allow: POST. This DOES NOT confirm live Resend delivery.
- Browser QA: 50 route/viewport combinations (360/390/768/1024/1440) passed, plus intercepted homepage form error and recovery behavior; NO real email POST.
- Await owner-controlled real staging inbox test, client promotional reuse rights, factual book links and approval before production launch.
