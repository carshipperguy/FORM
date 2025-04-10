import { z } from "zod";
// Import all city data that we generated from the CSV
import allCitiesData from "./city-data.json";

export interface LocationOption {
  value: string;
  label: string;
  city: string;
  state: string;
  zips: string[];
  zip?: string;  // Add the single zip property
  population?: number;
}

// Import the full list of cities from the generated JSON
export const locationOptions: LocationOption[] = allCitiesData as LocationOption[];

// Function to search all cities by query
export function searchCitiesByQuery(query: string): LocationOption[] {
  if (!query || query.length < 2) return [];

  const queryLower = query.toLowerCase();
  
  // Search by city, state, or zip code
  const matches = locationOptions.filter(option => {
    // Match by city or state
    if (option.city.toLowerCase().includes(queryLower) || 
        option.state.toLowerCase().includes(queryLower) ||
        option.value.toLowerCase().includes(queryLower)) {
      return true;
    }
    
    // Match by zip
    if (option.zips && option.zips.some(zip => zip.includes(queryLower))) {
      return true;
    }
    
    return false;
  });

  // Limit to 50 results to prevent UI performance issues
  return matches.slice(0, 50);
}