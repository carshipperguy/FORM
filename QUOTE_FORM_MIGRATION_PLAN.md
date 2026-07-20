# Quote Form Dependency Map & Native Migration Plan

> **Goal:** Move the quote form off the iframe embed and run it natively on
> `amerigoautotransport.net` (same origin as the parent page).

---

## ⚠️ Repository Reconciliation — Read First

This document maps and plans a migration for the **live deployed version** of the
quote form (the Replit deployment). That live version has evolved **ahead of the
code committed to this git branch** (`claude/quote-form-migration-plan-hegpg1`).

The plan below is accurate to the deployed app. It is **not** a 1:1 description of
the source currently in this repo. The table below records exactly where the two
diverge, verified by searching this branch on 2026-07-20:

| Referenced in this plan | Status on this git branch | Actual state here |
| --- | --- | --- |
| `POST /api/submit-lead` | ❌ Absent | Submission flows through `/api/distance`, `/api/quotes`, `/api/final-submission`, `/api/webhook` |
| `POST /api/partial-lead` (+ 5-min grace window, `converted` flag) | ❌ Absent | No partial-lead pipeline exists |
| `GET /api/places/autocomplete` | ❌ Absent | Location lookups use `/api/location-search` and `/api/location-search/popular` |
| postMessage protocol (`AMERIGO_ATTR_REQUEST`, `AMERIGO_ATTR_RESPONSE`, `AMERIGO_PIXEL_EVENT`) | ❌ Absent | No inter-frame messaging in the code at all |
| `client/src/lib/attribution-tracker.ts` | ❌ Absent | File does not exist |
| `client/src/lib/track-event.ts` | ❌ Absent | File does not exist |
| `server/utils/meta-capi-form.ts` / `sendGetQuoteEvent()` | ❌ Absent | No Meta CAPI code |
| `server/utils/pricing-server.ts` / `calculatePriceServer()` | ❌ Absent | Pricing lives in `client/src/lib/pricing.ts` |
| `CalendarPicker.jsx` | ❌ Absent | Only `client/src/components/ui/calendar.tsx` |
| Client-side `window.fbq`, `_fbp`, `_fbc`, Meta Pixel plumbing | ❌ Absent | No client pixel/CAPI code |
| `SimpleQuoteForm.jsx` = 1,318 lines | ⚠️ Differs | Actually **880 lines** on this branch |
| Zapier hook `20zu8bj` | ✅ Present | `server/utils/webhook.ts`, `server/utils/webhook-api.ts` |
| `GTM-TTTS3RSZ` in `index.html` | ✅ Present | GTM + `connect.facebook.net` dns-prefetch, **no Pixel** |
| Hardcoded `308px` width | ✅ Present | `SimpleQuoteForm.jsx`, `QuoteOptions.jsx`, `MobileContainer.tsx`, `index.css` |
| Direct-URL UTM reading | ✅ Already native | `SimpleQuoteForm.jsx:281–294` reads `fbclid` + `utm_*` from `window.location.search` today |

**Implication for the migration steps:** On this branch the form **already reads
UTMs directly from the URL** and has **no iframe postMessage system**, so Step 1
below is effectively already done and Steps 2–3 have nothing to act on. Those
steps apply only to the newer deployed version. To produce a plan verified against
the current live source, sync the deployed code into git first.

---

## Part 1 — Complete Dependency Map (live deployed version)

### Files

| File | Role |
| --- | --- |
| `client/src/components/SimpleQuoteForm.jsx` | The entire form — 1,318 lines |
| `client/src/components/LocationMenuSelector.jsx` | Location autocomplete input, calls `/api/places/autocomplete` |
| `client/src/components/CalendarPicker.jsx` | Shipment date picker, self-contained |
| `client/src/lib/vehicle-data.ts` | Static lists — vehicle types, years, makes, models by make |
| `client/src/lib/attribution-tracker.ts` | Session ID generation, `AMERIGO_ATTR_REQUEST` postMessage, `AMERIGO_PIXEL_EVENT` postMessage |
| `client/src/lib/track-event.ts` | Passive CRM event logging (fire-and-forget) |
| `client/index.html` | Entry point — GTM script, dns-prefetch hints, no Pixel |
| `server/routes.ts` | All API endpoints |
| `server/utils/webhook.ts` | `sendToWebhook()` — fires Zapier |
| `server/utils/attribution-webhook.ts` | `sendAttributionToCRM()` — fires session data to CRM |
| `server/utils/meta-capi-form.ts` | Meta CAPI server-side event helper |
| `server/utils/pricing-server.ts` | `calculatePriceServer()` — pricing engine |
| `attached_assets/meta-attribution-script.js` | Parent-page script (lives on `amerigoautotransport.net`, not in this repo) |

### API Endpoints Called by the Form

| Endpoint | When | What It Does |
| --- | --- | --- |
| `GET /api/places/autocomplete` | Every keystroke in location fields (200ms debounce) | Proxies Google Places Autocomplete, returns city/ZIP suggestions |
| `POST /api/partial-lead` | 2s after user pauses typing phone, or on phone field blur | Saves to `partial_leads` DB; after 5-min grace window, fires Zapier if no full quote arrived |
| `POST /api/submit-lead` | "Get Quote" button | Distance (Google), pricing, DB save, Zapier, attribution CRM — the main pipeline |

### `/api/submit-lead` Internal Pipeline (Step by Step)

1. Google Distance Matrix API (8s timeout)
2. `calculatePriceServer()` — open + enclosed prices, transit time
3. INSERT into `fallback_leads` (fire-and-forget)
4. Mark matching `partial_leads` as `converted = true`
5. `sendAttributionToCRM()` — async, best-effort
6. Respond to browser with prices
7. `sendToWebhook()` — fires Zapier `20zu8bj` (after response, non-blocking)

### Third-Party Services

| Service | Where Used | Fails Gracefully? |
| --- | --- | --- |
| Google Distance Matrix API | Server — `/api/submit-lead` | Yes — lead still saved + sent to Zapier; UI shows "we'll call you" |
| Google Places Autocomplete | Server — `/api/places/autocomplete`, proxied from `LocationMenuSelector` | Yes — user can type manually |
| Zapier webhook `20zu8bj` | Server — after `/api/submit-lead` responds | Yes — lead is already saved to DB first |
| Meta CAPI (`form-carshipperguy.replit.app/api/v1/meta-capi/event`) | Client — after successful quote, calls external CRM app | Yes — wrapped in try/catch, not awaited on critical path |
| Google Tag Manager `GTM-TTTS3RSZ` | `client/index.html` | Yes — async, non-blocking |
| Meta Pixel | Parent page only (`amerigoautotransport.net`) — not in this app | N/A |
| CRM event logger (`amerigoautotransport.replit.app/api/events`) | `track-event.ts` — passive, fire-and-forget | Yes — 3s timeout, errors swallowed |
| CRM session tracker (`amerigoautotransport.replit.app/api/v1/tracking/session`) | `attribution-tracker.ts` | Yes — errors swallowed |

### Analytics & Tracking Events

| Event Name | Fired When | Fired Via |
| --- | --- | --- |
| `form_loaded` | On mount | `track-event.ts` → CRM |
| `contact_fields_shown` | Shipment date selected (once per session) | `track-event.ts` → CRM |
| `submit_clicked` | "Get Quote" pressed, before API call | `track-event.ts` → CRM |
| `submit_success` | After successful quote response | `track-event.ts` → CRM |
| `mapquest_failed` | Distance API failed | `track-event.ts` → CRM |
| `client_timeout_triggered` | 45s fetch timeout or network error | `track-event.ts` → CRM |
| `Lead` (or `DealerQuote`) — browser | After successful quote | `attribution-tracker.ts` → `AMERIGO_PIXEL_EVENT` postMessage → parent Pixel |
| `Lead` (or `DealerQuote`) — server | After successful quote | `sendGetQuoteEvent()` → Meta CAPI app |

### Storage

| Key | Type | Value | Survives Page Close? |
| --- | --- | --- | --- |
| `selectedVehicleType` | localStorage | Last vehicle type selected | Yes |
| `amerigo_session_id` | sessionStorage | `timestamp_random` session ID | No |
| `parent_attribution_data` | sessionStorage | UTMs + fbclid from parent postMessage | No |
| `quote_data` | sessionStorage | Full quote result (prices, distance, locations) | No |
| `_fbp` | Cookie (read-only) | Facebook Browser ID, set by Meta Pixel on parent page | Yes (90 days) |
| `_fbc` | Derived (not stored) | Built from `fbclid` + timestamp at submission time | — |

### URL Parameters

| Parameter | Purpose | Who Sets It |
| --- | --- | --- |
| `fbclid` | Facebook click ID for attribution | Meta Ads (auto-appended to landing page URL) |
| `utm_source` | Campaign source | Marketing URLs |
| `utm_medium` | Campaign medium | Marketing URLs |
| `utm_campaign` | Campaign name | Marketing URLs |
| `utm_term` | Campaign keyword | Marketing URLs |
| `utm_content` | Ad variant | Marketing URLs |
| `leadType` | `dealer` → fires `DealerQuote` Pixel event instead of `Lead` | Parent page or iframe embed URL |
| `test_event_code` | Meta CAPI test mode | Manual testing only |

### postMessage Protocol (Iframe ↔ Parent)

| Direction | Message Type | Payload | Purpose |
| --- | --- | --- | --- |
| Form → Parent | `AMERIGO_ATTR_REQUEST` | none | Asks parent for attribution data on mount |
| Parent → Form | `AMERIGO_ATTR_RESPONSE` or `ATTRIBUTION_DATA` | `{ fbclid, utm_*, referrer, leadType, _fbp }` | Parent sends attribution back |
| Form → Parent | `AMERIGO_PIXEL_EVENT` | `{ eventName, eventId, eventData }` | Tells parent Pixel to fire a client-side event (for browser + CAPI deduplication) |

**Security filter:** Form rejects any postMessage not originating from `amerigoautotransport.net`.

### Zapier Webhooks

| Hook ID | Triggered By | Data Sent |
| --- | --- | --- |
| `20zu8bj` | Full lead — `/api/submit-lead` (post-response) | Complete quote payload including all UTMs, distance, prices, vehicle, contact |
| `20zu8bj` | Partial lead — `/api/partial-lead` (after 5-min grace window) | Partial contact info (phone, name, email, vehicle) |

### Iframe-Specific Behaviours

- Width hardcoded to `308px` in `.simple-form-container` CSS — sized for the sidebar on the parent site
- Meta Pixel excluded from `index.html` by design — parent page owns it to avoid double-counting PageViews
- GTM loaded inside the iframe — operates independently of the parent's GTM
- Cross-origin attribution — UTMs live in the parent page URL, not the iframe URL; the postMessage protocol is the only way to get them
- Cross-origin `_fbp` cookie — the cookie is set by the parent domain's Pixel; the iframe reads it via `document.cookie` only if the browser allows cross-site cookies (blocked in Safari ITP and Firefox strict mode)
- `window.location.origin` for API calls — the form uses its own origin for all fetches, which works correctly both standalone and embedded

---

## Part 2 — What Would Be Lost If the Iframe Were Simply Removed

| Loss | Severity | Why |
| --- | --- | --- |
| UTM attribution from the parent page URL | Critical | Without the iframe's origin boundary, the form would now live on the same domain — the postMessage protocol is no longer needed, but the code still reads only from `window.location.search`. If the parent page doesn't pass UTMs through to the form's URL, attribution goes dark. |
| `_fbp` cookie availability | Medium | In Safari/Firefox strict mode, the cross-origin cookie is already blocked. On the same domain, this problem goes away entirely — the cookie is fully accessible. |
| GTM container isolation | Low | The iframe currently has its own GTM instance separate from the parent. Going native merges them unless you deliberately keep them separate. |
| `AMERIGO_PIXEL_EVENT` pathway | Critical | The parent Pixel fires client-side `Lead` events only because the form sends a postMessage. Without the iframe boundary, this must be replaced with a direct `window.fbq()` call in the form. |
| The `308px` width constraint | None | This becomes irrelevant — native layout uses the parent page's grid. |

---

## Part 3 — Native Migration Plan

### What "Native" Means Here

The form runs directly on `amerigoautotransport.net` as a React component or
embedded script tag — no iframe boundary, same origin as the parent page.

### Step 1 — Remove the postMessage Attribution System

**What to do:** The form currently asks the parent for UTMs via `AMERIGO_ATTR_REQUEST`.
On the same domain, `window.location.search` and `document.referrer` are directly
accessible without any inter-frame communication.

Replace the entire `handleParentMessage` + `window.addEventListener('message', ...)`
block with a single direct read:

```js
// Instead of waiting for postMessage, read directly
const urlParams = new URLSearchParams(window.location.search);
setAttributionData({
  fbclid: urlParams.get("fbclid"),
  utm_source: urlParams.get("utm_source"),
  // ...
  referrer: document.referrer,
  leadType: urlParams.get("leadType"),
});
```

Nothing else in the submission pipeline changes. UTMs still go into the lead payload
exactly as today.

> **Note (this repo):** already implemented on this branch — see
> `SimpleQuoteForm.jsx:281–294`. No postMessage system is present to remove.

### Step 2 — Replace the `AMERIGO_PIXEL_EVENT` postMessage with a Direct `fbq()` Call

**What to do:** In `attribution-tracker.ts`, the `trackEvent()` function fires
`AMERIGO_PIXEL_EVENT` to the parent. On the same domain, the Pixel is already
loaded — call it directly.

```js
// Replace postMessage with direct call
if (typeof window !== 'undefined' && window.fbq) {
  window.fbq('track', eventName, eventData);
}
```

Keep the CAPI call (`sendGetQuoteEvent`) unchanged — it still runs alongside the
browser event.

### Step 3 — Fix the `_fbp` Cookie Reliability

**Current behaviour:** Blocked by Safari ITP when the form is in an iframe. On the
same domain, the cookie is fully readable.

No code change needed — `getCookie("_fbp")` already works correctly on the same domain.

### Step 4 — Remove Iframe-Specific CSS Constraints

`SimpleQuoteForm.jsx` has `.simple-form-container` with a hardcoded `308px` width.
Replace with responsive layout that fits the parent page's grid.

### Step 5 — Merge or Deduplicate GTM

The form currently runs `GTM-TTTS3RSZ` inside the iframe. The parent page likely has
its own GTM. Decide:

- **Same container:** Remove GTM from the form — the parent's container covers it
- **Separate container:** Keep the form's GTM, audit for duplicate triggers

### Step 6 — Verify API Endpoint URLs

The form uses `window.location.origin` for all fetch calls — this is already correct
for a native implementation. No changes needed.

### Improvements a Native Implementation Provides

| Improvement | Impact |
| --- | --- |
| UTM attribution always works — no postMessage race condition, no timing dependency on parent script load | Attribution data is more reliable on every lead |
| `_fbp` cookie fully accessible — Safari and Firefox no longer block it | Better Meta CAPI match quality |
| No `308px` width prison — form can use responsive layout naturally | Better mobile UX |
| Pixel events fired directly — no postMessage round-trip, no risk of the parent script not being loaded when the event fires | Fewer missed conversion events |
| Removes dependency on parent-page scripts (`meta-attribution-script.js`) — those scripts are outside this repo and can silently break | One fewer failure point |
| Simpler code — the entire postMessage listener system (currently ~50 lines) plus the parent-side script can be deleted | Less maintenance surface |
| CSP headers — the parent site can use stricter Content-Security-Policy without needing `frame-src` exceptions | Better security posture |

### What Is 100% Preserved (No Changes Required)

- `/api/submit-lead` pipeline — unchanged
- `/api/partial-lead` pipeline — unchanged
- Zapier webhook `20zu8bj` — unchanged
- Google Distance Matrix — unchanged
- Google Places Autocomplete — unchanged
- All form fields and validation — unchanged
- localStorage vehicle type persistence — unchanged
- sessionStorage `quote_data` handoff to the quote results page — unchanged
- Meta CAPI server-side events — unchanged
- CRM passive event tracking — unchanged
- Database saves to `fallback_leads` and `partial_leads` — unchanged
