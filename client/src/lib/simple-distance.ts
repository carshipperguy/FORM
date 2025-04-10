/**
 * A simple distance calculator that uses hardcoded distances between major US cities
 * This is used when MapQuest API fails to provide results
 */

// Major US cities and their approximate coordinates
const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  // Northeast
  "New York, NY": { lat: 40.7128, lng: -74.0060 },
  "Boston, MA": { lat: 42.3601, lng: -71.0589 },
  "Philadelphia, PA": { lat: 39.9526, lng: -75.1652 },
  "Washington, DC": { lat: 38.9072, lng: -77.0369 },
  
  // Midwest
  "Chicago, IL": { lat: 41.8781, lng: -87.6298 },
  "Detroit, MI": { lat: 42.3314, lng: -83.0458 },
  "Cleveland, OH": { lat: 41.4993, lng: -81.6944 },
  "Minneapolis, MN": { lat: 44.9778, lng: -93.2650 },
  
  // South
  "Atlanta, GA": { lat: 33.7490, lng: -84.3880 },
  "Miami, FL": { lat: 25.7617, lng: -80.1918 },
  "Dallas, TX": { lat: 32.7767, lng: -96.7970 },
  "Houston, TX": { lat: 29.7604, lng: -95.3698 },
  "Nashville, TN": { lat: 36.1627, lng: -86.7816 },
  "New Orleans, LA": { lat: 29.9511, lng: -90.0715 },
  
  // West
  "Los Angeles, CA": { lat: 34.0522, lng: -118.2437 },
  "San Francisco, CA": { lat: 37.7749, lng: -122.4194 },
  "Seattle, WA": { lat: 47.6062, lng: -122.3321 },
  "Denver, CO": { lat: 39.7392, lng: -104.9903 },
  "Phoenix, AZ": { lat: 33.4484, lng: -112.0740 },
  "Las Vegas, NV": { lat: 36.1699, lng: -115.1398 },
  
  // Additional major cities
  "Portland, OR": { lat: 45.5051, lng: -122.6750 },
  "San Diego, CA": { lat: 32.7157, lng: -117.1611 },
  "Salt Lake City, UT": { lat: 40.7608, lng: -111.8910 },
  "Kansas City, MO": { lat: 39.0997, lng: -94.5786 },
  "St. Louis, MO": { lat: 38.6270, lng: -90.1994 },
  "Charlotte, NC": { lat: 35.2271, lng: -80.8431 },
  "Orlando, FL": { lat: 28.5383, lng: -81.3792 },
  "Austin, TX": { lat: 30.2672, lng: -97.7431 },
  "San Antonio, TX": { lat: 29.4241, lng: -98.4936 },
  "Indianapolis, IN": { lat: 39.7684, lng: -86.1581 },
  "Columbus, OH": { lat: 39.9612, lng: -82.9988 },
  "Jacksonville, FL": { lat: 30.3322, lng: -81.6557 },
  "San Jose, CA": { lat: 37.3382, lng: -121.8863 },
  "Albuquerque, NM": { lat: 35.0844, lng: -106.6504 },
  "Buffalo, NY": { lat: 42.8864, lng: -78.8784 },
  "Pittsburgh, PA": { lat: 40.4406, lng: -79.9959 },
  "Omaha, NE": { lat: 41.2565, lng: -95.9345 },
  "Memphis, TN": { lat: 35.1495, lng: -90.0490 },
  "Milwaukee, WI": { lat: 43.0389, lng: -87.9065 },
  "Oklahoma City, OK": { lat: 35.4676, lng: -97.5164 },
  "Louisville, KY": { lat: 38.2527, lng: -85.7585 },
  "Tucson, AZ": { lat: 32.2226, lng: -110.9747 },
  "Fresno, CA": { lat: 36.7468, lng: -119.7726 },
  "Sacramento, CA": { lat: 38.5816, lng: -121.4944 },
  "Mesa, AZ": { lat: 33.4152, lng: -111.8315 },
  "Colorado Springs, CO": { lat: 38.8339, lng: -104.8214 },
  "Raleigh, NC": { lat: 35.7796, lng: -78.6382 },
  "Tulsa, OK": { lat: 36.1540, lng: -95.9928 },
  "Tampa, FL": { lat: 27.9506, lng: -82.4572 },
  "Baltimore, MD": { lat: 39.2904, lng: -76.6122 },
  "Cincinnati, OH": { lat: 39.1031, lng: -84.5120 },
  "Honolulu, HI": { lat: 21.3069, lng: -157.8583 },
  "Anchorage, AK": { lat: 61.2181, lng: -149.9003 },
};

/**
 * Calculate the distance between two points on Earth using the Haversine formula
 * 
 * @param lat1 Latitude of point 1
 * @param lng1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lng2 Longitude of point 2
 * @returns Distance in miles
 */
function calculateHaversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  // Earth's radius in miles
  const earthRadius = 3958.8;
  
  // Convert degrees to radians
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const radLat1 = lat1 * Math.PI / 180;
  const radLat2 = lat2 * Math.PI / 180;
  
  // Haversine formula
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLng/2) * Math.sin(dLng/2) * 
            Math.cos(radLat1) * Math.cos(radLat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  // Distance in miles
  return earthRadius * c;
}

/**
 * Find the closest major city to a given location string
 * 
 * @param location Location string (e.g., "New York, NY" or "Los Angeles, CA 90001")
 * @returns The closest major city name, or null if no match found
 */
function findClosestMajorCity(location: string): string | null {
  if (!location) return null;
  
  // Normalize the location string
  const normalizedLocation = location.toLowerCase();
  
  // First try direct matching (case-insensitive)
  for (const city of Object.keys(CITY_COORDINATES)) {
    if (normalizedLocation.includes(city.toLowerCase())) {
      return city;
    }
  }
  
  // Extract state code using regex (e.g., "NY" from "New York, NY")
  const stateMatch = normalizedLocation.match(/,\s*([a-z]{2})\b/i);
  if (!stateMatch) return null;
  
  const stateCode = stateMatch[1].toUpperCase();
  
  // Find cities in the specified state
  const citiesInState = Object.keys(CITY_COORDINATES).filter(city => 
    city.endsWith(`, ${stateCode}`)
  );
  
  if (citiesInState.length > 0) {
    // Return the first city in the state as a proxy
    return citiesInState[0];
  }
  
  // If we can't find a city in the state, return a default major city
  const defaultMajorCities: Record<string, string> = {
    "NY": "New York, NY",
    "CA": "Los Angeles, CA",
    "IL": "Chicago, IL",
    "TX": "Houston, TX",
    "AZ": "Phoenix, AZ",
    "PA": "Philadelphia, PA",
    "FL": "Miami, FL",
    "OH": "Columbus, OH",
    "MI": "Detroit, MI",
    "GA": "Atlanta, GA",
    // Add more states as needed
  };
  
  return defaultMajorCities[stateCode] || null;
}

/**
 * Calculate distance between two locations using available coordinates
 * 
 * @param origin Origin location string 
 * @param destination Destination location string
 * @returns Distance in miles or null if calculation fails
 */
export function calculateSimpleDistance(origin: string, destination: string): number | null {
  console.log("Simple distance calculator called with:", { origin, destination });
  
  // Find the closest major cities
  const originCity = findClosestMajorCity(origin);
  const destCity = findClosestMajorCity(destination);
  
  console.log("Matched to major cities:", { originCity, destCity });
  
  // If we can find coordinates for both cities, calculate the distance
  if (originCity && destCity && CITY_COORDINATES[originCity] && CITY_COORDINATES[destCity]) {
    const origCoords = CITY_COORDINATES[originCity];
    const destCoords = CITY_COORDINATES[destCity];
    
    const distance = calculateHaversineDistance(
      origCoords.lat, 
      origCoords.lng, 
      destCoords.lat, 
      destCoords.lng
    );
    
    // Round to whole number
    const roundedDistance = Math.round(distance);
    console.log("Calculated simple distance:", roundedDistance);
    
    return roundedDistance;
  }
  
  console.log("Simple distance calculation failed - couldn't match locations to major cities");
  return null;
}