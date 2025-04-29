import { z } from "zod";

const addressSchema = z.object({
  street: z.string(),
  city: z.string(),
  state: z.string(),
  postalCode: z.string()
});

export type Address = z.infer<typeof addressSchema>;

async function makeMapQuestRequest(endpoint: string, params: Record<string, any>) {
  const baseUrl = 'http://www.mapquestapi.com';
  const apiKey = 'YDMaftbjplfYTcQ129jOTQEkt37kNXy9';

  if (!apiKey) {
    throw new Error('Distance calculation is currently unavailable. Please try again later.');
  }

  const url = new URL(`${baseUrl}${endpoint}`);
  url.searchParams.append('key', apiKey);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.append(key, value.toString());
  }

  try {
    const response = await fetch(url.toString(), {
      credentials: "include"
    });

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
    return { isValid: false, error: 'Failed to validate address' };
  }
}

// Define return types for the calculateDistance function
type SuccessDistanceResult = {
  success: true;
  distance: number;
  time: string;
};

type ErrorDistanceResult = {
  success: false;
  error: string;
};

type DistanceResult = SuccessDistanceResult | ErrorDistanceResult;

export async function calculateDistance(origin: string, destination: string): Promise<DistanceResult> {
  if (!origin || !destination) {
    return {
      success: false,
      error: 'Please enter both pickup and delivery locations'
    };
  }

  try {
    // Clean the location formats for better compatibility
    let cleanOrigin = origin.trim();
    let cleanDestination = destination.trim();
    
    // Extract basic City, State format using regex
    const cityStateRegex = /([^,]+,\s*[A-Z]{2})/i;
    const originMatch = cleanOrigin.match(cityStateRegex);
    const destMatch = cleanDestination.match(cityStateRegex);
    
    if (originMatch && originMatch[1]) {
      cleanOrigin = originMatch[1].trim();
    }
    
    if (destMatch && destMatch[1]) {
      cleanDestination = destMatch[1].trim();
    }
    
    // First try the server endpoint with cleaned locations
    try {
      const serverUrl = `/api/distance?origin=${encodeURIComponent(cleanOrigin)}&destination=${encodeURIComponent(cleanDestination)}`;
      
      const response = await fetch(serverUrl, {
        credentials: "include"
      });
      
      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }
      
      const serverData = await response.json();
      
      if (serverData.distance) {
        return {
          success: true,
          distance: Math.round(serverData.distance),
          time: serverData.time || "Unknown"
        };
      } else if (serverData.error) {
        throw new Error(serverData.error);
      }
    } catch (serverError) {
      // Server-side calculation failed, fallback to client-side
    }
    
    // If server fails, try client-side as fallback with the simplified locations
    const data = await makeMapQuestRequest('/directions/v2/route', {
      from: cleanOrigin,
      to: cleanDestination,
      unit: 'm'
    });

    if (data.info?.statuscode === 402) {
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

    // If we get here, no valid distance could be calculated
    return {
      success: false,
      error: 'Could not calculate distance between these locations. Please check your entries.'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to calculate distance'
    };
  }
}