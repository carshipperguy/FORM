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

6) NEW: Parent site double Pixel activation (amerigoautotransport.net)
   - Pixel Helper reports: "The Facebook pixel activated 2 times on this web page, which can cause errors in your event tracking".
   - Likely causes: Pixel added twice (e.g., theme header + plugin, or GTM tag + hardcoded snippet), or a plugin that injects the Pixel alongside an existing snippet.

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

4) Resolve parent site double Pixel activation
   - Ensure there is only ONE Pixel initialization on `amerigoautotransport.net`.
   - If using GTM: keep a single Custom HTML tag with Pixel code; remove hardcoded theme/plugin copies.
   - If using a WordPress plugin: keep the plugin OR the hardcoded snippet—never both. Disable any second injector (optimization/caching plugins sometimes add a duplicate Pixel feature).
   - Search the parent site source for multiple `fbevents.js` inclusions. Only one should remain.

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

Parent site duplicate Pixel verification
- On `amerigoautotransport.net` with Pixel Helper open:
  - Expected: 1 PageView fired once from the parent domain.
  - If Pixel Helper still shows "activated 2 times": remove/disable the extra injector (GTM tag or plugin) and reload.
  - Re-test a lead submission from the embedded iframe; expect one Browser Lead and one Server Lead (same event_id).

Glossary
- Pixel: Meta’s browser-side tracking script.
- CAPI: Conversions API, server-to-server event delivery.
- Deduplication: Meta’s process to merge a Browser + Server event that share the same `event_id` into one conversion.

### Parent site action checklist (WordPress/Elementor)
- Remove duplicate Pixel injections on amerigoautotransport.net:
  - Keep ONE Pixel source only (GTM Custom HTML OR a single hardcoded/plugin snippet).
  - Remove perfmatters/openbridge delayed Pixel duplicates and any extra Pixel plugin copies.
  - Verify with Pixel Helper on the parent: no “Pixel activated 2 times”.
- Install one parent listener (via GTM Custom HTML – All Pages – or in theme header):
  - Responds to `AMERIGO_ATTR_REQUEST` with `AMERIGO_ATTR_RESPONSE` (fbclid/UTMs/fbp).
  - Handles `AMERIGO_PIXEL_EVENT` and calls `fbq('track', name, params, {eventID})`.
- Allowed origins should include the iframe host(s): `replit.app|repl.co|replit.dev`.

### Meta configuration checklist (no code)
- Events Manager → Settings: enable Automatic Advanced Matching.
- Events Manager → Aggregated Event Measurement: verify domain and prioritize `Lead`.
- Ads Manager (each ad set):
  - Optimization: Website → Pixel `953087976815191` → Event `Lead`.
  - Attribution: 7‑day click / 1‑day view (or business standard).
  - URL parameters template: `utm_source=facebook&utm_medium=cpc&utm_campaign={{campaign.name}}&utm_content={{ad.name}}&utm_term={{adset.name}}`.

### How to verify after cleanup
- Parent site Pixel Helper: one PageView, no duplicate warning.
- Embedded form console: attribution messages received from parent with non‑null UTMs when parent URL includes UTMs.
- Submit one quote with `?test_event_code=XYZ`:
  - Events Manager → Test Events: one Browser Lead + one Server Lead with the same `event_id` (dedup OK).


