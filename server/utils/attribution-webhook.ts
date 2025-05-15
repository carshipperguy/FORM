/**
 * Attribution Webhook Module
 * 
 * Handles sending attribution data to CRM system without interfering with
 * existing Zapier or tracking flows.
 * 
 * This is an additive-only implementation that preserves all existing functionality.
 */
import * as https from 'https';

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
    // HOTFIX: Hardcode the domain since environment variable access is failing
    const crmDomain = 'amerigoautotransport.replit.app';
    console.log(`🔍 CRM_DOMAIN: "${crmDomain}"`);
    
    // No longer need this check since we're hardcoding the domain
    // Keeping the check for any future environment variable usage
    if (!crmDomain) {
      console.warn('❌ ATTRIBUTION WEBHOOK SKIPPED - CRM domain not configured');
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
    
    // Direct fetch implementation with explicit HTTPS url and maximum error handling
    // No environment variables, no try/catch swallowing errors
    console.log(`🚨 CRITICAL: SENDING ATTRIBUTION DATA TO CRM: https://amerigoautotransport.replit.app/api/crm/track-lead-source`);
    
    // No more async/await pattern - use direct promise with explicit error handling
    // Log entire process for debugging
    console.log(`📦 ATTRIBUTION PAYLOAD BEING SENT: ${JSON.stringify(payload)}`);
    
    // Direct fetch to explicit domain - no variables, no conditions
    fetch('https://amerigoautotransport.replit.app/api/crm/track-lead-source', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Attribution-Source': 'quote-calculator',
        'User-Agent': 'Amerigo-Quote-Form/1.0'
      },
      body: JSON.stringify(payload)
    })
    .then(response => {
      console.log(`🔄 ATTRIBUTION WEBHOOK RESPONSE RECEIVED - Status: ${response.status}`);
      return response.text().then(text => ({ status: response.status, text }));
    })
    .then(({ status, text }) => {
      if (status >= 200 && status < 300) {
        console.log(`✅ ATTRIBUTION WEBHOOK SUCCESS - Status: ${status}, Response: ${text || 'Empty response'}`);
      } else {
        console.error(`❌ ATTRIBUTION WEBHOOK ERROR - Status: ${status}, Response: ${text || 'No error details'}`);
      }
    })
    .catch(error => {
      // Log absolutely everything about this error
      console.error(`❌ CRITICAL WEBHOOK FAILURE: ${error.message}`);
      console.error(`Stack: ${error.stack || 'No stack trace'}`);
      console.error(`Full error details: ${JSON.stringify(error)}`);
      
      // Try a fallback with Node.js built-in https module - no external dependencies
      console.log('🔄 ATTEMPTING EMERGENCY FALLBACK DIRECT HTTPS REQUEST');
      
      // Already imported https at the top of the file - no need to require it here
      
      // Create the request options with explicit parameters
      const requestOptions = {
        hostname: 'amerigoautotransport.replit.app',
        port: 443,
        path: '/api/crm/track-lead-source',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Attribution-Source': 'quote-calculator-fallback',
          'User-Agent': 'Amerigo-Quote-Form-Fallback/1.0'
        }
      };
      
      // Create the actual request with type annotations
      const fallbackReq = https.request(requestOptions, (res: any) => {
        console.log(`🔄 FALLBACK ATTRIBUTION WEBHOOK RESPONSE - Status: ${res.statusCode}`);
        
        let responseData = '';
        res.on('data', (chunk: any) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`✅ FALLBACK ATTRIBUTION WEBHOOK SUCCESS - Response: ${responseData || 'Empty response'}`);
          } else {
            console.error(`❌ FALLBACK ATTRIBUTION WEBHOOK ERROR - Status: ${res.statusCode}, Response: ${responseData || 'No error details'}`);
          }
        });
      });
      
      // Handle request errors with type annotation
      fallbackReq.on('error', (err: any) => {
        console.error(`❌❌ CRITICAL: Both primary and fallback attribution webhook methods failed: ${err.message}`);
      });
      
      // Write the payload to the request
      fallbackReq.write(JSON.stringify(payload));
      fallbackReq.end();
    });
  } catch (error) {
    // Log error but don't disrupt main flow
    console.error(`❌ ATTRIBUTION WEBHOOK FAILED (Processing Error):`,
      error instanceof Error ? error.message : String(error),
      error instanceof Error && error.stack ? `\nStack: ${error.stack}` : '');
  }
}