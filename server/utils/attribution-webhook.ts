/**
 * Attribution Webhook Module
 * 
 * Handles sending attribution data to CRM system without interfering with
 * existing Zapier or tracking flows.
 */

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
    const payload = {
      // Identifiers for matching
      email: leadData.email,
      phone: leadData.phone,
      
      // Attribution data
      utm_source: leadData.utm_source,
      utm_medium: leadData.utm_medium,
      utm_campaign: leadData.utm_campaign,
      utm_term: leadData.utm_term,
      utm_content: leadData.utm_content,
      fbclid: leadData.fbclid,
      referrer: leadData.referrer
    };
    
    // Use environment variable for CRM domain if available, otherwise use placeholder
    // This will need to be configured with the actual CRM domain
    const crmDomain = process.env.CRM_DOMAIN || '<YOUR_CRM_DOMAIN>';
    
    // Send to CRM endpoint - non-blocking
    fetch(`https://${crmDomain}/api/crm/track-lead-source`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    // Log success but don't wait for completion
    console.log('Attribution data sent to CRM (non-blocking)');
  } catch (error) {
    // Log error but don't disrupt main flow
    console.error('Attribution webhook to CRM failed (non-critical):', error);
  }
}