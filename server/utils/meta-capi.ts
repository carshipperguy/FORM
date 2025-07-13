import fetch from "node-fetch";
import crypto from "crypto";

interface MetaCAPIUserData {
  em?: string | null; // hashed email
  ph?: string | null; // hashed phone
  client_ip_address?: string | null;
  client_user_agent?: string | null;
  fbc?: string | null; // Facebook click ID cookie
  fbp?: string | null; // Facebook browser ID
}

interface MetaCAPICustomData {
  content_name?: string;
  content_category?: string;
  value?: number;
  currency?: string;
  pickup_location?: string;
  dropoff_location?: string;
  vehicle_type?: string;
  vehicle_year?: string;
  vehicle_make?: string;
  vehicle_model?: string;
}

interface MetaCAPIEventData {
  event_name: string;
  event_time: number;
  user_data: MetaCAPIUserData;
  custom_data?: MetaCAPICustomData;
  event_source_url?: string;
  action_source?: string;
}

interface MetaCAPIPayload {
  data: MetaCAPIEventData[];
  test_event_code?: string;
}

/**
 * Hash a parameter using SHA256
 */
function hashParam(param: string): string {
  return crypto
    .createHash("sha256")
    .update(param.toLowerCase().trim())
    .digest("hex");
}

/**
 * Send event to Meta Conversion API
 * @param eventData - The event data to send
 * @param clientIP - Client IP address for attribution
 * @param testEventCode - Optional test event code for testing
 */
export async function sendMetaCAPIEvent(
  eventData: any,
  clientIP: string,
  testEventCode?: string,
): Promise<void> {
  try {
    console.log("📊 META CAPI: Processing event data");

    // Get Meta CAPI credentials from environment
    const pixelId = process.env.META_PIXEL_ID;
    const accessToken = process.env.META_CAPI_ACCESS_TOKEN;

    if (!pixelId || !accessToken) {
      console.warn("❌ META CAPI: Missing pixel ID or access token - skipping");
      return;
    }

    const userData = eventData.user_data || {};

    // Hash email and phone if they exist
    const hashedUserData = { ...eventData.user_data };
    if (hashedUserData.em) {
      hashedUserData.em = hashParam(hashedUserData.em);
    }
    if (hashedUserData.ph) {
      hashedUserData.ph = hashParam(hashedUserData.ph);
    }

    // Prepare the event payload
    const metaEvent: MetaCAPIEventData = {
      event_name: eventData.event_name,
      event_time: eventData.event_time,
      user_data: {
        ...hashedUserData,
        client_ip_address: clientIP,
      },
      custom_data: eventData.custom_data,
      event_source_url: eventData.event_source_url || "",
      action_source: "website",
    };

    const payload: MetaCAPIPayload = {
      data: [metaEvent],
    };

    // Add test event code if provided
    if (testEventCode) {
      payload.test_event_code = testEventCode;
    }

    const url = `https://graph.facebook.com/v22.0/${pixelId}/events?access_token=${accessToken}`;

    console.log("🪖: Meta API Checkpoint", {
      url,
      userData,
      payload: JSON.stringify(payload),
    });

    if (metaEvent.custom_data) {
      console.log("🏷️ CUSTOM DATA:");
      Object.entries(metaEvent.custom_data).forEach(([key, value]) => {
        console.log(`  ${key}:`, value || "NOT PROVIDED");
      });
    } else {
      console.log("🏷️ CUSTOM DATA: None provided");
    }

    if (testEventCode) {
      console.log("🧪 TEST EVENT CODE:", testEventCode);
    }

    console.log("📊 META CAPI: Sending event to Facebook", {
      event_name: metaEvent.event_name,
      has_email: !!metaEvent.user_data.em,
      has_phone: !!metaEvent.user_data.ph,
      test_mode: !!testEventCode,
    });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.text();

    if (response.ok) {
      console.log("✅ META CAPI: Event sent successfully", result);
    } else {
      console.error("❌ META CAPI: Failed to send event", {
        status: response.status,
        statusText: response.statusText,
        response: result,
      });
    }
  } catch (error) {
    console.error("❌ META CAPI: Error sending event", error);
  }
}
