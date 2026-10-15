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

## Focused case-study refinement (2026-10-15; local implementation)

- Queen: replaced the large white retailer-card hero with a dark typographic opening and an immediately available player. Kept Harvey Havel and the full book attribution. The original public end card is a small, explicitly labeled detail; no substitute scene or fictional character was created.
- Hide and Seek: moved playback directly below the opening, shortened defensive copy, and added a full-width, credited view of the existing forest still with composition/color callouts. Observations concern that visible frame; no plot, author, filming team or outcomes were invented.
- John Oross: retained the genuine homepage capture and added three architecture callouts linking to the existing completed-site URL. No interior screenshots were available at initial inspection. Links explicitly instruct readers to choose the named navigation item on the site; no unverified deep routes were invented.
- Shared case-study-video.js creates one YouTube privacy-enhanced iframe only on explicit poster/hero activation. Exact IDs: fNwTSZKmpis and luX6gA05Si4. Native keyboard button, labeled iframe, focus transfer, immediate scroll, modified-link behavior and always-visible external fallback included. No decorative autoplay or video preconnection.
- Inquiry root cause: styles.css globally requests smooth scrolling, and script.js animates internal anchor clicks. Scoped CSS makes /#start arrival immediate; the handler makes #start clicks immediate and measures the actual shared header. Form markup, submission, validation and API implementation remain unchanged.
- Existing case-study noindex metadata and navigation preserved. The homepage's pre-existing index, follow metadata was not changed; controller must review preview-wide indexing policy before publication.

### Local QA evidence

- npm run build: passed (Vite 7.3.1). Build-generated SEO date/line-ending changes were returned to their pre-sprint content; no SEO artifact changes retained.
- npm run test:inquiry: 31 passed, provider requests fully mocked; no real email.
- node --test tests/case-study-video.test.mjs: 4 passed (inert initial state, exact privacy URLs, duplicate activation, modified navigation and unrecognized-ID rejection).
- node --check script.js and node --check case-study-video.js: passed.
- Local Chrome: 12 case-study/viewport combinations at 360/390/768/1440 passed: no horizontal overflow, missing images or page script errors; unchanged six-link navigation and noindex present.
- Both hero activation and keyboard Space activation created exactly one player with the expected URL and moved focus into it. Zero video requests before activation; all external page requests, including the 16 attempted video loads, were blocked by QA interception. Live YouTube playback was not exercised.
- Eight homepage arrival checks (four widths, normal/reduced motion) passed: immediate scroll behavior, form present, no overflow, section positioned about 115px below the viewport top. JavaScript-disabled viewing retained the direct YouTube fallback.
- Visual captures reviewed with external fonts blocked. Evidence: qa/refinement-results.json, qa/refinement-qa.cjs and qa/refinement-{project}-{390,1440}.png (local ignored QA artifacts).
- git diff --check: passed after correcting CRLF whitespace on the three edited script lines. Initial lazy-image QA assertion was corrected to await image decoding; final checks passed.

### Controller handoff / rights still pending

- Confirm client approval for expanded portfolio presentation and reuse of footage, music, book artwork, retailer branding and website screenshots. Public availability is not a reuse license.
- Verify current YouTube embedding/playback, external completed-site/book links and final typography online in the controller's authorized review environment. No external content was fetched for this implementation.
- Six new files appeared concurrently under public/case-studies/stills (queen-establishing/response/window and hide-door/forest/movement). They were not created or modified by this sprint and remain unreferenced pending controller confirmation of provenance. Current layouts are complete without them.
- No dependencies, active Codex/global settings, production checkout, production runtime or recipient state changed. No commit, push or deployment performed. Rollback is limited to the seven implementation/document files and new video regression test listed in the final report; preserve concurrent assets and pre-existing .codex work.

## Focused cinematic case-study polish (15 October 2026)
- Replaced Queen retailer-logo poster with a verified backlit frame from Astra's published video; added a three-frame Queen sequence and three real Hide and Seek film frames captured from Astra's public trailer uploads.
- Improved desktop poster coverage and corrected mobile/desktop gallery aspect ratios after visual screenshot inspection.
- Added three real page screenshots from the published John Oross site concept (Book, Explore, About). The original public site explicitly identifies itself as a concept; portfolio and service pages now label John accordingly, not as a verified client launch.
- Retained Codex's tested click-to-load privacy-enhanced player, immediate inquiry navigation and concise factual case-study writing. Browser confirmed inline embed loads correctly with referring page context; external YouTube links remain a fallback.
- Latest local tests: 31 inquiry mocks + 4 player tests passed, Vite build passed, 24 viewport/page browser checks passed and mobile project CTA brought the contact form into view.
- Media capture provenance and usage-rights caution documented in CASE_STUDY_MEDIA_PROVENANCE.md. No live-email test was sent. Production stays unchanged.
