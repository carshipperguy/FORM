import fetch from "node-fetch";

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

    // Prepare the event payload
    const metaEvent: MetaCAPIEventData = {
      event_name: eventData.event_name,
      event_time: eventData.event_time,
      user_data: {
        ...eventData.user_data,
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

    // Detailed logging of all data being sent to Meta CAPI
    console.log("📊 META CAPI: COMPLETE PAYLOAD BEING SENT:");
    console.log("🔗 URL:", url.replace(accessToken, '[ACCESS_TOKEN_HIDDEN]'));
    console.log("📦 Full Payload:", JSON.stringify(payload, null, 2));
    
    console.log("📋 EVENT DETAILS:");
    console.log("  Event Name:", metaEvent.event_name);
    console.log("  Event Time:", metaEvent.event_time, `(${new Date(metaEvent.event_time * 1000).toISOString()})`);
    console.log("  Event Source URL:", metaEvent.event_source_url);
    console.log("  Action Source:", metaEvent.action_source);
    
    console.log("👤 USER DATA:");
    console.log("  Email Hash:", metaEvent.user_data.em || 'NOT PROVIDED');
    console.log("  Phone Hash:", metaEvent.user_data.ph || 'NOT PROVIDED');
    console.log("  Client IP:", metaEvent.user_data.client_ip_address || 'NOT PROVIDED');
    console.log("  User Agent:", metaEvent.user_data.client_user_agent || 'NOT PROVIDED');
    console.log("  Facebook Click ID (fbc):", metaEvent.user_data.fbc || 'NOT PROVIDED');
    console.log("  Facebook Browser ID (fbp):", metaEvent.user_data.fbp || 'NOT PROVIDED');
    
    if (metaEvent.custom_data) {
      console.log("🏷️ CUSTOM DATA:");
      Object.entries(metaEvent.custom_data).forEach(([key, value]) => {
        console.log(`  ${key}:`, value || 'NOT PROVIDED');
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
