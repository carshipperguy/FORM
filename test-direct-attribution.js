/**
 * Direct test of attribution webhook endpoint
 * This bypasses the normal form flow and directly tests the CRM endpoint
 */

import fetch from 'node-fetch';

async function testAttributionEndpointDirect() {
  console.log('🧪 DIRECT TEST: Testing attribution webhook with direct connection to CRM endpoint');
  
  // Create a test payload with all required fields
  const testPayload = {
    email: 'direct-test@example.com',
    phone: '555-123-4567',
    utm_source: 'direct-test',
    utm_medium: 'api-test',
    utm_campaign: 'webhook-diagnostics',
    utm_content: 'javascript-fetch-direct',
    utm_term: 'attribution-debug',
    fbclid: 'direct-test-fbclid',
    referrer: 'direct-test-referrer'
  };
  
  // Log what we're about to do
  console.log(`🔄 Sending direct test to: https://amerigoautotransport.replit.app/api/crm/track-lead-source`);
  console.log(`📦 Payload: ${JSON.stringify(testPayload)}`);
  
  try {
    // First attempt - using node-fetch
    console.log('🚀 ATTEMPT #1: Using node-fetch');
    const fetchResponse = await fetch('https://amerigoautotransport.replit.app/api/crm/track-lead-source', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Amerigo-Attribution-Test/1.0',
        'X-Test-Method': 'node-fetch-direct'
      },
      body: JSON.stringify(testPayload)
    });
    
    const fetchResponseText = await fetchResponse.text();
    console.log(`✅ node-fetch RESPONSE: Status ${fetchResponse.status}, Body: ${fetchResponseText}`);
    
  } catch (fetchError) {
    console.error(`❌ node-fetch ERROR: ${fetchError.message}`);
    
    // Second attempt - using https module
    console.log('\n🚀 ATTEMPT #2: Using Node.js https module');
    
    try {
      const https = require('https');
      
      const requestOptions = {
        hostname: 'amerigoautotransport.replit.app',
        port: 443,
        path: '/api/crm/track-lead-source',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Amerigo-Attribution-Test/1.0',
          'X-Test-Method': 'https-module-direct'
        }
      };
      
      // Create promise-based wrapper around the https request
      const httpsRequest = () => {
        return new Promise((resolve, reject) => {
          const req = https.request(requestOptions, (res) => {
            console.log(`🔄 HTTPS Response Status: ${res.statusCode}`);
            
            let data = '';
            res.on('data', (chunk) => {
              data += chunk;
            });
            
            res.on('end', () => {
              resolve({ status: res.statusCode, body: data });
            });
          });
          
          req.on('error', (error) => {
            reject(error);
          });
          
          req.write(JSON.stringify(testPayload));
          req.end();
        });
      };
      
      const httpsResponse = await httpsRequest();
      console.log(`✅ https module RESPONSE: Status ${httpsResponse.status}, Body: ${httpsResponse.body}`);
      
    } catch (httpsError) {
      console.error(`❌ https module ERROR: ${httpsError.message}`);
    }
  }
  
  console.log('\n🔍 TEST COMPLETE: Check the logs above to see if the connection to the CRM was successful');
}

// Run the test
testAttributionEndpointDirect();