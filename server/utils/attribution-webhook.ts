/**
 * Attribution Webhook Module
 * 
 * Handles sending attribution data to CRM system without interfering with
 * existing Zapier or tracking flows.
 * 
 * This is an additive-only implementation that preserves all existing functionality.
 */

/**
 * Interface for the attribution data payload
 */
interface AttributionPayload {
  // Identifiers for matching in CRM
  email: string;
  phone: string;
  
  // UTM attribution parameters
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_term?: string | null;
  utm_content?: string | null;
  
  // Facebook Click ID
  fbclid?: string | null;
  
  // Referrer information
  referrer?: string | null;
}

/**
 * Send attribution data to CRM system
 * 
 * This function runs in parallel to the main Zapier webhook
 * and does not block or delay the main submission process.
 * 
 * @param leadData The lead data containing attribution parameters
 */
export async function sendAttributionToCRM(leadData: any): Promise<void> {
  try {
    console.log("🎯 ATTRIBUTION WEBHOOK FIRED - Processing data");
    
    // Log incoming data for debugging (redact sensitive parts)
    console.log("📨 Attribution Webhook Data Structure:", JSON.stringify({
      has_email: !!leadData.email || !!(leadData.contactInfo?.email),
      has_phone: !!leadData.phone || !!(leadData.contactInfo?.phone),
      has_utm_source: !!leadData.utm_source,
      has_utm_medium: !!leadData.utm_medium,
      has_utm_campaign: !!leadData.utm_campaign,
      utm_source_value: leadData.utm_source || '',
      utm_medium_value: leadData.utm_medium || '',
      utm_campaign_value: leadData.utm_campaign || '',
      data_keys: Object.keys(leadData)
    }));
    
    // Extract only the attribution data and identifier fields
    const payload: AttributionPayload = {
      // Required identifiers for matching
      email: leadData.email || leadData.contactInfo?.email || '',
      phone: leadData.phone || leadData.contactInfo?.phone || '',
      
      // Attribution data (optional)
      utm_source: leadData.utm_source || null,
      utm_medium: leadData.utm_medium || null,
      utm_campaign: leadData.utm_campaign || null,
      utm_term: leadData.utm_term || null,
      utm_content: leadData.utm_content || null,
      fbclid: leadData.fbclid || null,
      referrer: leadData.referrer || null
    };
    
    // Skip if we don't have at least one identifier
    if (!payload.email && !payload.phone) {
      console.warn('❌ ATTRIBUTION WEBHOOK SKIPPED - No email or phone identifier available');
      return;
    }
    
    // Use environment variable for CRM domain if available
    const crmDomain = process.env.CRM_DOMAIN || '<YOUR_CRM_DOMAIN>';
    console.log(`🔍 CRM_DOMAIN from env: "${crmDomain}"`);
    
    // Skip if no domain is configured (prevents errors in development)
    if (crmDomain === '<YOUR_CRM_DOMAIN>') {
      console.warn('❌ ATTRIBUTION WEBHOOK SKIPPED - CRM_DOMAIN environment variable not configured');
      return;
    }
    
    // Format the URL with https:// if not already included
    const crmUrl = crmDomain.startsWith('http') ? crmDomain : `https://${crmDomain}`;
    
    // Full webhook URL for detailed logging
    const webhookUrl = `${crmUrl}/api/crm/track-lead-source`;
    console.log(`📤 ATTRIBUTION WEBHOOK URL: ${webhookUrl}`);
    
    // Log what we're sending (sanitized - email domain only, phone prefix only)
    const emailDomain = payload.email ? payload.email.split('@')[1] || 'unknown' : 'none';
    const phonePrefix = payload.phone ? payload.phone.substring(0, 3) + '***' : 'none';
    console.log(`📋 ATTRIBUTION PAYLOAD: ${JSON.stringify({
      email_domain: emailDomain,
      phone_prefix: phonePrefix,
      utm_source: payload.utm_source,
      utm_medium: payload.utm_medium,
      utm_campaign: payload.utm_campaign,
      utm_term: payload.utm_term,
      utm_content: payload.utm_content,
      fbclid: payload.fbclid ? 'present' : 'none',
      referrer: payload.referrer
    })}`);
    
    // Send to CRM endpoint - explicitly await to get full error details
    console.log(`🔄 SENDING ATTRIBUTION DATA TO CRM: ${webhookUrl}`);
    
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Attribution-Source': 'quote-calculator'
        },
        body: JSON.stringify(payload)
      });
      
      // Check response status
      if (response.ok) {
        const responseText = await response.text();
        console.log(`✅ ATTRIBUTION WEBHOOK SUCCESS - Status: ${response.status}, Response: ${responseText || 'Empty response'}`);
      } else {
        const errorText = await response.text();
        console.error(`❌ ATTRIBUTION WEBHOOK ERROR - Status: ${response.status}, Response: ${errorText || 'No error details'}`);
      }
    } catch (fetchError) {
      // Detailed error logging
      console.error(`❌ ATTRIBUTION WEBHOOK NETWORK ERROR:`, 
        fetchError instanceof Error ? fetchError.message : String(fetchError),
        fetchError instanceof Error && fetchError.stack ? `\nStack: ${fetchError.stack}` : '');
    }
  } catch (error) {
    // Log error but don't disrupt main flow
    console.error(`❌ ATTRIBUTION WEBHOOK FAILED (Processing Error):`,
      error instanceof Error ? error.message : String(error),
      error instanceof Error && error.stack ? `\nStack: ${error.stack}` : '');
  }
}