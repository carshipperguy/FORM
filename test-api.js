const fetch = require('node-fetch');

async function testApi() {
  const origin = "New York, NY";
  const destination = "Los Angeles, CA";
  
  console.log(`Testing distance calculation between ${origin} and ${destination}...`);
  
  try {
    const response = await fetch(
      `http://localhost:5000/api/distance?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`
    );
    
    const data = await response.json();
    console.log("API Response:", data);
    
    if (data.distance) {
      console.log(`Distance: ${data.distance} miles`);
      console.log(`Time: ${data.time}`);
    } else {
      console.log("Error:", data.error);
    }
  } catch (error) {
    console.error("Request failed:", error);
  }
}

testApi();
