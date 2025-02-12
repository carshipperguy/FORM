import { z } from "zod";

export interface LocationOption {
  value: string;
  label: string;
  zip: string;
  city: string;
  state: string;
}

// We'll process this raw CSV data at runtime
const csvData = `zip,type,decommissioned,primary_city,acceptable_cities,unacceptable_cities,state,county,timezone,area_codes,world_region,country,latitude,longitude,irs_estimated_population
00501,UNIQUE,0,Holtsville,,"Internal Revenue Service",NY,"Suffolk County",America/New_York,631,NA,US,40.81,-73.04,562
00544,UNIQUE,0,Holtsville,,"Internal Revenue Service",NY,"Suffolk County",America/New_York,631,NA,US,40.81,-73.04,0`;

export function parseLocationData(): LocationOption[] {
  const locations: LocationOption[] = [];

  // Split CSV into lines and skip header
  const lines = csvData.split('\n').slice(1);

  for (const line of lines) {
    if (!line.trim()) continue;

    const [zip, type, , primary_city, acceptable_cities, , state] = line.split(',');

    // Skip if any required field is missing
    if (!zip || !primary_city || !state) continue;

    // Skip non-standard ZIP codes
    if (type !== 'STANDARD' && type !== 'UNIQUE') continue;

    // Create the main location option
    const mainOption: LocationOption = {
      value: `${primary_city}, ${state} ${zip}`,
      label: `${primary_city}, ${state} ${zip}`,
      zip,
      city: primary_city,
      state
    };

    locations.push(mainOption);

    // Add acceptable alternative cities
    if (acceptable_cities) {
      const altCities = acceptable_cities
        .split(',')
        .map(city => city.trim())
        .filter(city => city);

      for (const altCity of altCities) {
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

  return locations;
}

const locationOptions = parseLocationData();

// Search function with improved matching
export function searchLocations(query: string): LocationOption[] {
  const searchTerm = query.toLowerCase().trim();

  // If empty query, return empty results
  if (!searchTerm) return [];

  // First try exact ZIP code match
  if (/^\d{5}$/.test(searchTerm)) {
    return locationOptions.filter(option => 
      option.zip === searchTerm
    ).slice(0, 10);
  }

  // Then try partial matches on city, state, or full address
  return locationOptions.filter(option => 
    option.city.toLowerCase().includes(searchTerm) ||
    option.state.toLowerCase() === searchTerm ||
    option.value.toLowerCase().includes(searchTerm)
  ).slice(0, 10);
}