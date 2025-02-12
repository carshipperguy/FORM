import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get the directory name using ES modules syntax
const __dirname = dirname(fileURLToPath(import.meta.url));

// Read the cities CSV file directly
const citiesPath = join(__dirname, '../uscities[1].csv');
const citiesContent = readFileSync(citiesPath, 'utf-8');

// Create combined location-data.ts content
const locationDataContent = `import { z } from "zod";

export interface LocationOption {
  value: string;
  label: string;
  zip: string;
  city: string;
  state: string;
}

// Process cities data
export const locationOptions: LocationOption[] = [];

// Process cities data from CSV
const citiesData = ${JSON.stringify(citiesContent)};
const citiesLines = citiesData.split('\\n').slice(1);

for (const line of citiesLines) {
  if (!line.trim()) continue;

  try {
    // Parse CSV line while handling quoted values
    const parts = line.split(',').map(part => part.replace(/^"|"$/g, '').trim());
    const [city, cityAscii, stateId, stateName, , , , , population, , , , , , , zips] = parts;

    if (!city || !stateId || !zips) continue;

    // Only include cities with valid population data
    const pop = parseInt(population);
    if (isNaN(pop) || pop <= 0) continue;

    // Handle multiple ZIP codes
    const zipList = zips.split(' ').filter(Boolean);
    for (const zip of zipList) {
      locationOptions.push({
        value: \`\${city}, \${stateId} \${zip}\`,
        label: \`\${city}, \${stateId} \${zip}\`,
        zip,
        city,
        state: stateId
      });
    }
  } catch (error) {
    console.error('Error processing line:', line);
    continue;
  }
}

// Remove duplicates based on the value field
const uniqueLocations = Array.from(new Map(
  locationOptions.map(item => [item.value, item])
).values());

export function searchLocations(query: string): LocationOption[] {
  const searchTerm = query.toLowerCase().trim();

  if (!searchTerm || searchTerm.length < 2) return [];

  // First try exact ZIP code match
  if (/^\\d{5}$/.test(searchTerm)) {
    return uniqueLocations.filter(option => 
      option.zip === searchTerm
    ).slice(0, 10);
  }

  // Then try partial matches on city or state
  return uniqueLocations.filter(option => 
    option.city.toLowerCase().includes(searchTerm) ||
    option.state.toLowerCase() === searchTerm ||
    option.value.toLowerCase().includes(searchTerm)
  ).slice(0, 10);
}
`;

// Write the generated file
const outputPath = join(__dirname, '../client/src/lib/location-data.ts');
writeFileSync(outputPath, locationDataContent);

console.log('Location data has been generated successfully');