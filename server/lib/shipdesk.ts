import type { TransportLead } from "@shared/transport-leads-schema";

/**
 * Shipdesk hook — the ONE place the new flow talks to your CRM.
 *
 * Today it's a no-op unless SHIPDESK_API_URL is set, so nothing breaks while
 * Shipdesk isn't wired. When you're ready, set:
 *   SHIPDESK_API_URL   e.g. https://shipdesk.<you>.replit.app/api/leads
 *   SHIPDESK_API_KEY   (optional) sent as Authorization: Bearer <key>
 * ...and every booked lead posts here. Extend the payload mapping to match
 * whatever Shipdesk expects — this is the only function you touch.
 */

export interface ShipdeskResult {
  ok: boolean;
  skipped?: boolean;
  id?: string;
  error?: string;
}

export async function pushLeadToShipdesk(lead: TransportLead): Promise<ShipdeskResult> {
  const url = process.env.SHIPDESK_API_URL;
  if (!url) return { ok: false, skipped: true };

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (process.env.SHIPDESK_API_KEY) {
      headers["Authorization"] = `Bearer ${process.env.SHIPDESK_API_KEY}`;
    }

    // Map our lead to Shipdesk's expected shape here.
    const payload = {
      externalRef: lead.ref,
      status: lead.status,
      customer: { name: lead.name, phone: lead.phone, email: lead.email },
      vehicle: {
        type: lead.vehicleType,
        year: lead.year,
        make: lead.make,
        model: lead.model,
      },
      route: {
        pickup: lead.pickupLocation,
        dropoff: lead.dropoffLocation,
        distance: lead.distance,
        shipDate: lead.shipDate,
      },
      pricing: {
        open: lead.openPrice,
        enclosed: lead.enclosedPrice,
        chosen: lead.transportType,
        quotedPrice: lead.quotedPrice,
      },
      attribution: {
        source: lead.source,
        utmSource: lead.utmSource,
        utmMedium: lead.utmMedium,
        utmCampaign: lead.utmCampaign,
        fbclid: lead.fbclid,
        referrer: lead.referrer,
      },
    };

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { ok: false, error: `Shipdesk ${res.status}: ${body.slice(0, 200)}` };
    }

    const json: any = await res.json().catch(() => ({}));
    return { ok: true, id: json?.id ? String(json.id) : undefined };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown Shipdesk error" };
  }
}
