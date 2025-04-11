import fetch from 'node-fetch';

/**
 * Send data to a webhook URL
 * @param data The data to send to the webhook
 * @returns A promise that resolves when the webhook has been sent
 */
export async function sendToWebhook(data: any): Promise<{ success: boolean; message: string }> {
  try {
    if (!process.env.WEBHOOK_URL) {
      console.error('No webhook URL provided');
      return { success: false, message: 'No webhook URL provided' };
    }

    // Generate unique submission ID if not already present
    const submissionId = data.submissionId || `AUTO-${Date.now()}`;
    const submissionDate = data.submissionDate || new Date().toISOString();
    
    // Determine event type (default to "form_submission" if not specified)
    const eventType = data.eventType || "form_submission";
    
    // Format the data in a way that's optimized for Zapier and other webhook consumers
    const formattedData = {
      submissionId,
      submissionDate,
      eventType,
      
      // Primary contact information (high-level for easy access)
      name: data.name || 'Not provided',
      email: data.email || 'Not provided',
      phone: data.phone || 'Not provided',
      
      // Formatted data in nested structure (for organized CRM mapping)
      contactInfo: {
        name: data.name || 'Not provided',
        email: data.email || 'Not provided',
        phone: data.phone || 'Not provided',
      },
      vehicleDetails: {
        type: data.vehicleType || 'Not provided',
        year: data.year || 'Not provided',
        make: data.make || 'Not provided',
        model: data.model || 'Not provided',
      },
      routeDetails: {
        pickupLocation: data.pickupLocation || 'Not provided',
        pickupZip: data.pickupZip || 'Not provided',
        dropoffLocation: data.dropoffLocation || 'Not provided',
        dropoffZip: data.dropoffZip || 'Not provided',
        distance: data.distance || 0,
        transitTime: data.transitTime || 0,
      },
      transportDetails: {
        shipmentDate: data.shipmentDate || 'Not provided',
        transportType: data.selectedTransport || 'open',
        guaranteedDate: data.guaranteedDate || false,
        price: data.finalPrice || data.openTransportPrice || 'Not provided',
      },
      additionalDetails: {
        pickupContact: {
          name: data.pickupContactName || 'Not provided',
          phone: data.pickupContactPhone || 'Not provided',
          address: data.pickupStreetAddress || 'Not provided',
          city: data.pickupCity || 'Not provided',
          state: data.pickupState || 'Not provided',
          zip: data.pickupZip || 'Not provided',
        },
        deliveryContact: {
          name: data.deliveryContactName || 'Not provided',
          phone: data.deliveryContactPhone || 'Not provided',
          address: data.deliveryStreetAddress || 'Not provided',
          city: data.deliveryCity || 'Not provided',
          state: data.deliveryState || 'Not provided',
          zip: data.deliveryZip || 'Not provided',
        },
        notes: data.notes || '',
      },
      
      // Include the raw data for maximum compatibility
      // This ensures any field we didn't explicitly map is still available
      rawData: data,
    };

    console.log('Sending webhook data to CRM:', JSON.stringify(formattedData, null, 2));
    console.log('Using webhook URL:', process.env.WEBHOOK_URL.substring(0, 15) + '...');

    // Make sure to use correct fetch options for most webhook providers
    const response = await fetch(process.env.WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Amerigo-Auto-Transport/1.0',
      },
      body: JSON.stringify(formattedData),
    });

    // Log the response status and headers for debugging
    console.log(`Webhook response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      let errorText = '';
      try {
        errorText = await response.text();
      } catch (e) {
        errorText = 'Could not extract error text from response';
      }
      
      console.error(`Webhook error: ${response.status} ${response.statusText}`, errorText);
      return { 
        success: false, 
        message: `Webhook error: ${response.status} ${response.statusText}` 
      };
    }

    // Try to parse the response for more detailed logging
    try {
      const responseBody = await response.text();
      console.log('Webhook response body:', responseBody.substring(0, 200) + (responseBody.length > 200 ? '...' : ''));
    } catch (e) {
      console.log('Could not parse webhook response body');
    }

    console.log('Webhook sent successfully');
    return { success: true, message: 'Webhook sent successfully' };
  } catch (error) {
    console.error('Error sending webhook:', error);
    return { 
      success: false, 
      message: `Error sending webhook: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}