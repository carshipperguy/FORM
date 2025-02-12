import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get the directory name using ES modules syntax
const __dirname = dirname(fileURLToPath(import.meta.url));

// Read the CSV file
const csvPath = join(__dirname, '../attached_assets/zip_code_database.csv');
const csvContent = readFileSync(csvPath, 'utf-8');

// Create the location-data.ts content
const locationDataContent = `import { z } from "zod";

export interface LocationOption {
  value: string;
  label: string;
  zip: string;
  city: string;
  state: string;
}

// Full CSV data
const csvData = \`${csvContent}\`;

export function parseLocationData(): LocationOption[] {
  const locations: LocationOption[] = [];
  const lines = csvData.split('\\n').slice(1);

  for (const line of lines) {
    if (!line.trim()) continue;

    const [zip, type, decommissioned, primary_city, acceptable_cities, , state] = line.split(',');

    if (!zip || !primary_city || !state) continue;
    if (decommissioned === '1' || (type !== 'STANDARD' && type !== 'UNIQUE')) continue;

    locations.push({
      value: \`\${primary_city}, \${state} \${zip}\`,
      label: \`\${primary_city}, \${state} \${zip}\`,
      zip,
      city: primary_city,
      state
    });

    if (acceptable_cities) {
      const altCities = acceptable_cities
        .split(',')
        .map(city => city.trim())
        .filter(Boolean);

      for (const altCity of altCities) {
        locations.push({
          value: \`\${altCity}, \${state} \${zip}\`,
          label: \`\${altCity}, \${state} \${zip}\`,
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

export function searchLocations(query: string): LocationOption[] {
  const searchTerm = query.toLowerCase().trim();

  if (!searchTerm) return [];

  // First try exact ZIP code match
  if (/^\\d{5}$/.test(searchTerm)) {
    return locationOptions.filter(option => option.zip === searchTerm).slice(0, 10);
  }

  // Then try partial matches on city, state, or full address
  return locationOptions.filter(option => 
    option.city.toLowerCase().includes(searchTerm) ||
    option.state.toLowerCase() === searchTerm ||
    option.value.toLowerCase().includes(searchTerm)
  ).slice(0, 10);
}`;

// Write the generated file
const outputPath = join(__dirname, '../client/src/lib/location-data.ts');
writeFileSync(outputPath, locationDataContent);

console.log('Location data has been generated successfully');