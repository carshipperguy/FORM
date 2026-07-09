import { NextResponse } from "next/server";
import { capturePartialLead } from "../../lib/partialLeadService";

/**
 * POST /api/partial_lead
 *
 * The quote form calls this as soon as it has a usable partial (contact fields
 * filled), typically on blur/debounce. It saves the partial IMMEDIATELY but does
 * not deliver anything to Zapier — delivery is deferred to the grace-window
 * sweeper (see /api/leads/sweep and lib/partialLeadService.ts).
 *
 * Idempotent per session: repeated calls for the same sessionId update one row.
 *
 * Body: { sessionId: string, name?, email?, phone?, data?: <form payload> }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, name, email, phone, data } = body ?? {};

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json(
        { ok: false, message: "sessionId is required" },
        { status: 400 }
      );
    }

    await capturePartialLead({
      sessionId,
      name,
      email,
      phone,
      payload: data ?? body,
    });

    return NextResponse.json({ ok: true, message: "Partial lead saved" });
  } catch (err) {
    console.error("[partial_lead] error", err);
    return NextResponse.json(
      { ok: false, message: "Failed to save partial lead" },
      { status: 500 }
    );
  }
}
