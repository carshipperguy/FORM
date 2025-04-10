import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to your CSV file
const csvFilePath = path.join(__dirname, '../uscities[1].csv');

// Path to output JSON file
const outputJsonPath = path.join(__dirname, '../client/src/lib/city-data.json');

// Function to parse a line of CSV data into a location object
function parseCityLine(line) {
  try {
    // Basic CSV parsing (not handling all edge cases)
    const parts = line.split(',').map(part => part.replace(/^"|"$/g, ''));
    if (parts.length < 16) return null;
    
    const city = parts[0];
    const state = parts[2];
    const zipsStr = parts[15];
    const zips = zipsStr.split(' ').slice(0, 5); // Take only first 5 ZIP codes to limit size
    const population = parseInt(parts[8], 10) || 0;
    
    return {
      value: `${city}, ${state}`,
      label: `${city}, ${state}`,
      city,
      state,
      zips,
      population
    };
  } catch (e) {
    console.error("Failed to parse city data:", e);
    return null;
  }
}

// Main function to load and process CSV data
async function loadCityData() {
  console.log('Loading city data from CSV...');
  
  try {
    // Read the CSV file
    const csvContent = fs.readFileSync(csvFilePath, 'utf8');
    const lines = csvContent.split('\n');
    
    // Skip header line
    const dataLines = lines.slice(1);
    
    // Process each line
    const cities = [];
    for (const line of dataLines) {
      if (line.trim()) {
        const cityData = parseCityLine(line);
        if (cityData) {
          cities.push(cityData);
        }
      }
    }
    
    // Include ALL cities - no filtering or limiting
    
    // Create directory if it doesn't exist
    const outputDir = path.dirname(outputJsonPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Write to JSON file
    fs.writeFileSync(outputJsonPath, JSON.stringify(cities, null, 2));
    
    console.log(`Successfully processed ${cities.length} cities and wrote to ${outputJsonPath}`);
  } catch (error) {
    console.error('Error processing city data:', error);
  }
}

// Run the function
loadCityData();