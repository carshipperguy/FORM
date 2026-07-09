# Partial-lead grace window

## The bug this fixes

Every lead from the quote calculator was landing downstream **twice** — once as
a *complete* lead and once as a *partial* lead. The two database rows are fine
and expected (we keep the two-table design). The problem was that the **partial
lead was being delivered to Zapier immediately**, so any customer who went on to
finish the form produced two external leads.

## The rule

1. **Save partials instantly** to `partial_leads`, so a drop-off is never lost.
2. **Do not deliver the partial to Zapier instantly.** Hold it for a grace
   window (~2 minutes).
3. After the delay, **re-check** for a completed quote with the same
   `session_id`, `phone`, or `email`:
   - **Full quote exists** → mark the partial `converted`; **do not** send to
     Zapier.
   - **No full quote** → send the partial to Zapier as an abandoned lead.
4. **Delivery is idempotent** — an atomic claim + a `delivered` flag +
   a Zapier idempotency key (the `session_id`) mean retries and double
   blur/debounce events can never send the same partial twice.

## Flow

```
form (blur/debounce)
   │  POST /api/partial_lead  { sessionId, name, email, phone, data }
   ▼
capturePartialLead()  ── upsert partial_leads (status=pending, deliverAfter=now+2m)
                          NO external delivery here

form submit (full quote)
   │  POST /api/send_email  { sessionId, data }
   ▼
markQuoteCompleted()  ── record completion, flip matching pending partial -> converted

scheduler every ~30–60s
   │  POST /api/leads/sweep
   ▼
deliverDuePartials()  ── for each partial past its grace window:
                          completed quote?  yes → suppress (converted)
                                            no  → deliver to Zapier once
```

## Files

| File | Role |
| --- | --- |
| `src/app/lib/leadStore.ts` | The two-table storage contract + a reference in-memory store. |
| `src/app/lib/partialLeadService.ts` | The grace-window rules (capture, complete, sweep). |
| `src/app/lib/zapier.ts` | Idempotent partial-lead delivery to Zapier. |
| `src/app/lib/partialLeadClient.ts` | Session id + debounced capture on the client. |
| `src/app/api/partial_lead/route.ts` | Saves a partial (no delivery). |
| `src/app/api/leads/sweep/route.ts` | Runs the grace-window sweeper. |
| `src/app/api/send_email/route.ts` | On full submit, marks the quote completed. |

## What you must wire up in production

1. **Real database.** `leadStore.ts` ships with an in-memory store so the routes
   run locally. It is a module singleton — OK for one always-on server, **not**
   durable across serverless cold starts or multiple instances. Implement the
   `LeadStore` interface against the existing `partial_leads` / completed-quotes
   tables (method docs give the exact semantics) and export that instead.
2. **Env vars:**
   - `ZAPIER_PARTIAL_LEAD_WEBHOOK_URL` — the Zapier catch hook for abandoned
     partial leads. If unset, delivery is safely skipped and logged.
   - `LEADS_SWEEP_SECRET` — shared secret to protect `/api/leads/sweep`; pass it
     as `?secret=` or the `x-sweep-secret` header.
3. **A scheduler** hitting `POST /api/leads/sweep` every 30–60s (a cron Zap, or
   the existing scheduled job). Without it, partials are saved but never
   delivered.

## Tuning

The grace window is `GRACE_WINDOW_MS` in `leadStore.ts` (default ~2 minutes).
It is refreshed on every capture, so an actively-typing customer is never
treated as abandoned.
