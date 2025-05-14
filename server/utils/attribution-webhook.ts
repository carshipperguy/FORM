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
      console.warn('Attribution webhook skipped - no email or phone identifier available');
      return;
    }
    
    // Use environment variable for CRM domain if available
    const crmDomain = process.env.CRM_DOMAIN || '<YOUR_CRM_DOMAIN>';
    
    // Skip if no domain is configured (prevents errors in development)
    if (crmDomain === '<YOUR_CRM_DOMAIN>') {
      console.warn('Attribution webhook skipped - CRM_DOMAIN environment variable not configured');
      return;
    }
    
    // Log what we're sending (but never log the actual payload to avoid exposing PII)
    console.log(`🔄 Sending attribution data to CRM (${crmDomain}) - non-blocking`);
    
    // Send to CRM endpoint - non-blocking
    fetch(`https://${crmDomain}/api/crm/track-lead-source`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Attribution-Source': 'quote-calculator'
      },
      body: JSON.stringify(payload)
    }).then(() => {
      console.log('✅ Attribution data sent to CRM successfully');
    }).catch(error => {
      // This won't block the main thread
      console.error('❌ Attribution webhook to CRM failed (non-critical):', 
        error instanceof Error ? error.message : String(error));
    });
    
  } catch (error) {
    // Log error but don't disrupt main flow
    console.error('❌ Attribution webhook to CRM failed (non-critical):',
      error instanceof Error ? error.message : String(error));
  }
}