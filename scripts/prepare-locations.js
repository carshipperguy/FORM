import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import AdmZip from 'adm-zip';

// Get the directory name using ES modules syntax
const __dirname = dirname(fileURLToPath(import.meta.url));

// Read and process the ZIP file
const zipPath = join(__dirname, '../attached_assets/simplemaps_uscities_basicv1.90.zip');
const zip = new AdmZip(zipPath);
const citiesEntry = zip.getEntries().find(entry => entry.entryName.endsWith('.csv'));
const citiesData = citiesEntry ? citiesEntry.getData().toString('utf8') : '';

// Also read the ZIP code database
const zipDbPath = join(__dirname, '../attached_assets/zip_code_database.csv');
const zipDbContent = readFileSync(zipDbPath, 'utf-8');

// Create combined location-data.ts content
const locationDataContent = `import { z } from "zod";

export interface LocationOption {
  value: string;
  label: string;
  zip: string;
  city: string;
  state: string;
}

// Process both ZIP codes and cities data
const locationOptions: LocationOption[] = [];

// Process ZIP database
const zipDbLines = \`${zipDbContent}\`.split('\\n').slice(1);
for (const line of zipDbLines) {
  if (!line.trim()) continue;

  const [zip, type, decommissioned, primary_city, acceptable_cities, , state] = line.split(',');

  if (!zip || !primary_city || !state) continue;
  if (decommissioned === '1' || (type !== 'STANDARD' && type !== 'UNIQUE')) continue;

  // Add the primary city
  locationOptions.push({
    value: \`\${primary_city}, \${state} \${zip}\`,
    label: \`\${primary_city}, \${state} \${zip}\`,
    zip,
    city: primary_city,
    state
  });

  // Add acceptable alternative cities
  if (acceptable_cities) {
    const altCities = acceptable_cities
      .split(',')
      .map(city => city.trim())
      .filter(Boolean);

    for (const altCity of altCities) {
      locationOptions.push({
        value: \`\${altCity}, \${state} \${zip}\`,
        label: \`\${altCity}, \${state} \${zip}\`,
        zip,
        city: altCity,
        state
      });
    }
  }
}

// Process cities data from simplemaps
const citiesLines = \`${citiesData}\`.split('\\n').slice(1);
for (const line of citiesLines) {
  if (!line.trim()) continue;

  const [city, state, , , , zip] = line.split(',');
  if (!city || !state || !zip) continue;

  locationOptions.push({
    value: \`\${city}, \${state} \${zip}\`,
    label: \`\${city}, \${state} \${zip}\`,
    zip,
    city,
    state
  });
}

// Remove duplicates based on the value field
const uniqueLocations = Array.from(new Map(
  locationOptions.map(item => [item.value, item])
).values());

export function searchLocations(query: string): LocationOption[] {
  const searchTerm = query.toLowerCase().trim();

  if (!searchTerm) return [];

  // First try exact ZIP code match
  if (/^\\d{5}$/.test(searchTerm)) {
    return uniqueLocations.filter(option => 
      option.zip === searchTerm
    ).slice(0, 10);
  }

  // Then try partial matches on city, state, or full address
  return uniqueLocations.filter(option => 
    option.city.toLowerCase().includes(searchTerm) ||
    option.state.toLowerCase() === searchTerm ||
    option.value.toLowerCase().includes(searchTerm)
  ).slice(0, 10);
}`;

// Write the generated file
const outputPath = join(__dirname, '../client/src/lib/location-data.ts');
writeFileSync(outputPath, locationDataContent);

console.log('Location data has been generated successfully');