// Test exact Lawton route that shows the pricing discrepancy
import fetch from 'node-fetch';

async function testLawtonRoute() {
  const baseUrl = 'http://localhost:5000';
  
  // EXACT route from the issue
  const pickupLocation = 'Conway, SC 29527';
  const dropoffLocation = 'Lawton, OK 73503';
  const vehicleType = '5th Wheel';
  
  console.log('🧪 TESTING LAWTON ROUTE - EXACT REPRODUCTION');
  console.log('==============================================\n');
  console.log('Route:', pickupLocation, '→', dropoffLocation);
  console.log('Vehicle Type:', vehicleType);
  console.log('\n==============================================\n');
  
  // Step 1: Call distance API exactly as the form does
  console.log('STEP 1: Distance API Call');
  const distanceUrl = `${baseUrl}/api/distance?origin=${encodeURIComponent(pickupLocation)}&destination=${encodeURIComponent(dropoffLocation)}`;
  console.log('URL:', distanceUrl);
  
  const distanceResponse = await fetch(distanceUrl);
  const distanceData = await distanceResponse.json();
  
  console.log('✅ Distance API Response:', JSON.stringify(distanceData, null, 2));
  console.log('   Distance:', distanceData.distance, 'miles');
  console.log('');
  
  // Step 2: Calculate RV pricing - $3.00/mile with $750 minimum
  const distance = distanceData.distance;
  const ratePerMile = 3.0;
  const minimumPrice = 750;
  
  const rawCalculation = distance * ratePerMile;
  const priceWithMinimum = Math.max(rawCalculation, minimumPrice);
  const openTransportPrice = Math.round(priceWithMinimum);
  const enclosedTransportPrice = Math.round(priceWithMinimum * 1.2);
  
  console.log('STEP 2: RV Pricing Calculation');
  console.log('   Distance:', distance, 'miles');
  console.log('   Rate: $' + ratePerMile + '/mile');
  console.log('   Raw calculation:', distance, '× $3.00 =', '$' + rawCalculation);
  console.log('   After $750 minimum:', '$' + priceWithMinimum);
  console.log('   Rounded open transport:', '$' + openTransportPrice);
  console.log('   Enclosed (×1.2):', '$' + enclosedTransportPrice);
  console.log('');
  
  console.log('==============================================');
  console.log('EXPECTED RESULTS:');
  console.log('   Customer sees on screen: $' + openTransportPrice);
  console.log('   Payload should send: $' + openTransportPrice);
  console.log('   Distance in payload:', distance, 'miles');
  console.log('');
  console.log('REPORTED ISSUE:');
  console.log('   Customer sees: ~$3,100');
  console.log('   Payload receives: ~$3,876');
  console.log('   Expected (our calc): $' + openTransportPrice);
  console.log('');
  
  // Calculate what distance would produce $3,876
  const reportedPayloadPrice = 3876;
  const impliedDistance = reportedPayloadPrice / ratePerMile;
  
  console.log('ANALYSIS:');
  console.log('   If payload shows $3,876:');
  console.log('   Implied distance = $3,876 ÷ $3.00 = ' + impliedDistance + ' miles');
  console.log('   Actual distance from API = ' + distance + ' miles');
  console.log('   Discrepancy = ' + Math.abs(impliedDistance - distance) + ' miles');
  console.log('==============================================');
}

testLawtonRoute().catch(console.error);
