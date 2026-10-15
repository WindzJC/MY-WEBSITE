# Astra Productions — Evidence-based pre-launch revisions

**Date:** October 16, 2026
**Project:** `D:\VS\astra-website-upgrade-preview`
**Scope:** Preview branch only. No changes to production `main`.
**Status:** Launch review in progress; **NO-GO** for the production domain pending owner authorization and verification.

## Verified facts and changes

1. **Testimonials temporarily withheld.** Three attributed endorsements by Philip L. Rettew, Frank Roberts, and Geoffrey O'Farrell appeared on the homepage and service pages. An exact-phrase search of the connected Astra Gmail account (`astraproductionsbyjc@gmail.com`) produced no source messages; available Astra project briefs required testimonials to be authentic and approved. This is **not proof that the testimonials are fabricated**: Astra also uses `jc@astraproductions.co` through PrivateEmail, which has not been searched. Removed testimonial sections from preview until original email, message, or explicit approval can be supplied.

2. **Scope and timing statements softened.** Removed default "3–5 days" for websites, "5–7 days" for trailers and unconditional "two revision rounds" as promises. Pages now say the schedule and revision plan are agreed per written quote. The $499 website, $999 trailer, $1,299 bundle and $399 launch-graphics starting prices remain unchanged, pending business approval. The purpose is not to hide details; it is to avoid commitments not yet verified as standard operating practice.

3. **Hide and Seek restored to preview.** Reinstated the earlier factual trailer case-study page (`e73d2e0`), clean routing, relevant sitemap entry and trailer availability in the in-page player. Added the real video and case-study links back to both project galleries; titles now list 10 published trailers. **The Queen of Intelligence remains the featured homepage project.** No invented author or plot was added.

4. **Shared-network inquiry protection regression tested.** Mock-only test verifies two independent inquiries with different author email addresses and the same source IP receive distinct internal provider idempotency keys. This fixes the earlier shared-Wi-Fi collision, but same-address repeat submissions within five minutes may still be blocked; the email service and Cloudflare sender configuration require an owner-authorized live staging test.

## Verification

- The preview Vite build passed.
- **41** local automated test results passed across mocked inquiry handling, click-to-load video, gallery playback and clean-URL routing. No external provider calls.
- **459** compiled-site internal asset/link references passed static verification (the prior count; refreshed build should be checked again before a commit).
- **39** local browser checks across 13 routes and 360/768/1440 viewport sizes passed. HTTP 304 conditional responses were accepted as valid, with no missing images, runtime exceptions, or horizontal overflow.
- No actual inquiry POSTs, client emails, or changes to the production website occurred.

## Release gates

- Retrieve and verify original testimonial text, precise attribution and reuse permission; restore only the messages clearly authorized for public use.
- Authorize one clearly marked real staging inquiry using an Astra-controlled sender/recipient to confirm both emails and delivery logs. No such test has been sent.
- Approve scope, actual delivery commitments, revision limits, hosting/domain responsibilities and optional Spotlight promotion obligations.
- Confirm rights to reuse book covers, trailer stills, stock footage and client project screenshots in website marketing.
- Check external buying links, mobile readability and live SEO settings before any separate reviewed pull request into `main`.

**Production publication is not authorized by these preview changes.**
