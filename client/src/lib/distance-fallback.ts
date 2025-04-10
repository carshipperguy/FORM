/**
 * Fallback distance calculation using fixed distances between major cities
 * This provides a backup when the MapQuest API doesn't return expected results
 */

interface DistanceData {
  [city: string]: {
    [city: string]: number;
  };
}

// Simplified distance chart between major US cities (distances in miles)
const DISTANCE_CHART: DistanceData = {
  // New York
  "New York": {
    "Los Angeles": 2790,
    "Chicago": 790,
    "Houston": 1630,
    "Phoenix": 2410,
    "Philadelphia": 100,
    "San Antonio": 1810,
    "San Diego": 2800,
    "Dallas": 1550,
    "San Jose": 2970,
    "Austin": 1730,
    "Jacksonville": 950,
    "San Francisco": 2930,
    "Columbus": 550,
    "Indianapolis": 700,
    "Seattle": 2850,
    "Denver": 1780
  },
  // Los Angeles
  "Los Angeles": {
    "New York": 2790,
    "Chicago": 2020,
    "Houston": 1540,
    "Phoenix": 380,
    "Philadelphia": 2720,
    "San Antonio": 1350,
    "San Diego": 120,
    "Dallas": 1450,
    "San Jose": 340,
    "Austin": 1400,
    "Jacksonville": 2400,
    "San Francisco": 380,
    "Columbus": 2280,
    "Indianapolis": 2080,
    "Seattle": 1140,
    "Denver": 1020
  },
  // Chicago
  "Chicago": {
    "New York": 790,
    "Los Angeles": 2020,
    "Houston": 1080,
    "Phoenix": 1750,
    "Philadelphia": 740,
    "San Antonio": 1210,
    "San Diego": 2070,
    "Dallas": 920,
    "San Jose": 2120,
    "Austin": 1150,
    "Jacksonville": 1070,
    "San Francisco": 2130,
    "Columbus": 350,
    "Indianapolis": 180,
    "Seattle": 2050,
    "Denver": 1000
  },
  // More cities can be added as needed
};

/**
 * Tries to find approximate distance between two cities based on major city proximity
 * 
 * @param origin Origin location string
 * @param destination Destination location string
 * @returns Distance in miles or null if not found
 */
export function getFallbackDistance(origin: string, destination: string): number | null {
  // Extract city names from location strings
  const originCity = extractCityName(origin);
  const destCity = extractCityName(destination);
  
  console.log("Fallback looking for cities:", { originCity, destCity });
  
  // Try to find direct distance between cities
  if (originCity && destCity) {
    // Check if we have direct distance data
    if (DISTANCE_CHART[originCity] && DISTANCE_CHART[originCity][destCity]) {
      return DISTANCE_CHART[originCity][destCity];
    }
    
    // Check reverse direction
    if (DISTANCE_CHART[destCity] && DISTANCE_CHART[destCity][originCity]) {
      return DISTANCE_CHART[destCity][originCity];
    }
  }
  
  // If we can't find a direct match, try to estimate from closest major cities
  // For now, return null and let the API method be the source of truth
  return null;
}

/**
 * Extract a major city name from a location string
 */
function extractCityName(location: string): string | null {
  if (!location) return null;
  
  // Clean the location string
  const cleanLocation = location.toLowerCase();
  
  // First, try to extract city name based on common patterns
  // Pattern: "City, STATE ZIP" or "City, STATE"
  const cityMatch = cleanLocation.match(/([a-z\s]+),\s*[a-z]{2}/i);
  if (cityMatch && cityMatch[1]) {
    const cityPart = cityMatch[1].trim();
    
    // Check if this city is in our distance chart
    for (const city of Object.keys(DISTANCE_CHART)) {
      if (city.toLowerCase() === cityPart) {
        return city;
      }
    }
  }
  
  // Fallback: Check if any major city name appears in the string
  for (const city of Object.keys(DISTANCE_CHART)) {
    if (cleanLocation.includes(city.toLowerCase())) {
      return city;
    }
  }
  
  // Additional state-specific major cities
  const stateCapitals: Record<string, string> = {
    'ny': 'New York',
    'ca': 'Los Angeles',
    'il': 'Chicago',
    'tx': 'Houston',
    'az': 'Phoenix',
    'pa': 'Philadelphia',
    'wa': 'Seattle',
    'co': 'Denver',
  };
  
  // Check for state abbreviations in the location
  const stateMatch = cleanLocation.match(/,\s*([a-z]{2})/i);
  if (stateMatch && stateMatch[1]) {
    const stateAbbr = stateMatch[1].toLowerCase();
    if (stateCapitals[stateAbbr]) {
      console.log(`Approximating distance using ${stateCapitals[stateAbbr]} for state ${stateAbbr}`);
      return stateCapitals[stateAbbr];
    }
  }
  
  return null;
}