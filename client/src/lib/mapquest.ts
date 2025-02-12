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
  const apiKey = process.env.MAPQUEST_API_KEY;
  const url = new URL(`${baseUrl}${endpoint}`);
  url.searchParams.append('key', apiKey!);
  
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.append(key, value.toString());
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error('MapQuest API request failed');
  }
  return response.json();
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

export async function calculateDistance(origin: Address, destination: Address) {
  const originStr = `${origin.street}, ${origin.city}, ${origin.state} ${origin.postalCode}`;
  const destinationStr = `${destination.street}, ${destination.city}, ${destination.state} ${destination.postalCode}`;

  try {
    const response = await makeMapQuestRequest('/directions/v2/route', {
      from: originStr,
      to: destinationStr,
      unit: 'M' // miles
    });

    if (response.route?.distance) {
      return {
        distance: Math.round(response.route.distance),
        time: response.route.formattedTime,
        success: true
      };
    }

    return {
      success: false,
      error: 'Could not calculate distance'
    };
  } catch (error) {
    console.error('Distance calculation error:', error);
    return {
      success: false,
      error: 'Failed to calculate distance'
    };
  }
}
