import { z } from "zod";

export interface LocationOption {
  value: string;
  label: string;
  city: string;
  state: string;
  zips: string[];
}

// Top cities for immediate selection (preloaded)
export const locationOptions: LocationOption[] = [
  {
    value: "New York, NY",
    label: "New York, NY",
    city: "New York",
    state: "NY",
    zips: ["10001", "10002", "10003"]
  },
  {
    value: "Los Angeles, CA",
    label: "Los Angeles, CA",
    city: "Los Angeles",
    state: "CA",
    zips: ["90001", "90002", "90003"]
  },
  {
    value: "Chicago, IL",
    label: "Chicago, IL",
    city: "Chicago",
    state: "IL",
    zips: ["60601", "60602", "60603"]
  },
  {
    value: "Houston, TX",
    label: "Houston, TX",
    city: "Houston",
    state: "TX",
    zips: ["77001", "77002", "77003"]
  },
  {
    value: "Phoenix, AZ",
    label: "Phoenix, AZ",
    city: "Phoenix",
    state: "AZ",
    zips: ["85001", "85002", "85003"]
  },
  {
    value: "Philadelphia, PA",
    label: "Philadelphia, PA",
    city: "Philadelphia",
    state: "PA",
    zips: ["19101", "19102", "19103"]
  },
  {
    value: "San Antonio, TX",
    label: "San Antonio, TX",
    city: "San Antonio",
    state: "TX",
    zips: ["78201", "78202", "78203"]
  },
  {
    value: "San Diego, CA",
    label: "San Diego, CA",
    city: "San Diego",
    state: "CA",
    zips: ["92101", "92102", "92103"]
  },
  {
    value: "Dallas, TX",
    label: "Dallas, TX", 
    city: "Dallas",
    state: "TX",
    zips: ["75201", "75202", "75203"]
  },
  {
    value: "San Jose, CA",
    label: "San Jose, CA",
    city: "San Jose",
    state: "CA",
    zips: ["95101", "95102", "95103"]
  },
  {
    value: "Austin, TX",
    label: "Austin, TX",
    city: "Austin",
    state: "TX",
    zips: ["78701", "78702", "78703"]
  },
  {
    value: "Jacksonville, FL",
    label: "Jacksonville, FL",
    city: "Jacksonville",
    state: "FL",
    zips: ["32201", "32202", "32203"]
  },
  {
    value: "Columbus, OH",
    label: "Columbus, OH",
    city: "Columbus",
    state: "OH",
    zips: ["43201", "43202", "43203"]
  },
  {
    value: "Miami, FL",
    label: "Miami, FL",
    city: "Miami",
    state: "FL",
    zips: ["33101", "33102", "33103"]
  },
  {
    value: "Seattle, WA",
    label: "Seattle, WA",
    city: "Seattle",
    state: "WA",
    zips: ["98101", "98102", "98103"]
  },
  {
    value: "Denver, CO",
    label: "Denver, CO",
    city: "Denver",
    state: "CO",
    zips: ["80201", "80202", "80203"]
  },
  {
    value: "Washington, DC",
    label: "Washington, DC",
    city: "Washington",
    state: "DC",
    zips: ["20001", "20002", "20003"]
  },
  {
    value: "Boston, MA",
    label: "Boston, MA",
    city: "Boston",
    state: "MA",
    zips: ["02108", "02109", "02110"]
  },
  {
    value: "Atlanta, GA",
    label: "Atlanta, GA",
    city: "Atlanta",
    state: "GA",
    zips: ["30301", "30302", "30303"]
  },
  {
    value: "Detroit, MI",
    label: "Detroit, MI",
    city: "Detroit",
    state: "MI",
    zips: ["48201", "48202", "48203"]
  }
];

// More extensive city data cache (indexed by city+state)
// This is populated as the user searches
const cityCache = new Map<string, LocationOption>();

// Parse a line from the CSV file
function parseCityLine(line: string): LocationOption | null {
  try {
    // Basic CSV parsing (not handling all edge cases, but should work for this data)
    const parts = line.split(',').map(part => part.replace(/^"|"$/g, ''));
    if (parts.length < 16) return null;
    
    const city = parts[0];
    const state = parts[2];
    const zipsStr = parts[15];
    const zips = zipsStr.split(' ').slice(0, 5); // Take first 5 ZIP codes to limit size
    
    return {
      value: `${city}, ${state}`,
      label: `${city}, ${state}`,
      city,
      state,
      zips,
    };
  } catch (e) {
    console.error("Failed to parse city data:", e);
    return null;
  }
}

// Function to search cities from our local list
export function searchCitiesByQuery(query: string): LocationOption[] {
  if (!query || query.length < 2) return [];

  const queryLower = query.toLowerCase();
  
  // Start with preloaded options for fast results
  const matches = locationOptions.filter(option => 
    option.city.toLowerCase().includes(queryLower) || 
    option.state.toLowerCase().includes(queryLower) ||
    option.value.toLowerCase().includes(queryLower)
  );

  return matches.slice(0, 10); // Limit to top 10 results for performance
}