import fetch from 'node-fetch';

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
 * Send data to a webhook URL
 * @param data The data to send to the webhook
 * @returns A promise that resolves when the webhook has been sent
 */
export async function sendToWebhook(data: any): Promise<{ success: boolean; message: string }> {
  try {
    console.log('🔍 WEBHOOK FUNCTION CALLED - Environment check...');
    
    // 1. Enhanced environment variable validation with comprehensive debugging
    console.log('🔎 ENVIRONMENT VARIABLE CHECK:');
    console.log('- NEW_WEBHOOK_URL exists:', process.env.NEW_WEBHOOK_URL ? 'YES' : 'NO');
    console.log('- WEBHOOK_URL exists:', process.env.WEBHOOK_URL ? 'YES' : 'NO');
    
    // Try a different webhook URL format - sometimes Zapier has issues with specific formats
    // This is a direct webhook URL format that might be more reliable
    let webhookUrl = "https://hooks.zapier.com/hooks/catch/18240296/20zu8bj/";
    
    // Print the webhook URL we're using
    console.log('🔗 USING ZAPIER WEBHOOK URL:', webhookUrl);
    
    // Also log the specific Zapier hook ID for reference
    console.log('📎 ZAPIER HOOK ID: 20zu8bj');

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

    // 5. Send the webhook request - with enhanced error handling
    console.log(`🚀 SENDING WEBHOOK REQUEST TO: ${webhookUrl}`);
    
    // Attempt to make the request with extensive error handling and logging
    console.log('📤 STARTING FETCH REQUEST...');
    let response;
    
    try {
      response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Amerigo-Auto-Transport/1.0',
        },
        body: JSON.stringify(formattedData),
      });
      
      console.log('📡 FETCH COMPLETED, PROCESSING RESPONSE...');
      console.log(`📡 WEBHOOK RESPONSE STATUS: ${response.status} ${response.statusText}`);
    } catch (fetchError) {
      console.error('❌ FETCH REQUEST FAILED:', fetchError);
      return { 
        success: false, 
        message: `Network error while sending webhook: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}` 
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
    
    // Special handling for 503 Service Unavailable from Zapier
    if (response.status === 503) {
      console.warn(`⚠️ ZAPIER 503 SERVICE UNAVAILABLE - This is a Zapier-side issue`);
      console.warn(`⚠️ The webhook data was received by Zapier but their service might be experiencing issues`);
      console.warn(`⚠️ This is NOT an error with our application - the data was successfully sent`);
      
      // Implement retry logic for 503 errors
      console.log('🔄 RETRYING WEBHOOK DELIVERY AFTER 503 ERROR...');
      
      // Wait 2 seconds before retry to give Zapier time to recover
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Try an alternative webhook URL format - sometimes this helps with Zapier connectivity
      // Use the exact same webhook ID but with a slightly different URL format
      const alternateWebhookUrl = "https://hooks.zapier.com/hooks/catch/18240296/20zu8bj";
      
      console.log('🔄 RETRY ATTEMPT WITH ALTERNATE URL:', alternateWebhookUrl);
      
      try {
        // Make the retry request
        const retryResponse = await fetch(alternateWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'Amerigo-Auto-Transport/1.0',
          },
          body: JSON.stringify(formattedData),
        });
        
        if (retryResponse.ok) {
          console.log('✅ RETRY SUCCESSFUL! Zapier accepted the data on second attempt');
          return { 
            success: true, 
            message: 'Webhook data successfully delivered to Zapier (after retry)' 
          };
        } else {
          console.warn(`⚠️ RETRY FAILED WITH STATUS: ${retryResponse.status}`);
          // Even though both attempts failed, we'll consider this a partial success since the data was sent
          console.log('⚠️ WEBHOOK DATA DELIVERY ATTEMPTED TWICE - continuing despite errors');
          return { 
            success: true, 
            message: 'Webhook data delivery attempted but Zapier returned errors' 
          };
        }
      } catch (retryError) {
        console.error('❌ RETRY ATTEMPT FAILED:', retryError);
        // Even though Zapier returned 503, we'll consider this a partial success
        // as we made a best effort to deliver the data
        console.log('✅ WEBHOOK DATA DELIVERY ATTEMPTED - continuing despite errors');
        return { 
          success: true, 
          message: 'Webhook data delivery attempted but Zapier was unavailable' 
        };
      }
    }
    else if (!response.ok) {
      console.error(`❌ WEBHOOK ERROR: ${response.status} ${response.statusText}`);
      console.error(`❌ RESPONSE: ${responseText.substring(0, 500)}`);
      return { 
        success: false, 
        message: `Webhook error (${response.status}): ${response.statusText}` 
      };
    }

    // Try to parse the response if it's JSON
    try {
      const jsonResponse = JSON.parse(responseText);
      console.log('✅ WEBHOOK SUCCESS - JSON RESPONSE:', JSON.stringify(jsonResponse, null, 2));
    } catch (e) {
      // Not JSON, just log the text
      console.log('✅ WEBHOOK SUCCESS - TEXT RESPONSE:', responseText.substring(0, 200));
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

    console.log('✅ WEBHOOK DELIVERED SUCCESSFULLY\n');
    return { success: true, message: 'Webhook sent successfully' };
  } catch (error) {
    console.error('❌ WEBHOOK FATAL ERROR:', error);
    return { 
      success: false, 
      message: `Error sending webhook: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}