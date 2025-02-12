const fs = require('fs');
const path = require('path');

// Read the ZIP code database
const csvPath = path.join(__dirname, '../attached_assets/zip_code_database.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Read the location-data.ts template
const locationDataPath = path.join(__dirname, '../client/src/lib/location-data.ts');
const locationData = fs.readFileSync(locationDataPath, 'utf-8');

// Replace the placeholder with actual CSV data
const updatedLocationData = locationData.replace('`${ZIP_CODE_DATABASE}`', `\`${csvContent}\``);

// Write back the updated file
fs.writeFileSync(locationDataPath, updatedLocationData);

console.log('Location data has been prepared successfully');
