// Test script to validate MapQuest API connection
const apiKey = process.env.MAPQUEST_API_KEY;

async function testMapQuestAPI() {
  console.log("Testing MapQuest API connection...");
  
  if (!apiKey) {
    console.error("Error: MAPQUEST_API_KEY environment variable not found");
    return;
  } else {
    console.log("MAPQUEST_API_KEY is configured");
  }
  
  // Test origin and destination
  const origin = "Los Angeles, CA 90001";
  const destination = "San Francisco, CA 94101";
  
  console.log(`Testing route from "${origin}" to "${destination}"`);
  
  try {
    const url = `https://www.mapquestapi.com/directions/v2/route?key=${apiKey}&from=${encodeURIComponent(
      origin
    )}&to=${encodeURIComponent(destination)}&unit=M`;
    
    console.log("Making API request...");
    const response = await fetch(url);
    const data = await response.json();
    
    console.log("\nAPI Response Status:", response.status);
    
    if (response.status === 200 && data.route && data.route.distance) {
      console.log("\n✅ SUCCESS: MapQuest API is working correctly!");
      console.log("Route Distance:", Math.round(data.route.distance), "miles");
      console.log("Travel Time:", data.route.formattedTime);
      
      if (data.route.distance > 0) {
        console.log("\nThe distance calculation is producing valid results.");
      } else {
        console.log("\nWarning: Distance is zero or negative, which might indicate an issue.");
      }
    } else {
      console.log("\n❌ ERROR: MapQuest API request failed or returned invalid data");
      console.log("API Error Info:", data.info || "No error info available");
      
      if (data.info && data.info.messages) {
        console.log("API Error Messages:", data.info.messages);
      }
    }
  } catch (error) {
    console.error("\n❌ ERROR: Failed to connect to MapQuest API:", error.message);
  }
}

// Run the test
testMapQuestAPI();