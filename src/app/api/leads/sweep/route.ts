import { NextResponse } from "next/server";
import { deliverDuePartials } from "../../../lib/partialLeadService";

/**
 * Grace-window sweeper.
 *
 * Delivers partial leads whose ~2 minute grace window has elapsed WITHOUT a
 * completed quote, and suppresses those that converted. Run it on a short
 * interval (every 30–60s). Two ways to drive it:
 *
 *   • A scheduler / cron Zap that calls this endpoint, or
 *   • Your existing "Scheduled sms and email" job hitting it.
 *
 * Protect it with a shared secret: set LEADS_SWEEP_SECRET and pass it as
 * `?secret=...` or an `x-sweep-secret` header. If the env var is unset the
 * endpoint is open (fine for local dev).
 */
async function runSweep(request: Request) {
  const secret = process.env.LEADS_SWEEP_SECRET;
  if (secret) {
    const url = new URL(request.url);
    const provided =
      url.searchParams.get("secret") ?? request.headers.get("x-sweep-secret");
    if (provided !== secret) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }
  }

  const result = await deliverDuePartials();
  return NextResponse.json({ ok: true, ...result });
}

export async function POST(request: Request) {
  return runSweep(request);
}

// GET is allowed too so a simple uptime-style scheduler can trigger it.
export async function GET(request: Request) {
  return runSweep(request);
}
