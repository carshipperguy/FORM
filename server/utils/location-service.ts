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
const US_STATE_ABBREVS = new Set([
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC','PR','GU','VI','AS','MP'
]);

/**
 * Normalizes a user-typed query to handle "City STATE" without comma.
 * "Chicago IL" → "Chicago, IL"
 * "chicago il" → "chicago, il"
 * "Los Angeles CA" → "Los Angeles, CA"
 * Returns both the original and normalized form so both are tried.
 */
function buildQueryVariants(raw: string): string[] {
  const trimmed = raw.trim();
  const variants: string[] = [trimmed.toLowerCase()];

  // Match "City STATE" pattern: one or more words, optional whitespace, 2-letter state
  // Handles: "Chicago IL", "Chicago  IL", "Los Angeles CA"
  const cityStatePattern = /^(.+?)\s+([A-Za-z]{2})$/;
  const match = trimmed.match(cityStatePattern);
  if (match) {
    const possibleState = match[2].toUpperCase();
    if (US_STATE_ABBREVS.has(possibleState)) {
      const normalized = `${match[1].trim()}, ${possibleState}`.toLowerCase();
      if (!variants.includes(normalized)) {
        variants.push(normalized);
      }
    }
  }

  return variants;
}

export function searchLocations(query: string, limit: number = 200): LocationOption[] {
  if (!initialized) {
    console.warn('⚠️ Location service not initialized yet');
    return [];
  }
  
  if (!query) return [];
  
  const trimmed = query.trim();
  if (trimmed.length === 0) return [];

  const queryVariants = buildQueryVariants(trimmed);
  
  // Search by city, state, zip, or value — try all query variants
  const seen = new Set<string>();
  const matches: LocationOption[] = [];

  for (const queryLower of queryVariants) {
    for (const option of locationOptions) {
      if (seen.has(option.value)) continue;

      const cityLower = option.city.toLowerCase();
      const stateLower = option.state.toLowerCase();
      const valueLower = option.value.toLowerCase();

      if (
        cityLower.startsWith(queryLower) ||
        cityLower.includes(queryLower) ||
        stateLower.startsWith(queryLower) ||
        valueLower.includes(queryLower) ||
        (option.zips && option.zips.some(zip => zip.startsWith(queryLower))) ||
        (option.zips && option.zips.some(zip => zip.includes(queryLower)))
      ) {
        seen.add(option.value);
        matches.push(option);
        if (matches.length >= limit) break;
      }
    }
    if (matches.length >= limit) break;
  }

  // Return lightweight objects with just the needed fields
  return matches.slice(0, limit).map(option => ({
    value: option.value,
    city: option.city, 
    state: option.state,
    zips: option.zips.slice(0, 5)
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