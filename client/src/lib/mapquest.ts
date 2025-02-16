import { z } from "zod";

const addressSchema = z.object({
  street: z.string(),
  city: z.string(),
  state: z.string(),
  postalCode: z.string()
});

export type Address = z.infer<typeof addressSchema>;

async function makeMapQuestRequest(endpoint: string, params: Record<string, any>) {
  const baseUrl = 'https://www.mapquestapi.com';
  const apiKey = import.meta.env.VITE_MAPQUEST_API_KEY;

  if (!apiKey) {
    console.error('MapQuest API key is missing');
    throw new Error('Distance calculation is currently unavailable. Please try again later.');
  }

  const url = new URL(`${baseUrl}${endpoint}`);
  url.searchParams.append('key', apiKey);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.append(key, value.toString());
  }

  try {
    console.log('Making MapQuest request:', url.toString());
    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Distance calculation failed: ${response.statusText}`);
    }

    const data = await response.json();

    // Check for MapQuest API-specific error responses
    if (data.info?.messages?.length > 0) {
      throw new Error(data.info.messages.join(', '));
    }

    return data;
  } catch (error) {
    console.error('MapQuest API error:', error);
    throw error;
  }
}

export async function validateAddress(address: Address) {
  const formattedAddress = `${address.street}, ${address.city}, ${address.state} ${address.postalCode}`;

  try {
    const response = await makeMapQuestRequest('/geocoding/v1/address', {
      location: formattedAddress,
      maxResults: 1,
    });

    const location = response.results?.[0]?.locations?.[0];
    if (!location) {
      return { isValid: false, error: 'Address not found' };
    }

    return {
      isValid: true,
      formattedAddress: `${location.street}, ${location.adminArea5}, ${location.adminArea3} ${location.postalCode}`,
      coordinates: {
        lat: location.latLng.lat,
        lng: location.latLng.lng
      }
    };
  } catch (error) {
    console.error('Address validation error:', error);
    return { isValid: false, error: 'Failed to validate address' };
  }
}

export async function calculateDistance(origin: string, destination: string) {
  if (!origin || !destination) {
    console.error('Missing origin or destination:', { origin, destination });
    return {
      success: false,
      error: 'Please enter both pickup and delivery locations'
    };
  }

  try {
    const data = await makeMapQuestRequest('/directions/v2/route', {
      from: origin,
      to: destination,
      unit: 'M'
    });

    if (data.info?.statuscode === 402) {
      console.error('Invalid locations provided:', { origin, destination });
      return {
        success: false,
        error: 'Please check your location entries and try again'
      };
    }

    if (data.route?.distance) {
      return {
        success: true,
        distance: Math.round(data.route.distance),
        time: data.route.formattedTime
      };
    }

    return {
      success: false,
      error: 'Could not calculate distance between these locations'
    };
  } catch (error) {
    console.error('Distance calculation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to calculate distance'
    };
  }
}