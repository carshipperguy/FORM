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

    // Format the data in a way that's easier to read in most CRM systems
    const formattedData = {
      submissionId: `AUTO-${Date.now()}`,
      submissionDate: new Date().toISOString(),
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
        price: data.finalPrice || 'Not provided',
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
      rawData: data,
    };

    console.log('Sending webhook data to CRM:', JSON.stringify(formattedData, null, 2));

    const response = await fetch(process.env.WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formattedData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Webhook error: ${response.status} ${response.statusText}`, errorText);
      return { 
        success: false, 
        message: `Webhook error: ${response.status} ${response.statusText}` 
      };
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