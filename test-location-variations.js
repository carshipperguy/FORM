// Test if ZIP codes vs city names produce different distances
import fetch from 'node-fetch';

async function testLocationVariations() {
  const baseUrl = 'http://localhost:5000';
  
  console.log('🧪 TESTING DIFFERENT LOCATION FORMATS');
  console.log('=========================================\n');
  
  const testCases = [
    {
      name: 'WITH ZIP CODES (as submitted)',
      pickup: 'Conway, SC 29527',
      dropoff: 'Lawton, OK 73503'
    },
    {
      name: 'WITHOUT ZIP CODES (city/state only)',
      pickup: 'Conway, SC',
      dropoff: 'Lawton, OK'
    },
    {
      name: 'Just ZIP CODES',
      pickup: '29527',
      dropoff: '73503'
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`\nTest: ${testCase.name}`);
    console.log(`  Pickup: ${testCase.pickup}`);
    console.log(`  Dropoff: ${testCase.dropoff}`);
    
    try {
      const url = `${baseUrl}/api/distance?origin=${encodeURIComponent(testCase.pickup)}&destination=${encodeURIComponent(testCase.dropoff)}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.distance) {
        const price = Math.round(data.distance * 3.0);
        console.log(`  ✅ Distance: ${data.distance} miles`);
        console.log(`  ✅ Price at $3/mile: $${price}`);
      } else {
        console.log(`  ❌ Error: ${data.error || 'No distance returned'}`);
      }
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
  }
  
  console.log('\n=========================================');
}

testLocationVariations().catch(console.error);
