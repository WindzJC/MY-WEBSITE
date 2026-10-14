# Astra Preview â€” Inquiry System Verification

**Scope:** safe local verification of the existing Cloudflare Pages inquiry function and frontend contract. Preview branch only. **No real emails sent** and no Resend API credentials used.

## Automated tests

Run `npm run test:inquiry`. This invokes Node's built-in test runner against `functions/api/inquiry.js` with a strictly mocked `globalThis.fetch`. The test uses a synthetic API key and `example.test` fixtures.

The suite verifies method/origin checks; invalid content types and JSON; request/body length limits; required fields, email/URL and timing validation; honeypot rejection; ordered internal and author confirmation emails; reply addresses, HTML escaping and idempotency keys; internal sending failures; nonfatal author confirmation failures; and provider 409 rate-limit handling.

Expected result: **31 passing tests / 0 failed**, subject to read-back QA. Any unexpected provider call is blocked by the mock.

## What this does not establish

- Real Resend delivery, domain authentication, verified sender status, SPF/DKIM, inbox placement, or production/staging secret configuration.
- Whether the Cloudflare staging deployment has the appropriate `RESEND_API_KEY` or correct service binding.
- Human-to-human confirmation of an actually delivered message.
- Whether the existing 5-minute IP-based provider idempotency/rate-limiting behavior is optimal for public usage.

## Safe staging validation

The preview's `GET /api/inquiry` may be checked without sending email. A successful safety response would normally be HTTP 405 with `Allow: POST`; this proves routing and method rejection only, not email delivery.

A genuine end-to-end delivery trial should be performed only after a deliberate authorization to send a **single identifiable test inquiry** to the studio's own inbox, with a test email address under the studio's control. Do not send trial submissions to authors or customers. Review the internal and confirmation messages, Resend delivery dashboard, Cloudflare logs and privacy handling. Only then mark provider delivery as verified.

## Release gate

Keep the redesigned preview unpublished on the production domain until the inquiry system, client material permissions and service offer wording are approved. No secret tokens, real client data or login information should be committed.

## Safe hosted staging routing result (15 October 2026)
- Checked preview URL with **GET** and **HEAD only**; no POST requests or messages were sent.
- Both returned HTTP **405 Method Not Allowed**, with **Allow: POST**, **Cache-Control: no-store** and a JSON method-rejection response for GET.
- This confirms Cloudflare routing and the method guard, not provider email delivery.
