import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to your CSV file - use the new city_zip_mapping.csv file
const csvFilePath = path.join(__dirname, '../uscities.csv');

// Path to output JSON file
const outputJsonPath = path.join(__dirname, '../client/src/lib/city-data.json');

// Function to parse a line of CSV data into a location object for the new format
function parseCityLine(line) {
  try {
    // Basic CSV parsing (not handling all edge cases)
    const parts = line.split(',').map(part => part.replace(/^"|"$/g, '').trim());
    if (parts.length < 4) return null;
    
    const city = parts[0];
    const stateId = parts[1]; 
    const stateName = parts[2];
    const zip = parts[3];
    
    return {
      value: `${city}, ${stateId} ${zip}`,
      label: `${city}, ${stateId}`,
      city,
      state: stateId,
      stateName,
      zips: [zip], // Put the single ZIP in an array to maintain compatibility
      zip // Add the individual ZIP code directly as well
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
    const cityZipMap = new Map(); // Track cities we've already processed
    
    for (const line of dataLines) {
      if (line.trim()) {
        const cityData = parseCityLine(line);
        if (cityData) {
          // Use a key that uniquely identifies this city+state+zip combination
          const key = `${cityData.city},${cityData.state},${cityData.zip}`;
          
          // Only add if we haven't seen this exact combination before
          if (!cityZipMap.has(key)) {
            cities.push(cityData);
            cityZipMap.set(key, true);
          }
        }
      }
    }
    
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