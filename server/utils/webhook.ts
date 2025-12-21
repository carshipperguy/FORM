import fetch from "node-fetch";

const extractCity = (location?: string): string => {
  if (!location) return "Not provided";
  const match = location.match(/^([^,]+)/);
  return match ? match[1].trim() : "Not provided";
};

const extractState = (location?: string): string => {
  if (!location) return "Not provided";
  const match = location.match(/,\s*([A-Z]{2})/);
  return match ? match[1].trim() : "Not provided";
};

const extractZip = (location?: string): string => {
  if (!location) return "Not provided";
  const match = location.match(/(\d{5})(?:\s*$|-\d{4}\s*$)/);
  return match ? match[1].trim() : "Not provided";
};

/**
 * Send data directly to CRM database (crmtestenvironment2-zach)
 * @param data The quote/lead data to send to the CRM
 * @returns A promise that resolves when the data has been sent
 */
export async function sendToWebhook(
  data: any,
  headers: any = {},
): Promise<{ success: boolean; message: string; diagnostics?: any }> {
  try {
    const crmDomain = process.env.CRM_DOMAIN;

    if (!crmDomain) {
      console.error("❌ CRM_DOMAIN environment variable is not set!");
      return {
        success: false,
        message: "CRM_DOMAIN environment variable is not configured",
        diagnostics: { error: "Missing CRM_DOMAIN" },
      };
    }

    const crmApiUrl = `https://${crmDomain}/api/quotes`;
    console.log("📤 Sending quote to CRM:", crmApiUrl);

    const submissionId = data.submissionId || `AUTO-${Date.now()}`;
    const submissionDate = data.submissionDate || new Date().toISOString();
    const eventType = data.eventType || "form_submission";

    let formattedShipmentDate = "Not provided";
    if (data.shipmentDate) {
      try {
        const date = new Date(data.shipmentDate);
        if (!isNaN(date.getTime())) {
          const month = (date.getMonth() + 1).toString().padStart(2, "0");
          const day = date.getDate().toString().padStart(2, "0");
          const year = date.getFullYear();
          formattedShipmentDate = `${month}/${day}/${year}`;
        }
      } catch (e) {
        formattedShipmentDate = data.shipmentDate;
      }
    }

    const quotePayload = {
      name: data.name || "Not provided",
      email: data.email || "Not provided",
      phone: data.phone || "Not provided",
      pickupLocation: data.pickupLocation || "Not provided",
      dropoffLocation: data.dropoffLocation || "Not provided",
      pickupCity: extractCity(data.pickupLocation),
      pickupState: extractState(data.pickupLocation),
      pickupZip:
        data.pickupZip || extractZip(data.pickupLocation) || "Not provided",
      dropoffCity: extractCity(data.dropoffLocation),
      dropoffState: extractState(data.dropoffLocation),
      dropoffZip:
        data.dropoffZip || extractZip(data.dropoffLocation) || "Not provided",
      distance: data.distance || 0,
      transitTime: data.transitTime || 0,
      openTransportPrice: data.openTransportPrice || null,
      enclosedTransportPrice: data.enclosedTransportPrice || null,
      vehicleYear: data.year || "Not provided",
      vehicleMake: data.make || "Not provided",
      vehicleModel: data.model || "Not provided",
      vehicleType: data.vehicleType || "Not provided",
      shipmentDate: formattedShipmentDate,
      submissionId: submissionId,
      submissionDate: submissionDate,
      eventType: eventType,
      fbclid: data.fbclid || null,
      utmSource: data.utm_source || null,
      utmMedium: data.utm_medium || null,
      utmCampaign: data.utm_campaign || null,
      utmTerm: data.utm_term || null,
      utmContent: data.utm_content || null,
      referrer: data.referrer || "",
      source: "form-app",
    };

    console.log("📋 Quote payload:", JSON.stringify(quotePayload, null, 2));

    const requestStartTime = Date.now();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

    const response = await fetch(crmApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "Form-App/1.0",
        "X-Request-ID": requestId,
      },
      body: JSON.stringify(quotePayload),
    });

    const requestDuration = Date.now() - requestStartTime;
    const responseText = await response.text();

    console.log(`📊 CRM Response: ${response.status} in ${requestDuration}ms`);

    if (response.ok) {
      console.log("✅ Quote saved to CRM successfully");
      console.log(
        "📊 Lead event will be fired by CRM (crmtestenvironment2-zach) after saving quote",
      );

      return {
        success: true,
        message: "Quote saved to CRM database",
        diagnostics: {
          requestId,
          responseTime: requestDuration,
          status: response.status,
        },
      };
    } else {
      console.error(`❌ CRM Error: ${response.status} - ${responseText}`);
      return {
        success: false,
        message: `CRM error (${response.status}): ${responseText}`,
        diagnostics: {
          requestId,
          responseTime: requestDuration,
          status: response.status,
          error: responseText,
        },
      };
    }
  } catch (error) {
    console.error("❌ CRM CONNECTION ERROR:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      success: false,
      message: `CRM connection error: ${errorMessage}`,
      diagnostics: {
        error: errorMessage,
        timestamp: Date.now(),
      },
    };
  }
}
