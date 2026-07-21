import sgMail from "@sendgrid/mail";
import type { TransportLead } from "@shared/transport-leads-schema";

/**
 * Best-effort team notification for a new booking. Uses the SendGrid account
 * already configured for this app. Never throws into the request path — if it
 * fails or isn't configured, we log and move on.
 *
 * Env:
 *   SENDGRID_API_KEY   (already set for this app)
 *   LEADS_NOTIFY_TO    comma-separated recipients (default leads@amerigoautotransport.net)
 *   LEADS_NOTIFY_FROM  verified sender (default no-reply@amerigoautotransport.net)
 */

let initialized = false;
function ensureInit(): boolean {
  if (!process.env.SENDGRID_API_KEY) return false;
  if (!initialized) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    initialized = true;
  }
  return true;
}

function money(n?: number | null): string {
  return n == null ? "—" : "$" + n.toLocaleString("en-US");
}

function row(label: string, value: string): string {
  return `<tr><td style="padding:6px 14px;color:#5B6675;font:13px Arial">${label}</td>` +
    `<td style="padding:6px 14px;font:600 13px Arial;color:#0F1826">${value}</td></tr>`;
}

export async function sendLeadNotification(lead: TransportLead): Promise<{ sent: boolean; error?: string }> {
  if (!ensureInit()) {
    console.log("[lead-email] SENDGRID_API_KEY not set — skipping team notification");
    return { sent: false };
  }

  const to = (process.env.LEADS_NOTIFY_TO || "leads@amerigoautotransport.net")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const from = process.env.LEADS_NOTIFY_FROM || "no-reply@amerigoautotransport.net";

  const vehicle = [lead.year, lead.make, lead.model].filter(Boolean).join(" ") || lead.vehicleType;
  const chosen =
    lead.transportType === "enclosed"
      ? money(lead.enclosedPrice)
      : lead.transportType === "open"
        ? money(lead.openPrice)
        : "Custom quote";

  const html = `
    <div style="max-width:560px;margin:0 auto;font-family:Arial,sans-serif">
      <div style="background:#15304F;color:#fff;padding:16px 20px;border-radius:10px 10px 0 0">
        <div style="font:600 12px Arial;letter-spacing:.1em;color:#EE9A1E">NEW ${lead.status.toUpperCase()}</div>
        <div style="font:800 20px Arial;margin-top:4px">${vehicle} · ${lead.pickupLocation} → ${lead.dropoffLocation}</div>
      </div>
      <table style="width:100%;border-collapse:collapse;border:1px solid #E2E6EC;border-top:none">
        ${row("Reference", lead.ref)}
        ${row("Customer", `${lead.name || "—"} · ${lead.phone || "—"} · ${lead.email || "—"}`)}
        ${row("Vehicle", `${vehicle} (${lead.vehicleType})`)}
        ${row("Route", `${lead.pickupLocation} → ${lead.dropoffLocation}`)}
        ${row("Distance / transit", `${lead.distance ?? "—"} mi · ${lead.transitTime ?? "—"} days`)}
        ${row("Ship date", lead.shipDate || "Flexible")}
        ${row("Open / Enclosed", `${money(lead.openPrice)} / ${money(lead.enclosedPrice)}`)}
        ${row("Chosen", `${lead.transportType || "—"} · ${chosen}`)}
        ${row("Booking", `${lead.bookingMode || "—"}${lead.depositAmount ? " · deposit " + money(lead.depositAmount) : ""}`)}
        ${row("Source", `${lead.source || "website"}${lead.utmCampaign ? " · " + lead.utmCampaign : ""}`)}
      </table>
    </div>`;

  try {
    await sgMail.send({
      to,
      from,
      subject: `New ${lead.status}: ${vehicle} — ${lead.pickupLocation} → ${lead.dropoffLocation} (${lead.ref})`,
      html,
    });
    return { sent: true };
  } catch (err) {
    const error = err instanceof Error ? err.message : "Unknown SendGrid error";
    console.error("[lead-email] send failed:", error);
    return { sent: false, error };
  }
}
