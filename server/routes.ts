import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertQuoteSchema } from "@shared/schema";
import { sendConfirmationEmail, sendConfirmationSMS } from "./utils/notifications";
import { sendToWebhook } from "./utils/webhook";

// Use MapQuest with your API key
// Using the new key you provided
const MAPQUEST_API_KEY = 'YDMaftbjplfYTcQ129jOTQEkt37kNXy9';

// Log the API key (partially masked for security)
if (MAPQUEST_API_KEY) {
  const masked = MAPQUEST_API_KEY.substring(0, 4) + "..." + MAPQUEST_API_KEY.substring(MAPQUEST_API_KEY.length - 4);
  console.log("MapQuest API key loaded:", masked);
} else {
  console.error("❌ MAPQUEST_API_KEY environment variable is not set!");
}

async function getDistance(origin: string, destination: string): Promise<{distance: number, time?: string}> {
  // Log detailed information about the inputs
  console.log("Server: getDistance called with:", {
    origin: {
      value: origin,
      type: typeof origin,
      length: origin.length,
      hasZip: /\d{5}/.test(origin)
    },
    destination: {
      value: destination,
      type: typeof destination,
      length: destination.length,
      hasZip: /\d{5}/.test(destination)
    }
  });

  // Simplify location format to ensure MapQuest API compatibility
  // Extract just the city and state for better compatibility
  let originFormatted = origin;
  let destinationFormatted = destination;
  
  // Regex to extract "City, ST" from the string
  const cityStateRegex = /([^,]+,\s*[A-Z]{2})/i;
  
  // Apply the regex to origin and destination
  const originMatch = origin.match(cityStateRegex);
  const destMatch = destination.match(cityStateRegex);
  
  if (originMatch && originMatch[1]) {
    originFormatted = originMatch[1].trim();
    console.log("Simplified origin to:", originFormatted);
  }
  
  if (destMatch && destMatch[1]) {
    destinationFormatted = destMatch[1].trim();
    console.log("Simplified destination to:", destinationFormatted);
  }

  // Use MapQuest API to get distance - ensure we have the correct format
  const url = `http://www.mapquestapi.com/directions/v2/route?key=${MAPQUEST_API_KEY}&from=${encodeURIComponent(
    originFormatted
  )}&to=${encodeURIComponent(destinationFormatted)}&unit=m`;
  
  // Note: Changed https to http, and unit=M to unit=m as the API may be case-sensitive

  try {
    console.log("Server: Making MapQuest request:", url);
    console.log("Server: Using MapQuest API key:", MAPQUEST_API_KEY ? "Key exists" : "No key found!");
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log("Server: MapQuest API response status:", response.status);
    console.log("Server: MapQuest API response data:", {
      statuscode: data.info?.statuscode,
      hasRoute: !!data.route,
      distance: data.route?.distance,
      formattedTime: data.route?.formattedTime,
      hasErrors: data.info?.messages?.length > 0,
      messages: data.info?.messages
    });

    if (data.route && typeof data.route.distance === 'number') {
      const result = {
        distance: Math.round(data.route.distance), // Already in miles
        time: data.route.formattedTime
      };
      console.log("Server: Distance calculation successful:", result);
      return result;
    } else {
      console.error("Server: No route data or distance in response");
      if (data.info?.messages?.length > 0) {
        console.error("Server: MapQuest API error messages:", data.info.messages);
        throw new Error(`MapQuest API error: ${data.info.messages.join(", ")}`);
      } else {
        throw new Error("Distance calculation failed - no distance in response");
      }
    }
  } catch (error) {
    console.error("Server: MapQuest API Error:", error);
    throw error;
  }
}

export function registerRoutes(app: Express): Server {
  app.get("/api/distance", async (req, res) => {
    const { origin, destination } = req.query;
    
    console.log("Server: Distance API called with:", { origin, destination });

    if (!origin || !destination) {
      console.log("Server: Missing origin or destination");
      return res.status(400).json({ error: "Origin and destination are required" });
    }

    try {
      const result = await getDistance(origin as string, destination as string);
      console.log("Server: Distance calculation successful:", result);
      res.json({ 
        distance: result.distance,
        time: result.time || undefined
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Server: Distance calculation failed:", errorMessage);
      res.status(500).json({ error: errorMessage });
    }
  });

  app.post("/api/quotes", async (req, res) => {
    try {
      // We've disabled database storage to focus on webhook functionality
      console.log("Quote submission received - database storage disabled");
      
      // Just return success without actually storing in the database
      // This avoids the not-null constraint errors
      res.json({ 
        success: true, 
        message: "Quote processed (database storage disabled)"
      });
      
      /* Original code commented out
      const quoteData = insertQuoteSchema.parse(req.body);
      const quote = await storage.createQuote(quoteData);
      res.json(quote);
      */
    } catch (error) {
      console.error("Error in /api/quotes endpoint:", error);
      res.status(400).json({ error: "Invalid quote data" });
    }
  });

  // Endpoint for instant quote notifications (email and SMS)
  app.post("/api/send-quote-notification", async (req, res) => {
    try {
      const { email, phone, quoteDetails } = req.body;
      
      if (!email && !phone) {
        return res.status(400).json({ error: "Either email or phone is required" });
      }
      
      if (!quoteDetails) {
        return res.status(400).json({ error: "Quote details are required" });
      }

      // Store results of notification attempts
      const results = {
        email: false,
        sms: false
      };

      // Send email if provided
      if (email) {
        results.email = await sendConfirmationEmail(email, quoteDetails);
      }
      
      // Send SMS if provided
      if (phone) {
        results.sms = await sendConfirmationSMS(phone, quoteDetails);
      }
      
      // Database storage is disabled - we're only using the webhook
      console.log("Database storage skipped - only sending to webhook");
      
      /* Original database storage code commented out to prevent errors
      try {
        const storeableQuote = {
          ...quoteDetails,
          email: email || null,
          phone: phone || null
        };
        
        await storage.createQuote(storeableQuote);
      } catch (error) {
        console.error("Error storing quote:", error);
      }
      */
      
      res.json({
        success: results.email || results.sms,
        emailSent: results.email,
        smsSent: results.sms
      });
    } catch (error) {
      console.error("Error sending notifications:", error);
      res.status(500).json({ error: "Failed to send notifications" });
    }
  });

  // Endpoint for booking confirmation notifications
  app.post("/api/send-confirmations", async (req, res) => {
    try {
      const bookingDetails = req.body;
      const { email, phone } = bookingDetails;
      
      if (!email && !phone) {
        return res.status(400).json({ error: "Either email or phone is required" });
      }
      
      const results = {
        email: false,
        sms: false,
        webhook: false
      };
      
      // Send email if provided
      if (email) {
        results.email = await sendConfirmationEmail(email, bookingDetails);
      }
      
      // Send SMS if provided
      if (phone) {
        results.sms = await sendConfirmationSMS(phone, bookingDetails);
      }
      
      // Send to webhook (CRM integration)
      const webhookResult = await sendToWebhook(bookingDetails);
      results.webhook = webhookResult.success;
      
      if (!webhookResult.success) {
        console.warn("Webhook delivery warning:", webhookResult.message);
      }
      
      res.json({
        success: results.email || results.sms,
        emailSent: results.email,
        smsSent: results.sms,
        webhookSent: results.webhook
      });
    } catch (error) {
      console.error("Error sending confirmations:", error);
      res.status(500).json({ error: "Failed to send confirmations" });
    }
  });
  
  // New endpoint specifically for final form submissions
  // This endpoint fires only when the final "Submit" button is clicked
  app.post("/api/final-submission", async (req, res) => {
    try {
      console.log("\n🔴 DEBUGGING ORDER BOOKING WEBHOOK - RECEIVED REQUEST");
      console.log("🔔 FINAL FORM SUBMISSION - Complete booking data received");
      
      // Check request headers
      console.log("📋 REQUEST HEADERS:", JSON.stringify({
        'content-type': req.headers['content-type'],
        'user-agent': req.headers['user-agent'],
        'content-length': req.headers['content-length']
      }));
      
      const formData = req.body;
      
      // Check if formData exists
      if (!formData) {
        console.error("❌ CRITICAL ERROR: No form data received! Request body is empty or null");
        return res.status(400).json({ error: "Empty request body received" });
      }
      
      console.log("📋 FORM DATA KEYS:", Object.keys(formData));
      
      // Log the incoming data for debugging (comprehensive)
      console.log("📝 FINAL FORM DATA RECEIVED:", {
        name: formData?.name || 'Not provided',
        email: formData?.email || 'Not provided',
        phone: formData?.phone || 'Not provided',
        vehicle: `${formData?.year || ''} ${formData?.make || ''} ${formData?.model || ''}`,
        from: formData?.pickupLocation || 'Not provided',
        to: formData?.dropoffLocation || 'Not provided',
        transportType: formData?.transportType || 'Not provided',
        selectedPrice: formData?.selectedPrice || 'Not provided',
        pickupContactName: formData?.pickupContactName || 'Not provided',
        pickupContactPhone: formData?.pickupContactPhone || 'Not provided',
        pickupAddress: formData?.pickupAddress || 'Not provided',
        dropoffContactName: formData?.dropoffContactName || 'Not provided',
        dropoffContactPhone: formData?.dropoffContactPhone || 'Not provided',
        dropoffAddress: formData?.dropoffAddress || 'Not provided'
      });
      
      // Validate minimal required data
      if (!formData) {
        console.error("❌ FINAL SUBMISSION ERROR: No form data provided");
        return res.status(400).json({ error: "Form data is required" });
      }
      
      // Send to the dedicated final submission webhooks
      console.log("📤 SENDING FINAL SUBMISSION TO DEDICATED WEBHOOKS");
      
      // Parse addresses to extract city, state, and zip
      const parseAddress = (address: string) => {
        const parts = address ? address.split(',').map(part => part.trim()) : [];
        
        // If there are no parts, return default values
        if (parts.length === 0) {
          return { street: 'Not provided', city: 'Not provided', state: 'Not provided', zip: 'Not provided' };
        }
        
        // First part is usually the street address
        const street = parts[0];
        
        // Last part usually contains state and zip
        const lastPart = parts[parts.length - 1];
        
        // Try to match "STATE ZIP" pattern (e.g., "NY 10001")
        const stateZipPattern = /([A-Z]{2})\s+(\d{5}(-\d{4})?)/;
        const match = lastPart ? lastPart.match(stateZipPattern) : null;
        
        let state = 'Not provided';
        let zip = 'Not provided';
        
        if (match) {
          state = match[1];
          zip = match[2];
        } else {
          // If no match, try to extract state and zip separately
          const stateMatch = lastPart ? lastPart.match(/([A-Z]{2})/) : null;
          const zipMatch = lastPart ? lastPart.match(/(\d{5}(-\d{4})?)/) : null;
          
          if (stateMatch) state = stateMatch[1];
          if (zipMatch) zip = zipMatch[1];
        }
        
        // If we have more than 2 parts, the city is usually the second to last part
        // Otherwise, we can't reliably determine the city
        let city = 'Not provided';
        if (parts.length > 1) {
          // If last part has state and zip, then second to last is city
          // Otherwise, we need to look at parts before that
          if (parts.length === 2) {
            // Extract city from the middle of the address if it's not just a street
            const cityParts = parts[1].split(' ');
            if (cityParts.length > 1) {
              // Remove zip code and state from city if present
              city = cityParts.filter(part => !part.match(/^\d{5}(-\d{4})?$/) && !part.match(/^[A-Z]{2}$/)).join(' ');
            }
          } else {
            // Second to last part is usually the city
            city = parts[parts.length - 2];
          }
        }
        
        return { street, city, state, zip };
      };
      
      // Parse the pickup and dropoff addresses
      const pickupAddressParsed = parseAddress(formData.pickupAddress);
      const dropoffAddressParsed = parseAddress(formData.dropoffAddress);
      
      // Format the shipment date properly if it exists
      let formattedShipmentDate = 'Not provided';
      if (formData.shipmentDate) {
        try {
          const shipDate = new Date(formData.shipmentDate);
          // Format as MM/DD/YYYY
          formattedShipmentDate = `${shipDate.getMonth() + 1}/${shipDate.getDate()}/${shipDate.getFullYear()}`;
        } catch (e) {
          console.error("Error formatting shipment date:", e);
          formattedShipmentDate = String(formData.shipmentDate);
        }
      }
      
      // Structure the data for Zapier
      const finalSubmissionData = {
        ...formData,
        eventType: "final_submission",
        eventDate: new Date().toISOString(),
        
        // Explicitly map fields for Zapier
        "Contact Name": formData.name || 'Not provided',
        "Contact Email": formData.email || 'Not provided',
        "Contact Phone": formData.phone || 'Not provided',
        
        // Original pickup and dropoff locations
        "Pickup Location": formData.pickupLocation || 'Not provided',
        "Pickup Address": formData.pickupAddress || 'Not provided',
        "Pickup Contact Name": formData.pickupContactName || 'Not provided',
        "Pickup Contact Phone": formData.pickupContactPhone || 'Not provided',
        
        "Dropoff Location": formData.dropoffLocation || 'Not provided',
        "Dropoff Address": formData.dropoffAddress || 'Not provided',
        "Dropoff Contact Name": formData.dropoffContactName || 'Not provided',
        "Dropoff Contact Phone": formData.dropoffContactPhone || 'Not provided',
        
        // Parsed address components
        "Pickup Street": pickupAddressParsed.street,
        "Pickup City": pickupAddressParsed.city,
        "Pickup State": pickupAddressParsed.state,
        "Pickup Zip": pickupAddressParsed.zip,
        
        "Dropoff Street": dropoffAddressParsed.street,
        "Dropoff City": dropoffAddressParsed.city,
        "Dropoff State": dropoffAddressParsed.state,
        "Dropoff Zip": dropoffAddressParsed.zip,
        
        "Vehicle Details": `${formData.year || ''} ${formData.make || ''} ${formData.model || ''}`,
        "Transport Type": formData.transportType || 'Not provided',
        "Shipment Date": formattedShipmentDate,
        "Price": formData.openTransportPrice || formData.selectedPrice || 'Not provided',
        "Distance": formData.distance || 'Not provided',
        "Transit Time": formData.transitTime || 'Not provided'
      };
      
      // IMPORTANT: For FINAL submissions, we only want to use the ORDER webhook URL
      // This webhook is specifically for completed orders with full details
      const orderWebhookUrl = "https://hooks.zapier.com/hooks/catch/18240296/2xrmfy2/";
      
      // Log the webhook URL in development or when debugging
      console.log("🚀 SENDING FINAL ORDER SUBMISSION TO ORDER WEBHOOK (FULL URL):", orderWebhookUrl);
      
      // Convert data to JSON string once
      const jsonData = JSON.stringify(finalSubmissionData);
      
      // Log the exact JSON being sent
      console.log("🔍 EXACT JSON PAYLOAD BEING SENT TO ZAPIER WEBHOOKS:");
      console.log(jsonData.substring(0, 500) + (jsonData.length > 500 ? "..." : ""));
      
      // Function to send data to a webhook URL
      const sendToWebhookUrl = async (url: string, label: string) => {
        try {
          console.log(`📤 SENDING TO ${label} WEBHOOK: ${url.substring(0, 30)}...`);
          
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'User-Agent': 'Amerigo-Auto-Transport/1.0',
            },
            body: jsonData,
          });
          
          console.log(`📡 ${label} WEBHOOK RESPONSE STATUS: ${response.status} ${response.statusText}`);
          
          const responseText = await response.text();
          
          if (!response.ok) {
            console.error(`❌ ${label} WEBHOOK ERROR: ${response.status} ${response.statusText}`);
            console.error(`❌ ${label} RESPONSE: ${responseText.substring(0, 500)}`);
            return { success: false, error: `${response.status} ${response.statusText}` };
          }
          
          // Try to parse the response if it's JSON
          try {
            const jsonResponse = JSON.parse(responseText);
            console.log(`✅ ${label} WEBHOOK SUCCESS - JSON RESPONSE:`, JSON.stringify(jsonResponse, null, 2));
          } catch (e) {
            // Not JSON, just log the text
            console.log(`✅ ${label} WEBHOOK SUCCESS - TEXT RESPONSE:`, responseText.substring(0, 200));
          }
          
          console.log(`✅ ${label} WEBHOOK DELIVERED SUCCESSFULLY\n`);
          return { success: true };
        } catch (error) {
          console.error(`❌ ${label} WEBHOOK REQUEST FAILED:`, error);
          return { success: false, error: error instanceof Error ? error.message : String(error) };
        }
      };
      
      try {
        console.log("⏳ ATTEMPTING DIRECT FETCH TO ZAPIER WEBHOOK...");
        
        // Attempt direct fetch to Zapier without using the helper function
        try {
          const directResponse = await fetch(orderWebhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'User-Agent': 'Amerigo-Auto-Transport/1.0',
            },
            body: jsonData,
          });
          
          console.log("📡 DIRECT WEBHOOK RESPONSE STATUS:", directResponse.status, directResponse.statusText);
          const directResponseText = await directResponse.text();
          console.log("📄 DIRECT WEBHOOK RESPONSE TEXT:", directResponseText);
          
          if (directResponse.ok) {
            console.log("✅ DIRECT WEBHOOK REQUEST SUCCESSFUL");
            return res.json({
              success: true,
              message: "Final submission successfully sent to CRM system",
              webhookResponse: directResponseText
            });
          } else {
            console.error("❌ DIRECT WEBHOOK REQUEST FAILED");
          }
        } catch (directError) {
          console.error("❌ DIRECT WEBHOOK ERROR:", directError);
        }
        
        // Fall back to original method if direct fetch fails
        console.log("⏳ FALLBACK TO HELPER FUNCTION...");
        const orderWebhookResult = await sendToWebhookUrl(orderWebhookUrl, "ORDER");
        
        // Check if the order webhook succeeded
        const isSuccessful = orderWebhookResult.success;
        
        if (!isSuccessful) {
          console.error("❌ BOTH WEBHOOK METHODS FAILED!");
          return res.status(500).json({ 
            success: false, 
            message: "Failed to send final submission to order system" 
          });
        }
        
        console.log('✅ FINAL SUBMISSION PROCESS COMPLETED VIA FALLBACK METHOD\n');
        
        res.json({
          success: true,
          message: "Final submission successfully sent to CRM system"
        });
      } catch (fetchError) {
        console.error('❌ FINAL SUBMISSION REQUEST FAILED:', fetchError);
        res.status(500).json({ 
          success: false, 
          message: `Network error while sending final submission: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}` 
        });
      }
    } catch (error) {
      console.error("❌ FINAL SUBMISSION ENDPOINT ERROR:", error);
      res.status(500).json({ 
        success: false,
        message: "Internal server error while sending final submission to CRM",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Test endpoint for webhook connectivity
  app.get("/api/test-webhook", async (req, res) => {
    try {
      console.log("🧪 RUNNING WEBHOOK TEST...");
      
      // Create test data
      const testData = {
        name: "TEST_USER",
        email: "test@example.com",
        phone: "555-555-5555",
        eventType: "webhook_test",
        year: "2025",
        make: "Test",
        model: "Model",
        pickupLocation: "Test City, TX 12345",
        dropoffLocation: "Test City, TX 12345",
        distance: 100,
        openTransportPrice: 100,
        enclosedTransportPrice: 150,
        transitTime: 1
      };
      
      console.log("📤 SENDING TEST DATA TO WEBHOOK...");
      const webhookResult = await sendToWebhook(testData);
      
      if (webhookResult.success) {
        console.log("✅ WEBHOOK TEST SUCCESSFUL");
        res.json({
          success: true,
          message: "Webhook test successful - check your Zapier dashboard for a test lead"
        });
      } else {
        console.error("❌ WEBHOOK TEST FAILED:", webhookResult.message);
        res.status(500).json({
          success: false,
          message: "Webhook test failed",
          error: webhookResult.message
        });
      }
    } catch (error) {
      console.error("❌ WEBHOOK TEST ERROR:", error);
      res.status(500).json({
        success: false,
        message: "Error testing webhook",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Test endpoint for testing the final-submission webhook
  app.get("/api/test-final-webhook", async (req, res) => {
    try {
      console.log("\n🧪 TESTING FINAL SUBMISSION WEBHOOK (WITH ADDRESS PARSING AND SHIPMENT DATE)...");
      
      // Create a shipment date for testing (2 weeks from now)
      const shipmentDate = new Date();
      shipmentDate.setDate(shipmentDate.getDate() + 14);
      
      // Create comprehensive test data with address information
      const testData = {
        name: "TEST_FINAL_USER",
        email: "test-final@example.com",
        phone: "555-555-5555",
        eventType: "final_webhook_test",
        year: "2025",
        make: "Test",
        model: "Model",
        pickupLocation: "Test Pickup City, TX 12345",
        dropoffLocation: "Test Dropoff City, TX 67890",
        distance: 100,
        openTransportPrice: 100,
        enclosedTransportPrice: 150,
        transitTime: 1,
        
        // Final submission specific data
        pickupContactName: "Test Pickup Contact",
        pickupContactPhone: "111-111-1111",
        pickupAddress: "123 Pickup St, Test Pickup City, TX 12345",
        
        dropoffContactName: "Test Dropoff Contact",
        dropoffContactPhone: "222-222-2222",
        dropoffAddress: "456 Dropoff St, Test Dropoff City, TX 67890",
        
        transportType: "open",
        selectedPrice: 100,
        isExpeditedShipping: false,
        shipmentDate: shipmentDate.toISOString(),
        submissionDate: new Date().toISOString()
      };
      
      console.log("📤 SENDING TEST FINAL SUBMISSION DATA WITH PARSED ADDRESSES...");
      
      // Parse the addresses for the test data
      const parseAddress = (address: string) => {
        const parts = address ? address.split(',').map(part => part.trim()) : [];
        
        // If there are no parts, return default values
        if (parts.length === 0) {
          return { street: 'Not provided', city: 'Not provided', state: 'Not provided', zip: 'Not provided' };
        }
        
        // First part is usually the street address
        const street = parts[0];
        
        // Last part usually contains state and zip
        const lastPart = parts[parts.length - 1];
        
        // Try to match "STATE ZIP" pattern (e.g., "NY 10001")
        const stateZipPattern = /([A-Z]{2})\s+(\d{5}(-\d{4})?)/;
        const match = lastPart ? lastPart.match(stateZipPattern) : null;
        
        let state = 'Not provided';
        let zip = 'Not provided';
        
        if (match) {
          state = match[1];
          zip = match[2];
        } else {
          // If no match, try to extract state and zip separately
          const stateMatch = lastPart ? lastPart.match(/([A-Z]{2})/) : null;
          const zipMatch = lastPart ? lastPart.match(/(\d{5}(-\d{4})?)/) : null;
          
          if (stateMatch) state = stateMatch[1];
          if (zipMatch) zip = zipMatch[1];
        }
        
        // If we have more than 2 parts, the city is usually the second to last part
        // Otherwise, we can't reliably determine the city
        let city = 'Not provided';
        if (parts.length > 1) {
          // If last part has state and zip, then second to last is city
          // Otherwise, we need to look at parts before that
          if (parts.length === 2) {
            // Extract city from the middle of the address if it's not just a street
            const cityParts = parts[1].split(' ');
            if (cityParts.length > 1) {
              // Remove zip code and state from city if present
              city = cityParts.filter(part => !part.match(/^\d{5}(-\d{4})?$/) && !part.match(/^[A-Z]{2}$/)).join(' ');
            }
          } else {
            // Second to last part is usually the city
            city = parts[parts.length - 2];
          }
        }
        
        return { street, city, state, zip };
      };
      
      // Parse the pickup and dropoff addresses
      const pickupAddressParsed = parseAddress(testData.pickupAddress);
      const dropoffAddressParsed = parseAddress(testData.dropoffAddress);
      
      // Format shipment date as MM/DD/YYYY
      const shipDate = new Date(testData.shipmentDate);
      const formattedShipmentDate = `${shipDate.getMonth() + 1}/${shipDate.getDate()}/${shipDate.getFullYear()}`;
      
      // Create enhanced test data with parsed addresses and formatted date
      const enhancedTestData = {
        ...testData,
        
        // Parsed address components
        "Pickup Street": pickupAddressParsed.street,
        "Pickup City": pickupAddressParsed.city,
        "Pickup State": pickupAddressParsed.state,
        "Pickup Zip": pickupAddressParsed.zip,
        
        "Dropoff Street": dropoffAddressParsed.street,
        "Dropoff City": dropoffAddressParsed.city,
        "Dropoff State": dropoffAddressParsed.state,
        "Dropoff Zip": dropoffAddressParsed.zip,
        
        // Formatted shipment date
        "Shipment Date": formattedShipmentDate
      };
      
      console.log("📄 ENHANCED TEST DATA:", {
        pickupAddress: {
          street: pickupAddressParsed.street,
          city: pickupAddressParsed.city,
          state: pickupAddressParsed.state,
          zip: pickupAddressParsed.zip
        },
        dropoffAddress: {
          street: dropoffAddressParsed.street,
          city: dropoffAddressParsed.city,
          state: dropoffAddressParsed.state,
          zip: dropoffAddressParsed.zip
        },
        shipmentDate: formattedShipmentDate
      });
      
      // For final orders, we only use the order webhook URL
      // This webhook is specifically for completed orders with full details
      const orderWebhookUrl = "https://hooks.zapier.com/hooks/catch/18240296/2xrmfy2/";
      
      console.log("🚀 TESTING ORDER WEBHOOK URL (FULL URL):", orderWebhookUrl);
      
      // Convert data to JSON string once
      const jsonData = JSON.stringify(enhancedTestData);
      
      // Log the exact JSON being sent
      console.log("🔍 EXACT JSON PAYLOAD BEING SENT TO ZAPIER WEBHOOKS:");
      console.log(jsonData.substring(0, 500) + (jsonData.length > 500 ? "..." : ""));
      
      // Function to send data to a webhook URL
      const sendToWebhookUrl = async (url: string, label: string) => {
        try {
          console.log(`📤 SENDING TO ${label} WEBHOOK: ${url.substring(0, 30)}...`);
          
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'User-Agent': 'Amerigo-Auto-Transport/1.0',
            },
            body: jsonData,
          });
          
          console.log(`📡 ${label} WEBHOOK RESPONSE STATUS: ${response.status} ${response.statusText}`);
          
          const responseText = await response.text();
          
          if (!response.ok) {
            console.error(`❌ ${label} WEBHOOK ERROR: ${response.status} ${response.statusText}`);
            console.error(`❌ ${label} RESPONSE: ${responseText.substring(0, 500)}`);
            return { success: false, error: `${response.status} ${response.statusText}` };
          }
          
          // Try to parse the response if it's JSON
          try {
            const jsonResponse = JSON.parse(responseText);
            console.log(`✅ ${label} WEBHOOK SUCCESS - JSON RESPONSE:`, JSON.stringify(jsonResponse, null, 2));
          } catch (e) {
            // Not JSON, just log the text
            console.log(`✅ ${label} WEBHOOK SUCCESS - TEXT RESPONSE:`, responseText.substring(0, 200));
          }
          
          console.log(`✅ ${label} WEBHOOK DELIVERED SUCCESSFULLY\n`);
          return { success: true };
        } catch (error) {
          console.error(`❌ ${label} WEBHOOK REQUEST FAILED:`, error);
          return { success: false, error: error instanceof Error ? error.message : String(error) };
        }
      };
      
      try {
        // For final orders, only send to the order webhook
        const orderResult = await sendToWebhookUrl(orderWebhookUrl, "ORDER");
        
        // Check if the order webhook succeeded
        const isSuccessful = orderResult.success;
        
        if (!isSuccessful) {
          return res.status(500).json({ 
            success: false, 
            message: "Order webhook test failed" 
          });
        }
        
        console.log('✅ FINAL WEBHOOK TEST COMPLETED\n');
        
        res.json({
          success: true,
          message: "Final webhook test successful with parsed addresses and formatted shipment date - check your Zapier dashboard"
        });
      } catch (webhookError) {
        console.error("❌ FINAL WEBHOOK TEST FAILED:", webhookError);
        res.status(500).json({
          success: false,
          message: "Final webhook test failed",
          error: webhookError instanceof Error ? webhookError.message : String(webhookError)
        });
      }
    } catch (error) {
      console.error("❌ FINAL WEBHOOK TEST ERROR:", error);
      res.status(500).json({
        success: false,
        message: "Error testing final webhook",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Dedicated webhook endpoint for CRM integration
  // This is the ONLY endpoint that sends data to the webhook
  app.post("/api/webhook", async (req, res) => {
    try {
      console.log("\n🔔 /api/webhook ENDPOINT CALLED - Lead submission to CRM system");
      const formData = req.body;
      
      // Log the incoming data for debugging
      console.log("📝 WEBHOOK DATA RECEIVED:", {
        name: formData?.name || 'Not provided',
        email: formData?.email || 'Not provided',
        phone: formData?.phone || 'Not provided',
        vehicle: `${formData?.year || ''} ${formData?.make || ''} ${formData?.model || ''}`,
        from: formData?.pickupLocation || 'Not provided',
        to: formData?.dropoffLocation || 'Not provided',
        eventType: formData?.eventType || 'Not specified'
      });
      
      // Validate minimal required data
      if (!formData) {
        console.error("❌ WEBHOOK ERROR: No form data provided");
        return res.status(400).json({ error: "Form data is required" });
      }
      
      // We'll continue even if WEBHOOK_URL isn't set, as we now have a fallback in the webhook.ts file
      if (!process.env.WEBHOOK_URL) {
        console.warn("⚠️ WARNING: WEBHOOK_URL environment variable is not set - will use fallback URL");
      }
      
      console.log("✅ WEBHOOK DATA VALIDATION PASSED - Sending to external system");
      
      // Send the webhook - this is the actual CRM integration
      const webhookResult = await sendToWebhook(formData);
      
      if (webhookResult.success) {
        console.log("🎉 WEBHOOK SUCCESSFULLY DELIVERED TO CRM");
        res.json({ 
          success: true, 
          message: "Lead successfully sent to CRM system"
        });
      } else {
        console.error("❌ WEBHOOK DELIVERY FAILED:", webhookResult.message);
        res.status(500).json({ 
          success: false, 
          message: "Failed to send lead to CRM system", 
          error: webhookResult.message 
        });
      }
    } catch (error) {
      console.error("❌ WEBHOOK ENDPOINT ERROR:", error);
      res.status(500).json({ 
        success: false,
        message: "Internal server error while sending lead to CRM",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}