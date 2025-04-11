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
    
    // 1. Enhanced environment variable validation
    let webhookUrl = process.env.WEBHOOK_URL;
    
    // More detailed debugging for environment variables
    if (!webhookUrl || webhookUrl.trim() === '') {
      console.error('🚨 CRITICAL: WEBHOOK_URL environment variable is missing or empty');
      console.log('🔑 Available environment variables:', Object.keys(process.env).filter(key => !key.includes('KEY') && !key.includes('SECRET')).join(', '));
      
      // Fall back to the hardcoded webhook URL if in production and no env var is set
      // IMPORTANT: This is a temporary measure to ensure the webhook works in production
      webhookUrl = "https://hooks.zapier.com/hooks/catch/14924349/3v7e2yl/";
      console.log('⚠️ USING FALLBACK WEBHOOK URL:', webhookUrl);
    } else {
      // Print the first 30 characters of the webhook URL (safe to show part of it)
      console.log('🔗 WEBHOOK URL FROM ENV:', webhookUrl.substring(0, 30) + '...');
    }

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

    // 3. Format the data with the exact field names requested for Zapier mapping
    const formattedData = {
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
      
      // Also include original fields for backward compatibility
      pickupLocation: data.pickupLocation || 'Not provided',
      dropoffLocation: data.dropoffLocation || 'Not provided',
      vehicleType: data.vehicleType || 'Not provided',
      shipmentDate: formattedShipmentDate, // Use formatted date here too
      enclosedTransportPrice: data.enclosedTransportPrice || 'Not provided',
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
    console.log(`🚀 SENDING WEBHOOK REQUEST TO: ${webhookUrl.substring(0, 30)}...`);
    
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
    
    if (!response.ok) {
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