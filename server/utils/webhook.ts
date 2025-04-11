import fetch from 'node-fetch';

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
    
    // 3. Format the data in a way that's optimized for webhook consumers
    const formattedData = {
      submissionId,
      submissionDate,
      eventType,
      
      // Essential contact and quote information  
      name: data.name || 'Not provided',
      email: data.email || 'Not provided',
      phone: data.phone || 'Not provided',
      
      // Vehicle information
      vehicleInfo: {
        type: data.vehicleType || 'Not provided',
        year: data.year || 'Not provided',
        make: data.make || 'Not provided',
        model: data.model || 'Not provided',
      },
      
      // Route information
      routeInfo: {
        pickupLocation: data.pickupLocation || 'Not provided',
        pickupZip: data.pickupZip || 'Not provided',
        dropoffLocation: data.dropoffLocation || 'Not provided',
        dropoffZip: data.dropoffZip || 'Not provided',
        distance: data.distance || 0,
        transitTime: data.transitTime || 0,
      },
      
      // Shipping preferences
      shippingInfo: {
        shipmentDate: data.shipmentDate || 'Not provided',
        openTransportPrice: data.openTransportPrice || 'Not provided',
        enclosedTransportPrice: data.enclosedTransportPrice || 'Not provided',
      },
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