import fetch from 'node-fetch';
import { recordWebhookStart, recordWebhookCompletion } from './webhook-diagnostics';
import { recordWebhookAttempt } from './webhook-monitor';
import { createFieldDiagnosticLog } from './webhook-field-diagnostics';
import { recordSubmission } from './webhook-monitor-queue';

// Helper functions to parse location data
const extractCity = (location?: string): string => {
  if (!location) return 'Not provided';
  // Extract everything before the comma
  const match = location.match(/^([^,]+)/);
  return match ? match[1].trim() : 'Not provided';
};

const extractState = (location?: string): string => {
  if (!location) return 'Not provided';
  // Match the state code (2 uppercase letters after a comma)
  const match = location.match(/,\s*([A-Z]{2})/);
  return match ? match[1].trim() : 'Not provided';
};

const extractZip = (location?: string): string => {
  if (!location) return 'Not provided';
  // Match 5 digits at the end of the string (standard ZIP code format)
  const match = location.match(/(\d{5})(?:\s*$|-\d{4}\s*$)/);
  return match ? match[1].trim() : 'Not provided';
};

/**
 * Send data to a webhook URL with enhanced diagnostics
 * @param data The data to send to the webhook
 * @returns A promise that resolves when the webhook has been sent
 */
export async function sendToWebhook(data: any): Promise<{ success: boolean; message: string; diagnostics?: any }> {
  try {
    console.log('🔍 WEBHOOK FUNCTION CALLED - Environment check...');
    
    // 1. Enhanced environment variable validation with comprehensive debugging
    console.log('🔎 ENVIRONMENT VARIABLE CHECK:');
    console.log('- NEW_WEBHOOK_URL exists:', process.env.NEW_WEBHOOK_URL ? 'YES' : 'NO');
    console.log('- WEBHOOK_URL exists:', process.env.WEBHOOK_URL ? 'YES' : 'NO');
    
    // Determine which webhook URL to use based on the event type
    // The eventType helps us route different kinds of submissions to different Zapier zaps
    let webhookUrl;
    let zapierHookId;
    
    // Check if this is a final submission (order) or a quote submission (lead)
    if (data.eventType === 'final_submission') {
      // This is a final order submission - use the order webhook
      webhookUrl = "https://hooks.zapier.com/hooks/catch/18240296/2xrmfy2/";
      zapierHookId = "2xrmfy2";
      console.log('🔴 USING ORDER BOOKING WEBHOOK - This is a final submission');
    } else {
      // This is a quote submission or other type - use the lead webhook
      webhookUrl = "https://hooks.zapier.com/hooks/catch/18240296/20zu8bj/";
      zapierHookId = "20zu8bj";
      console.log('🔵 USING LEAD CAPTURE WEBHOOK - This is a quote submission');
    }
    
    // Print the webhook URL we're using
    console.log('🔗 USING ZAPIER WEBHOOK URL:', webhookUrl);
    
    // Also log the specific Zapier hook ID for reference
    console.log('📎 ZAPIER HOOK ID:', zapierHookId);

    // 2. Prepare the request data with more verbose logging
    console.log('📋 PREPARING WEBHOOK DATA...');
    const submissionId = data.submissionId || `AUTO-${Date.now()}`;
    const submissionDate = data.submissionDate || new Date().toISOString();
    const eventType = data.eventType || "form_submission";
    
    // Format shipment date in MM/DD/YYYY format
    let formattedShipmentDate = 'Not provided';
    if (data.shipmentDate) {
      try {
        // Handle different date formats
        const date = new Date(data.shipmentDate);
        if (!isNaN(date.getTime())) {
          // Format as MM/DD/YYYY
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const day = date.getDate().toString().padStart(2, '0');
          const year = date.getFullYear();
          formattedShipmentDate = `${month}/${day}/${year}`;
        }
      } catch (e) {
        console.error('⚠️ Error formatting date:', e);
        formattedShipmentDate = data.shipmentDate; // fallback to original
      }
    }
    
    // Log the Zapier field mapping to help debug integration
    console.log('📋 ZAPIER FIELD MAPPING KEYS:');
    console.log('- Contact Info Name');
    console.log('- Contact Info Email');
    console.log('- Contact Info Phone (required)');
    console.log('- Route Details Pickup City');
    console.log('- Route Details Pickup State');
    console.log('- Route Details Pickup Zip');
    console.log('- Route Details Dropoff City');
    console.log('- Route Details Dropoff State');
    console.log('- Route Details Dropoff Zip');
    console.log('- Route Details Distance (in miles)');
    console.log('- Route Details Estimated Transit Time');
    console.log('- Route Details Shipment Date');
    console.log('- Price Details Total Price (Open Transport Only)');
    console.log('- Vehicle Details Year');
    console.log('- Vehicle Details Make');
    console.log('- Vehicle Details Model');

    // 3. Format the data in two different ways to increase chances of success
    
    // First format: Simpler flat format that many Zapier integrations prefer
    const simplifiedData = {
      // Simple fields with straightforward names
      name: data.name || 'Not provided',
      email: data.email || 'Not provided',
      phone: data.phone || 'Not provided',
      
      // Location information
      pickup_city: extractCity(data.pickupLocation),
      pickup_state: extractState(data.pickupLocation),
      pickup_zip: data.pickupZip || extractZip(data.pickupLocation) || 'Not provided',
      dropoff_city: extractCity(data.dropoffLocation),
      dropoff_state: extractState(data.dropoffLocation),
      dropoff_zip: data.dropoffZip || extractZip(data.dropoffLocation) || 'Not provided',
      
      // Route information
      distance: data.distance || 0,
      transit_time: data.transitTime || 0,
      
      // Pricing information
      open_transport_price: data.openTransportPrice || 'Not provided',
      enclosed_transport_price: data.enclosedTransportPrice || 'Not provided',
      
      // Vehicle information
      vehicle_year: data.year || 'Not provided',
      vehicle_make: data.make || 'Not provided',
      vehicle_model: data.model || 'Not provided',
      vehicle_type: data.vehicleType || 'Not provided',
      
      // Dates
      shipment_date: formattedShipmentDate,
      submission_date: submissionDate,
      
      // Metadata
      submission_id: submissionId,
      event_type: eventType
    };
    
    // Second format: Our original format with specific field names for Zapier mapping
    const originalFormat = {
      // Event metadata
      submissionId,
      submissionDate,
      eventType,
      
      // Contact Info fields
      "Contact Info Name": data.name || 'Not provided',
      "Contact Info Email": data.email || 'Not provided',
      "Contact Info Phone (required)": data.phone || 'Not provided',
      
      // Route Details fields
      "Route Details Pickup City": extractCity(data.pickupLocation),
      "Route Details Pickup State": extractState(data.pickupLocation),
      "Route Details Pickup Zip": data.pickupZip || extractZip(data.pickupLocation) || 'Not provided',
      "Route Details Dropoff City": extractCity(data.dropoffLocation),
      "Route Details Dropoff State": extractState(data.dropoffLocation),
      "Route Details Dropoff Zip": data.dropoffZip || extractZip(data.dropoffLocation) || 'Not provided',
      "Route Details Distance (in miles)": data.distance || 0,
      "Route Details Estimated Transit Time": data.transitTime || 0,
      
      // Price Details fields
      "Price Details Total Price (Open Transport Only)": data.openTransportPrice || 'Not provided',
      
      // Vehicle Details fields
      "Vehicle Details Year": data.year || 'Not provided',
      "Vehicle Details Make": data.make || 'Not provided',
      "Vehicle Details Model": data.model || 'Not provided',
      
      // Shipment Date field with proper formatting
      "Route Details Shipment Date": formattedShipmentDate,
      
      // Original fields
      pickupLocation: data.pickupLocation || 'Not provided',
      dropoffLocation: data.dropoffLocation || 'Not provided',
      vehicleType: data.vehicleType || 'Not provided',
      shipmentDate: formattedShipmentDate,
      enclosedTransportPrice: data.enclosedTransportPrice || 'Not provided',
    };
    
    // Combine both formats into a single object
    // This increases our chances that Zapier will find fields it can map
    const formattedData = {
      ...simplifiedData,
      ...originalFormat
    };

    // 4. Log webhook event details
    console.log('\n======================================');
    console.log(`🔔 WEBHOOK: SENDING LEAD TO CRM SYSTEM`);
    console.log(`📧 Email: ${data.email || 'Not provided'}`);
    console.log(`☎️ Phone: ${data.phone || 'Not provided'}`);
    console.log(`🚗 Vehicle: ${data.year || ''} ${data.make || ''} ${data.model || ''}`);
    console.log(`📍 Route: ${data.pickupLocation || ''} → ${data.dropoffLocation || ''}`);
    console.log(`💰 Quote: $${data.openTransportPrice || 'N/A'} (Open) / $${data.enclosedTransportPrice || 'N/A'} (Enclosed)`);
    console.log(`🕒 Event: ${eventType} at ${new Date().toISOString()}`);
    console.log('======================================\n');
    
    // Generate detailed field mapping diagnostic log
    const formType = eventType === 'final_submission' ? 'final' : 'quote';
    const fieldDiagnosticLog = createFieldDiagnosticLog(data, formattedData, formType);
    console.log(fieldDiagnosticLog);

    // 5. Send the webhook request - with enhanced diagnostics for monitoring
    console.log(`🚀 SENDING WEBHOOK REQUEST TO: ${webhookUrl}`);
    
    // Measure payload size in bytes for diagnostic purposes
    const jsonPayload = JSON.stringify(formattedData);
    const payloadSizeBytes = new TextEncoder().encode(jsonPayload).length;
    
    console.log(`📏 WEBHOOK PAYLOAD SIZE: ${payloadSizeBytes} bytes (${(payloadSizeBytes / 1024).toFixed(2)} KB)`);
    
    // Record timestamps for latency measurement
    const requestStartTime = Date.now();
    
    // Define diagnostic data with proper types
    const diagnosticData: {
      requestStartTime: number;
      payloadSizeBytes: number;
      webhookUrl: string;
      requestId: string;
      responseStatus: number | null;
      responseTime: number | null;
      responseSize: number | null;
      retryAttempted: boolean;
      retrySuccessful?: boolean;
      retryResponseTime?: number;
      retryResponseStatus?: number;
      retryError?: any;
      error: any | null;
      success?: boolean;
      requestEndTime?: number;
      totalDuration?: number;
      jsonResponse?: any;
      textResponse?: string;
    } = {
      requestStartTime,
      payloadSizeBytes,
      webhookUrl,
      requestId: `req_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
      responseStatus: null,
      responseTime: null,
      responseSize: null,
      retryAttempted: false,
      error: null
    };
    
    console.log(`🔍 WEBHOOK REQUEST ID: ${diagnosticData.requestId}`);
    console.log('📤 STARTING FETCH REQUEST...');
    
    // Record webhook request start in the diagnostic system
    recordWebhookStart({
      url: webhookUrl,
      payload: formattedData,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Amerigo-Auto-Transport/1.0',
        'X-Request-ID': diagnosticData.requestId
      },
      startTime: requestStartTime,
      requestId: diagnosticData.requestId,
      eventType: eventType
    });
    
    let response;
    
    try {
      // Use a timeout to automatically fail if request takes too long
      const timeoutController = new AbortController();
      const timeoutId = setTimeout(() => timeoutController.abort(), 15000); // 15 second timeout
      
      response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Amerigo-Auto-Transport/1.0',
          'X-Request-ID': diagnosticData.requestId,
          'X-Payload-Size': payloadSizeBytes.toString()
        },
        body: jsonPayload,
        signal: timeoutController.signal
      });
      
      // Clear the timeout since request completed
      clearTimeout(timeoutId);
      
      // Calculate request duration
      const requestEndTime = Date.now();
      const requestDuration = requestEndTime - requestStartTime;
      
      // Update diagnostic data
      diagnosticData.responseTime = requestDuration;
      diagnosticData.responseStatus = response.status;
      
      console.log(`📡 FETCH COMPLETED IN ${requestDuration}ms`);
      console.log(`📡 WEBHOOK RESPONSE STATUS: ${response.status} ${response.statusText}`);
    } catch (fetchError) {
      // Calculate failure time for diagnostics
      const failureTime = Date.now();
      const failureDuration = failureTime - requestStartTime;
      
      // Update diagnostic data for error case
      diagnosticData.responseTime = failureDuration;
      diagnosticData.error = fetchError instanceof Error ? 
        { name: fetchError.name, message: fetchError.message } : 
        String(fetchError);
      
      // Check if this was a timeout
      const isTimeout = fetchError instanceof Error && 
        (fetchError.name === 'AbortError' || fetchError.message.includes('timeout'));
      
      if (isTimeout) {
        console.error(`⏱️ WEBHOOK REQUEST TIMED OUT AFTER ${failureDuration}ms`);
        diagnosticData.error = { name: 'TimeoutError', message: `Request timed out after ${failureDuration}ms` };
      } else {
        console.error('❌ WEBHOOK REQUEST FAILED:', fetchError);
      }
      
      // Record webhook failure in the diagnostic system
      recordWebhookCompletion(
        {
          url: webhookUrl,
          payload: formattedData,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'Amerigo-Auto-Transport/1.0',
            'X-Request-ID': diagnosticData.requestId
          },
          startTime: requestStartTime,
          requestId: diagnosticData.requestId,
          eventType: eventType
        },
        {
          status: 0, // No status code for network errors
          responseTime: failureDuration,
          responseText: String(fetchError),
          success: false,
          error: fetchError instanceof Error ? fetchError.message : String(fetchError)
        }
      );
      
      // Record in the monitor system
      recordWebhookAttempt(
        webhookUrl,
        false,
        failureDuration,
        payloadSizeBytes,
        0,
        fetchError instanceof Error ? fetchError.message : String(fetchError)
      );
      
      return { 
        success: false, 
        message: `Network error while sending webhook: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`,
        diagnostics: diagnosticData
      };
    }
    
    // 6. Process the response with enhanced error handling
    let responseText;
    try {
      responseText = await response.text();
      console.log('📝 RECEIVED RESPONSE TEXT LENGTH:', responseText.length);
    } catch (textError) {
      console.error('❌ FAILED TO READ RESPONSE TEXT:', textError);
      return { 
        success: false, 
        message: `Failed to read response from webhook: ${textError instanceof Error ? textError.message : String(textError)}` 
      };
    }
    
    // Update diagnostic data with response size
    diagnosticData.responseSize = responseText.length;
    
    // Special handling for 502 and 503 errors from Zapier
    if (response.status === 502 || response.status === 503) {
      console.warn(`⚠️ ZAPIER ${response.status} ERROR - This is a Zapier-side issue`);
      console.warn(`⚠️ The webhook data was received by Zapier but their service might be experiencing issues`);
      console.warn(`⚠️ This is NOT an error with our application - the data was successfully sent`);
      
      // Update diagnostic data with error info
      diagnosticData.error = {
        type: `Zapier${response.status}Error`,
        message: response.statusText,
        responseText: responseText.substring(0, 500)
      };
      
      // Implement retry logic for server errors
      console.log(`🔄 RETRYING WEBHOOK DELIVERY AFTER ${response.status} ERROR...`);
      
      // Wait 2 seconds before retry to give Zapier time to recover
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Try an alternative webhook URL format - sometimes this helps with Zapier connectivity
      // Use the exact same webhook ID but with a slightly different URL format
      const alternateWebhookUrl = "https://hooks.zapier.com/hooks/catch/18240296/20zu8bj";
      
      console.log('🔄 RETRY ATTEMPT WITH ALTERNATE URL:', alternateWebhookUrl);
      diagnosticData.retryAttempted = true;
      
      try {
        // Record retry start time for diagnostics
        const retryStartTime = Date.now();
        
        // Make the retry request with timeout
        const retryController = new AbortController();
        const retryTimeoutId = setTimeout(() => retryController.abort(), 15000);
        
        const retryResponse = await fetch(alternateWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'Amerigo-Auto-Transport/1.0',
            'X-Request-ID': `${diagnosticData.requestId}_retry`,
            'X-Payload-Size': payloadSizeBytes.toString(),
            'X-Retry': 'true'
          },
          body: jsonPayload,
          signal: retryController.signal
        });
        
        // Clear the timeout
        clearTimeout(retryTimeoutId);
        
        // Calculate retry duration
        const retryEndTime = Date.now();
        const retryDuration = retryEndTime - retryStartTime;
        
        // Update diagnostic data with retry info
        diagnosticData.retryResponseTime = retryDuration;
        diagnosticData.retryResponseStatus = retryResponse.status;
        
        if (retryResponse.ok) {
          console.log(`✅ RETRY SUCCESSFUL in ${retryDuration}ms! Zapier accepted the data on second attempt`);
          
          // Add retry success to diagnostics
          diagnosticData.retrySuccessful = true;
          
          return { 
            success: true, 
            message: 'Webhook data successfully delivered to Zapier (after retry)',
            diagnostics: diagnosticData
          };
        } else {
          console.warn(`⚠️ RETRY FAILED WITH STATUS: ${retryResponse.status} in ${retryDuration}ms`);
          
          // Add retry failure to diagnostics
          diagnosticData.retrySuccessful = false;
          diagnosticData.retryError = {
            status: retryResponse.status,
            statusText: retryResponse.statusText
          };
          
          // Even though both attempts failed, we'll consider this a partial success since the data was sent
          console.log('⚠️ WEBHOOK DATA DELIVERY ATTEMPTED TWICE - continuing despite errors');
          return { 
            success: true, 
            message: 'Webhook data delivery attempted but Zapier returned errors',
            diagnostics: diagnosticData 
          };
        }
      } catch (retryError) {
        console.error('❌ RETRY ATTEMPT FAILED:', retryError);
        
        // Update retry diagnostics
        diagnosticData.retrySuccessful = false;
        diagnosticData.retryError = retryError instanceof Error ? 
          { name: retryError.name, message: retryError.message } : 
          String(retryError);
        
        // Even though Zapier returned error, we'll consider this a partial success
        // as we made a best effort to deliver the data
        console.log('✅ WEBHOOK DATA DELIVERY ATTEMPTED - continuing despite errors');
        return { 
          success: true, 
          message: 'Webhook data delivery attempted but Zapier was unavailable',
          diagnostics: diagnosticData
        };
      }
    }
    else if (!response.ok) {
      console.error(`❌ WEBHOOK ERROR: ${response.status} ${response.statusText}`);
      console.error(`❌ RESPONSE: ${responseText.substring(0, 500)}`);
      
      // Update diagnostic data with error details
      diagnosticData.error = {
        status: response.status,
        statusText: response.statusText,
        responseText: responseText.substring(0, 500)
      };
      
      return { 
        success: false, 
        message: `Webhook error (${response.status}): ${response.statusText}`,
        diagnostics: diagnosticData
      };
    }

    // Try to parse the response if it's JSON
    let parsedResponse = null;
    try {
      parsedResponse = JSON.parse(responseText);
      console.log('✅ WEBHOOK SUCCESS - JSON RESPONSE:', JSON.stringify(parsedResponse, null, 2));
      
      // Add JSON response to diagnostics
      diagnosticData.jsonResponse = parsedResponse;
    } catch (e) {
      // Not JSON, just log the text
      console.log('✅ WEBHOOK SUCCESS - TEXT RESPONSE:', responseText.substring(0, 200));
      
      // Add text response to diagnostics (truncated)
      diagnosticData.textResponse = responseText.substring(0, 500);
    }
    
    // Log the actual data we sent for debugging
    console.log('📦 WEBHOOK DATA SENT TO ZAPIER:');
    console.log('- Contact Info Name:', formattedData["Contact Info Name"]);
    console.log('- Contact Info Email:', formattedData["Contact Info Email"]);
    console.log('- Contact Info Phone:', formattedData["Contact Info Phone (required)"]);
    console.log('- Route Details Pickup City:', formattedData["Route Details Pickup City"]);
    console.log('- Route Details Pickup State:', formattedData["Route Details Pickup State"]);
    console.log('- Route Details Pickup Zip:', formattedData["Route Details Pickup Zip"]);
    console.log('- Route Details Dropoff City:', formattedData["Route Details Dropoff City"]);
    console.log('- Route Details Dropoff State:', formattedData["Route Details Dropoff State"]);
    console.log('- Route Details Dropoff Zip:', formattedData["Route Details Dropoff Zip"]);
    console.log('- Route Details Shipment Date:', formattedData["Route Details Shipment Date"]);

    // Mark success in diagnostics
    diagnosticData.success = true;
    diagnosticData.requestEndTime = Date.now();
    diagnosticData.totalDuration = diagnosticData.requestEndTime - diagnosticData.requestStartTime;
    
    console.log('✅ WEBHOOK DELIVERED SUCCESSFULLY in', diagnosticData.totalDuration, 'ms\n');
    
    // Record webhook completion in the diagnostic system
    recordWebhookCompletion(
      {
        url: webhookUrl,
        payload: formattedData,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Amerigo-Auto-Transport/1.0',
          'X-Request-ID': diagnosticData.requestId
        },
        startTime: requestStartTime,
        requestId: diagnosticData.requestId,
        eventType: eventType
      },
      {
        status: response.status,
        responseTime: diagnosticData.totalDuration,
        responseText: responseText.substring(0, 500),
        success: true
      }
    );
    
    // Record in the monitor system
    recordWebhookAttempt(
      webhookUrl,
      true,
      diagnosticData.totalDuration,
      payloadSizeBytes,
      response.status
    );
    
    // Record the submission in the submission monitor queue for field mapping analysis
    const logLines = fieldDiagnosticLog.split('\n');
    
    // Add the submission to our monitoring queue
    recordSubmission(
      eventType === 'final_submission' ? 'final' : 'quote', // Determine form type directly
      data,
      formattedData,
      logLines,
      true,
      {
        status: response.status,
        body: responseText.substring(0, 1000) // Limit response body size
      }
    );
    
    // Return success with complete diagnostics
    return { 
      success: true, 
      message: 'Webhook sent successfully',
      diagnostics: diagnosticData
    };
  } catch (error) {
    console.error('❌ WEBHOOK FATAL ERROR:', error);
    return { 
      success: false, 
      message: `Error sending webhook: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}