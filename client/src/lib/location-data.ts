import { z } from "zod";

export interface LocationOption {
  value: string;
  label: string;
  zip: string;
  city: string;
  state: string;
}

const locationSchema = z.object({
  zip: z.string(),
  primary_city: z.string(),
  state: z.string(),
  type: z.string(),
  acceptable_cities: z.string(),
  unacceptable_cities: z.string(),
});

// Import the full CSV data at build time
const csvData = `${ZIP_CODE_DATABASE}`;

export function parseLocationData(): LocationOption[] {
  const locations: LocationOption[] = [];

  // Split CSV into lines and skip header
  const lines = csvData.split('\n').slice(1);

  for (const line of lines) {
    // Skip empty lines
    if (!line.trim()) continue;

    const [zip, type, , primary_city, acceptable_cities, , state] = line.split(',');

    // Skip if any required field is missing
    if (!zip || !primary_city || !state) continue;

    // Skip decommissioned or non-standard ZIP codes
    if (type !== 'STANDARD' && type !== 'UNIQUE') continue;

    // Create the location option
    const option: LocationOption = {
      value: `${primary_city}, ${state} ${zip}`,
      label: `${primary_city}, ${state} ${zip}`,
      zip,
      city: primary_city,
      state
    };

    locations.push(option);

    // Add acceptable cities if they exist
    if (acceptable_cities) {
      const altCities = acceptable_cities.split(',').map(city => city.trim());
      for (const altCity of altCities) {
        if (altCity) {
          locations.push({
            value: `${altCity}, ${state} ${zip}`,
            label: `${altCity}, ${state} ${zip}`,
            zip,
            city: altCity,
            state
          });
        }
      }
    }
  }

  return locations;
}

export const locationOptions = parseLocationData();

// Search function that matches ZIP codes or city names
export function searchLocations(query: string): LocationOption[] {
  const searchTerm = query.toLowerCase();
  return locationOptions.filter(option => 
    option.zip.includes(searchTerm) ||
    option.city.toLowerCase().includes(searchTerm) ||
    option.state.toLowerCase().includes(searchTerm) ||
    option.value.toLowerCase().includes(searchTerm)
  ).slice(0, 100); // Limit results to prevent performance issues
}