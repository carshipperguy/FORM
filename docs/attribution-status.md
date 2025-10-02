## Meta Pixel & Attribution - Current Status and Plan

### Context
- Public quote form runs in an iframe (Replit app) embedded on `amerigoautotransport.net`.
- CRM is a separate Replit app. Leads are sent to Zapier; Zapier pushes into CRM.
- Pixel ID in use: `953087976815191` (browser + CAPI).

### Issues Identified
1) Duplicate Lead events
   - Iframe fired `fbq('Lead')` on mount and on submit, while the parent also fired a Lead via `postMessage`.
   - Result: overcounted Leads, incomplete dedup.

2) Parent → iframe attribution mismatch
   - Iframe listened for `ATTRIBUTION_DATA` but parent sends `AMERIGO_ATTR_RESPONSE`.
   - Result: `fbclid`/UTMs intermittently missing.

3) PageView from iframe domain
   - Pixel initialized inside iframe; when embedded, PageView came from `replit.app` instead of the website domain.
   - Result: weaker session/click linkage.

4) PII in URL on the final page
   - `final-quote` URL included name/email/phone in a `data=` query param → Events Manager warning: Business Tools Terms violation.

5) Optional risk: parent origin allowlist is narrow
   - Parent script currently allows only specific origins; host changes could drop events.

### What We Changed (done)
- Removed duplicate Lead calls inside the iframe (mount-time and submit-time).
- Aligned iframe listener to accept `AMERIGO_ATTR_RESPONSE` (and legacy `ATTRIBUTION_DATA`).
- Guarded iframe Pixel `PageView` so it does not fire when embedded; parent remains source of PageView.
- Branch: `fix/meta-pixel-dedup` (PR opened).

### What’s Next (planned)
1) Remove PII from URL on `final-quote`
   - Store payload in `sessionStorage` (or a short-lived server token) and navigate without `data=` query param.

2) Verify CAPI credentials
   - Ensure `META_PIXEL_ID=953087976815191` and a valid `META_CAPI_ACCESS_TOKEN` are set in Replit Secrets (Form & CRM apps).

3) Optional hardening
   - Broaden parent allowlist to include `replit.app|repl.co|replit.dev` and any custom form domains.
   - Confirm CRM app is not emitting extra Pixel events.

### How to Test (no ad spend)
1) Events Manager → Test Events: generate a test code.
2) Visit the form with `?test_event_code=YOURCODE` and submit once.
3) Expect:
   - Browser: 1 Lead with `eventID`.
   - Server (CAPI): 1 Lead with the same `event_id` → deduplicated.
   - Pixel Helper: one Lead on submit (multiple PageViews are normal across pages).

### Expected Behavior After Deploy
- One counted Lead per submission (dedup in place). You may see two rows in Test Events (Browser + Server) but they represent a single deduped conversion.
- PageView from the website domain, not the iframe domain.
- No Business Tools Terms violations (no PII in URL).

### Notes
- Zapier flow remains unchanged.
- All changes are additive/surgical; iframe remains intact.

### Understanding Meta Ads reporting (for stakeholders)
- Two event paths are used for accuracy:
  - Browser (Pixel) events: fired in the page. These are what the Meta Pixel Helper shows.
  - Server (Conversions API, “CAPI”) events: sent from our server to Meta.
- We intentionally send both paths for a Lead. We attach the same identifier to both:
  - Browser event uses `eventID`
  - Server event uses `event_id`
  - Meta pairs these and counts one conversion (deduplication).
- What you’ll see during tests:
  - Pixel Helper: PageView + one Lead (browser only).
  - Events Manager → Test events: two rows for a submission (Browser Lead + Server Lead) with the same ID. This is expected and deduped to one conversion.
- Multiple PageViews can appear across pages (form and final page). That’s normal. We only expect one Lead per submission.
- Benefits of CAPI (server events): higher reliability (not blocked by browsers), better match quality, and more stable reporting.

Glossary
- Pixel: Meta’s browser-side tracking script.
- CAPI: Conversions API, server-to-server event delivery.
- Deduplication: Meta’s process to merge a Browser + Server event that share the same `event_id` into one conversion.


