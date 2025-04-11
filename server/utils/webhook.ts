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
    // 1. Validate webhook URL is available
    if (!process.env.WEBHOOK_URL) {
      console.error('🚨 WEBHOOK ERROR: No webhook URL provided in environment variables');
      return { success: false, message: 'No webhook URL provided' };
    }

    // Print the first 30 characters of the webhook URL (safe to show part of it)
    console.log('🔗 WEBHOOK URL CONFIGURED:', process.env.WEBHOOK_URL.substring(0, 30) + '...');

    // 2. Prepare the request data
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
        console.error('Error formatting date:', e);
        formattedShipmentDate = data.shipmentDate; // fallback to original
      }
    }

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

    // 5. Send the webhook request - using the direct URL from environment
    console.log(`🚀 SENDING WEBHOOK REQUEST TO: ${process.env.WEBHOOK_URL.substring(0, 30)}...`);
    const webhookUrl = process.env.WEBHOOK_URL;
    
    // Make the request with proper error handling
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Amerigo-Auto-Transport/1.0',
      },
      body: JSON.stringify(formattedData),
    });

    // 6. Process the response
    console.log(`📡 WEBHOOK RESPONSE STATUS: ${response.status} ${response.statusText}`);
    
    // Get the response text for better error reporting
    const responseText = await response.text();
    
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

    console.log('✅ WEBHOOK DELIVERED SUCCESSFULLY\n');
    return { success: true, message: 'Webhook sent successfully' };
  } catch (error) {
    console.error('❌ WEBHOOK ERROR:', error);
    return { 
      success: false, 
      message: `Error sending webhook: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}