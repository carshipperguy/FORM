/**
 * Location Service Module
 * 
 * This module provides optimized access to location data for the server API.
 * It loads the location data once at startup rather than per-request
 * to optimize memory usage and response time.
 */
import fs from 'fs';
import path from 'path';

export interface LocationOption {
  value: string;
  label?: string;
  city: string;
  state: string;
  zips: string[];
  zip?: string;
  population?: number;
}

let locationOptions: LocationOption[] = [];
let popularCities: LocationOption[] = [];
let initialized = false;

/**
 * Initialize the location service by loading data from the JSON file
 * This is called once at server startup
 */
export function initLocationService(): void {
  if (initialized) return;
  
  try {
    // Load the city data from the JSON file
    const dataPath = path.join(process.cwd(), 'client/src/lib/city-data.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const allCitiesData = JSON.parse(rawData) as LocationOption[];
    
    // Store the data in memory
    locationOptions = allCitiesData;
    
    // Generate a list of popular cities (highest population)
    popularCities = [...locationOptions]
      .sort((a, b) => (b.population || 0) - (a.population || 0))
      .slice(0, 200)
      .map(city => ({
        value: city.value,
        city: city.city,
        state: city.state,
        zips: city.zips.slice(0, 5), // Limit ZIP list for reduced payload size
        population: city.population
      }));
    
    initialized = true;
    console.log(`✅ Location service initialized with ${locationOptions.length} locations and ${popularCities.length} popular cities`);
  } catch (error) {
    console.error('❌ Failed to initialize location service:', error);
  }
}

/**
 * Search for locations by query string
 */
export function searchLocations(query: string, limit: number = 200): LocationOption[] {
  if (!initialized) {
    console.warn('⚠️ Location service not initialized yet');
    return [];
  }
  
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

  // Return lightweight objects with just the needed fields
  return matches.slice(0, limit).map(option => ({
    value: option.value,
    city: option.city, 
    state: option.state,
    zips: option.zips.slice(0, 5) // Limit ZIP list for reduced payload size
  }));
}

/**
 * Get a list of popular (high-population) locations
 */
export function getPopularLocations(limit: number = 200): LocationOption[] {
  if (!initialized) {
    console.warn('⚠️ Location service not initialized yet');
    return [];
  }
  
  return popularCities.slice(0, limit);
}