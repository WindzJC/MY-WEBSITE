# Astra Productions — Final Launch-Readiness Audit

**Audit date:** 15 October 2026
**Review scope:** Astra's isolated Cloudflare preview branch `astra-site-upgrade-preview-20261015`, not `main`
**Production website:** https://astraproductions.co/ — must remain unchanged unless explicitly approved
**Preview:** https://astra-site-upgrade-preview-2.astraproductions.pages.dev/
**Decision: NO-GO for production deployment.** The design and local technical verification are strong, but specific business and delivery gates are unresolved.

## Executive summary

The redesigned website is visually credible and generally navigable, with separate trailer and author-website galleries, straightforward entry points, clear calls to action and premium case studies. This audit did **not** find broken internal assets or mobile horizontal overflow during reviewed test runs. A website passing browser tests is not the same as a website being ready to accept paying clients.

### P0 — Required before a live-domain launch

1. **Verify an actual inquiry delivery, with the owner's explicit authorization.** The Cloudflare Pages function `functions/api/inquiry.js` and browser interaction have passed 31 mocked provider tests. Public preview `GET /api/inquiry` returned 405 with `Allow: POST`, confirming routing and method rejection. We have **not** performed a real POST or validated Cloudflare environment secrets, sender/domain authentication, Resend acceptance, delivery to `jc@astraproductions.co`, or author confirmation email. Test only once, deliberately, using the owner's own test inbox and a marked synthetic inquiry. Review Cloudflare/Resend logs and end-to-end receipt before launch.

2. **Confirm copyright and client consent for all portfolio materials used outside the original project.** Astra's own YouTube uploads are evidence of published videos, not necessarily standalone rights to reuse individual stock-footage frames, music, client book jackets, credited identities, or other licensed visuals. See `CASE_STUDY_MEDIA_PROVENANCE.md`. Obtain necessary project approval or replace non-cleared media before indexing.

3. **Approve the truthfulness and scope of commercial offers.** Existing advertised starting figures are USD $499 (author websites), $999 (book trailers), $1,299 (bundle), and $399 (graphics). Confirm what each package includes, how revision rounds and delivery times operate, any separately billed stock/hosting/domain fees, cancellation/refund policy, and which roles Astra genuinely provides. Do not add production guarantees or fabricated conversion outcomes.

4. **Resolve the SEO mode intentionally at production cutover.** The preview should remain `noindex`, including its homepage and Privacy page. The website's generated `robots.txt` and `sitemap.xml` use `getSiteUrl()` and may be tied to production-oriented defaults; `seo.config.mjs` presently lists only three `SITE_PATHS` for the eventual sitemap. Do **not** blindly promote a preview branch with `noindex` tags to the live domain. Before launch, explicitly configure production indexability and expand/validate the production sitemap for approved public pages while continuing to keep private/concept-only pages out of search.

### P1 — Important release and operational issues

5. **Review the inquiry anti-spam limit.** The backend creates one Resend idempotency key per IP address and five-minute time bucket for the internal notification. That can reject separate valid inquiries from people sharing one IP or a legitimate author submitting a new request soon after another. It also is not a comprehensive, durable anti-abuse system. Consider an appropriately scoped Cloudflare/KV/Durable Object rate limiter and per-request idempotency; do not simply disable anti-abuse without replacement.

6. **Resolve project status and proof.** The John Oross public author site explicitly labels itself an Astra-built **website concept**; the preview now identifies it as a published design concept, not a confirmed commissioned client launch. Independently verify the status, launch responsibilities and permissions for the Frank Roberts example and any other client work before representing all examples as completed paid engagements.

7. **Approve the legal/privacy policy with an appropriate reviewer.** The current policy discloses contact submissions and transactional providers, but a final legal review should consider retention, geographic processing, consent, analytics/cookies if any, deletion processes and service-provider accuracy. Do not silently rewrite legal commitments or promise retention practices that have not been implemented.

8. **Validate external destinations on release day.** The built static checker counted 35 outbound/external URL occurrences that it cannot validate offline. The independent visual-site audit found 17 distinct publicly linked destinations across the reviewed pages; sample checks confirm the John Oross publisher page and Astra example sites respond, but some retailer/video destinations and long-term correctness remain unverified. Check final author, buying, social-media and gallery links individually and confirm rights/approval for linking.

9. **Human review of mobile purchasing and inquiry paths.** Automated browser checks cover technical usability; have a real author who has not seen the project attempt to find a trailer, compare package prices and submit a test request in staging. Check accessibility with keyboard/screen reader, especially menus, contact errors, and embedded video.

### P2 — After-launch enhancements

10. Trim legacy CSS layers and duplicate font imports when safe. Improve resource caching/font loading and visual stability; the website is not currently proven to meet specific Core Web Vitals thresholds because a production Lighthouse field audit was not performed.
11. Build more rights-cleared, factual client case studies with verified brief, deliverables and permission to quote outcomes. Avoid imagined testimonials and performance metrics.
12. Establish a reliable process for optional Astra Author Spotlight promotion, with author opt-in, content approval, rights checking and a finite free-service boundary. Paid campaign services should follow a documented delivery pilot and real pricing analysis.

## Verified technical results

- **Independent deployed-preview browser audit:** 39 page/width combinations (13 routes x 360, 768, 1440 pixels), zero JavaScript errors, absent local image assets or horizontal overflow. All visited routes returned HTTP 200.
- **Codex-assisted local accessibility and browser audit:** 39 page/width combinations passed, including mobile menu keyboard operation, duplicate IDs, ARIA targets and scripts; there was a minor responsive Frank Roberts image stretch fixed in the preview CSS.
- **Production build:** `npm run build` passed under Vite 7.3.1.
- **Static built-output link audit:** 13 HTML pages, 458 internal references, zero failures, zero unresolved canonical/OG template tokens, with 35 external links/URLs requiring independent review.
- **Local automated tests:** 31 inquiry/provider mocks + 4 click-to-load video tests + 2 clean-URL routing tests = **37 passing tests**, zero failures.
- **API staging safety check:** `GET /api/inquiry` returned 405, `Allow: POST`. No live form POST or email sent.
- **Production isolation:** all changed code is restricted to the Cloudflare preview worktree; production checkout `D:\\VS\\MY WEBSITE` stayed on `main` commit `e5995c9`.

## Focused preview fixes made during audit

- Normalized inconsistent robots meta tags to `noindex, follow` on the homepage and utility pages; Cloudflare also currently serves a preview `X-Robots-Tag: noindex` header. These tags are intentionally **not** production-launch SEO settings.
- Improved selected alternative-image/caption wording and publishing-status language to avoid treating John Oross as a verified client launch.
- Corrected a responsive case-study screenshot treatment.
- Added small form/navigation accessibility safeguards and clean-URL route regression tests.
- Added a deterministic built-output static link validation script. No dependency additions, real email calls, production deployment or credential changes.

## Exact release procedure

**Do not merge or publish production without user approval.** Obtain media/client permission records and package sign-off; run one owner-authorized real staging inquiry email; verify recipients and deliverability; run real-device and keyboard accessibility spot-checks; verify final outbound links; prepare production-only indexing/sitemap configuration; inspect resulting production build artifacts; back up existing live deployment; then request final authorization to publish `main`.

**Current decision: NO-GO** until the P0 release gates are resolved. The preview may continue to be reviewed and improved.
