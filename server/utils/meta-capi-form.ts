/**
 * Meta CAPI Service for Form App
 * 
 * This service handles Meta CAPI events specifically for the Form App.
 * It retrieves attribution data from the CRM and sends properly formatted
 * events to Meta with complete attribution information.
 */

import fetch from 'node-fetch';

interface FormMetaCapiEventData {
  eventName: string;
  userData: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    clientIpAddress?: string;
    clientUserAgent?: string;
  };
  customData?: Record<string, any>;
  eventSourceUrl?: string;
  sessionId?: string;
  eventId?: string; // For Pixel+CAPI deduplication
}

interface AttributionData {
  fbclid?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  ipAddress?: string;
  userAgent?: string;
  fbp?: string; // Facebook browser ID
  fbc?: string; // Facebook click ID
}

/**
 * Retrieve attribution data for a session from the CRM API
 */
async function getSessionAttribution(sessionId: string): Promise<AttributionData | null> {
  if (!sessionId) {
    console.warn('⚠️ Meta CAPI Form: No session ID provided for attribution lookup');
    return null;
  }

  try {
    const crmApiUrl = `https://${process.env.CRM_DOMAIN || 'amerigoautotransport.replit.app'}/api/v1/tracking/session`;

    console.log(`📊 Meta CAPI Form: Retrieving attribution for session: ${sessionId}`);

    const response = await fetch(`${crmApiUrl}/${sessionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Form-App-Meta-CAPI/1.0'
      },
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(5000)
    });

    if (response.ok) {
      const result = await response.json();

      if ((result as any).success && (result as any).attribution) {
        console.log('✅ Meta CAPI Form: Attribution data retrieved successfully');
        return (result as any).attribution;
      } else {
        console.warn('⚠️ Meta CAPI Form: No attribution data found for session');
        return null;
      }
    } else {
      console.error(`❌ Meta CAPI Form: Failed to retrieve attribution data: ${response.status}`);
      return null;
    }

  } catch (error) {
    console.error('❌ Meta CAPI Form: Error retrieving attribution data:', error);
    return null;
  }
}

/**
 * Send GetQuote event to CRM Meta CAPI service
 */
export async function sendGetQuoteEvent(eventData: FormMetaCapiEventData): Promise<void> {
  console.log('📊 Meta CAPI Form: Sending GetQuote event...');

  try {
    // Get attribution data if session ID is provided
    let attributionData: AttributionData | null = null;
    if (eventData.sessionId) {
      attributionData = await getSessionAttribution(eventData.sessionId);
    }

    // Prepare the payload for the CRM Meta CAPI service
    const metaCapiPayload = {
      eventName: 'Lead', // GetQuote maps to Lead event
      eventData: {
        event_source_url: eventData.eventSourceUrl || '',
        event_id: eventData.eventId, // For deduplication with Pixel
        custom_data: {
          content_name: 'Auto Transport Quote',
          content_category: 'Auto Transport',
          ...eventData.customData
        },
        action_source: 'website'
      },
      userData: {
        email: eventData.userData.email,
        phone: eventData.userData.phone,
        first_name: eventData.userData.firstName,
        last_name: eventData.userData.lastName,
        client_ip_address: eventData.userData.clientIpAddress,
        client_user_agent: eventData.userData.clientUserAgent,
        // Add Facebook attribution data if available
        ...(attributionData?.fbc && { fbc: attributionData.fbc }),
        ...(attributionData?.fbp && { fbp: attributionData.fbp })
      }
    };

    // Send to CRM Meta CAPI service
    const crmApiUrl = `https://${process.env.CRM_DOMAIN || 'amerigoautotransport.replit.app'}/api/v1/meta-capi/event`;

    console.log('📊 Meta CAPI Form: Sending to CRM Meta CAPI service...');

    const response = await fetch(crmApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Form-App-Meta-CAPI/1.0'
      },
      body: JSON.stringify(metaCapiPayload),
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Meta CAPI Form: GetQuote event sent successfully:', result);
    } else {
      const errorText = await response.text();
      console.error(`❌ Meta CAPI Form: Failed to send GetQuote event: ${response.status}`, errorText);
    }

  } catch (error) {
    console.error('❌ Meta CAPI Form: Error sending GetQuote event:', error);
  }
}

/**
 * Send PageView event to CRM Meta CAPI service
 */
export async function sendPageViewEvent(
  sessionId: string,
  userData: { clientIpAddress?: string; clientUserAgent?: string },
  eventSourceUrl?: string
): Promise<void> {
  console.log('📊 Meta CAPI Form: Sending PageView event...');

  try {
    const eventData: FormMetaCapiEventData = {
      eventName: 'PageView',
      userData,
      eventSourceUrl,
      sessionId
    };

    // Get attribution data
    let attributionData: AttributionData | null = null;
    if (sessionId) {
      attributionData = await getSessionAttribution(sessionId);
    }

    // Prepare the payload
    const metaCapiPayload = {
      eventName: 'PageView',
      eventData: {
        event_source_url: eventSourceUrl || '',
        action_source: 'website'
      },
      userData: {
        client_ip_address: userData.clientIpAddress,
        client_user_agent: userData.clientUserAgent,
        ...(attributionData?.fbclid && { fbc: `fb.1.${Date.now()}.${attributionData.fbclid}` })
      }
    };

    // Send to CRM Meta CAPI service
    const crmApiUrl = `https://${process.env.CRM_DOMAIN || 'amerigoautotransport.replit.app'}/api/v1/meta-capi/event`;

    const response = await fetch(crmApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Form-App-Meta-CAPI/1.0'
      },
      body: JSON.stringify(metaCapiPayload),
      signal: AbortSignal.timeout(10000)
    });

    if (response.ok) {
      console.log('✅ Meta CAPI Form: PageView event sent successfully');
    } else {
      console.error(`❌ Meta CAPI Form: Failed to send PageView event: ${response.status}`);
    }

  } catch (error) {
    console.error('❌ Meta CAPI Form: Error sending PageView event:', error);
  }
}
