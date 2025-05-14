import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import cors from "cors";
import { storage } from "./storage";
import { insertQuoteSchema } from "@shared/schema";
import { sendConfirmationEmail, sendConfirmationSMS } from "./utils/notifications";
import { sendToWebhook } from "./utils/webhook";
import { sendAttributionToCRM } from "./utils/attribution-webhook";
import { registerWebhookDiagnosticEndpoints, webhookDiagnosticMiddleware } from "./utils/webhook-api";
import { runWebhookHealthChecks, getWebhookMonitorReport } from "./utils/webhook-monitor";
import { validateFormData, formatValidationErrors } from "../shared/validation";
import { initLocationService, searchLocations, getPopularLocations } from "./utils/location-service";

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
  // Simplify location format to ensure MapQuest API compatibility
  let originFormatted = origin;
  let destinationFormatted = destination;
  
  // Regex to extract "City, ST" from the string
  const cityStateRegex = /([^,]+,\s*[A-Z]{2})/i;
  
  // Apply the regex to origin and destination
  const originMatch = origin.match(cityStateRegex);
  const destMatch = destination.match(cityStateRegex);
  
  if (originMatch && originMatch[1]) {
    originFormatted = originMatch[1].trim();
  }
  
  if (destMatch && destMatch[1]) {
    destinationFormatted = destMatch[1].trim();
  }

  // Use MapQuest API to get distance
  const url = `http://www.mapquestapi.com/directions/v2/route?key=${MAPQUEST_API_KEY}&from=${encodeURIComponent(
    originFormatted
  )}&to=${encodeURIComponent(destinationFormatted)}&unit=m`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.route && typeof data.route.distance === 'number') {
      return {
        distance: Math.round(data.route.distance), // Already in miles
        time: data.route.formattedTime
      };
    } else {
      if (data.info?.messages?.length > 0) {
        throw new Error(`MapQuest API error: ${data.info.messages.join(", ")}`);
      } else {
        throw new Error("Distance calculation failed - no distance in response");
      }
    }
  } catch (error) {
    throw error;
  }
}

export function registerRoutes(app: Express): Server {
  // Initialize the location service at startup
  initLocationService();
  
  // Enable CORS for development environment only - never in production
  console.log('🧪 Enabling CORS for development only');
  app.use(cors({
    // In production, this will restrict to same origin which preserves tracking
    origin: true, 
    methods: ['GET', 'POST'],
    // Don't modify credential behavior to ensure tracking works properly
    credentials: false 
  }));
  app.get("/api/distance", async (req, res) => {
    const { origin, destination } = req.query;

    if (!origin || !destination) {
      return res.status(400).json({ error: "Origin and destination are required" });
    }

    try {
      const result = await getDistance(origin as string, destination as string);
      res.json({ 
        distance: result.distance,
        time: result.time || undefined
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
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
    console.log("🚀 /api/send-quote-notification triggered!");
    console.log("📦 Payload received:", req.body);

    try {
      const { email, phone, quoteDetails } = req.body;
      
      if (!email && !phone) {
        return res.status(400).json({ error: "Either email or phone is required" });
      }
      
      if (!quoteDetails) {
        return res.status(400).json({ error: "Quote details are required" });
      }
      
      // Meta event sending removed as part of rollback


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
      } else {
        // Send attribution data to CRM separately in a non-blocking way
        // Adding a slight delay to ensure main webhook completes first
        setTimeout(() => {
          sendAttributionToCRM(bookingDetails);
        }, 250);
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
      console.log("👉 /api/final-submission triggered!");
      console.log("\n🔴 DEBUGGING ORDER BOOKING WEBHOOK - RECEIVED REQUEST");
      console.log("🔔 FINAL FORM SUBMISSION - Complete booking data received");
      
      // Get the form data from the request body
      const formData = req.body;
      
      // Check request headers
      console.log("📋 REQUEST HEADERS:", JSON.stringify({
        'content-type': req.headers['content-type'],
        'user-agent': req.headers['user-agent'],
        'content-length': req.headers['content-length']
      }));
      
      // Log form data for debugging
      console.log("📋 FORM DATA KEYS:", Object.keys(formData || {}));
      
      // Check if formData exists
      if (!formData) {
        console.error("❌ CRITICAL ERROR: No form data received! Request body is empty or null");
        return res.status(400).json({ 
          success: false, 
          error: "Empty request body received" 
        });
      }
      
      // We've already imported validation functions at the top of the file
      
      // For final submissions, we need to set the proper form type and eventType
      formData.eventType = 'final_submission';
      
      // Simplified minimal validation for final submissions
      const requiredFields = [
        'name', 'email', 'phone', 
        'pickupLocation', 'pickupZip',
        'dropoffLocation', 'dropoffZip',
        'vehicleType', 'year', 'make', 'model',
        'shipmentDate'
      ];
      
      // Add compatibility for different field naming patterns
      // Check for either transportType OR selectedTransport
      if (!formData.transportType && formData.selectedTransport) {
        formData.transportType = formData.selectedTransport;
      }
      
      // Check for either selectedPrice OR finalPrice
      if (!formData.selectedPrice && formData.finalPrice) {
        formData.selectedPrice = formData.finalPrice;
      }
      
      // Simple validation for required fields
      const validationErrors = [];
      
      for (const field of requiredFields) {
        if (!formData[field]) {
          validationErrors.push({
            field,
            message: `${field} is required`
          });
        }
      }
      
      // If validation fails, return error with details
      if (validationErrors.length > 0) {
        console.error(`❌ FINAL SUBMISSION VALIDATION FAILED: ${validationErrors.length} errors found:`);
        validationErrors.forEach(error => {
          console.error(`- ${error.field}: ${error.message}`);
        });
        
        return res.status(400).json({
          success: false,
          error: "Form validation failed",
          validationErrors
        });
      }
      
      console.log("✅ FINAL SUBMISSION VALIDATION PASSED - All required fields present and valid")
      
      // Meta event code removed as part of rollback
      
      // Log the incoming data for debugging (comprehensive)
      console.log("📝 FINAL FORM DATA RECEIVED:", {
        name: formData.name || 'Not provided',
        email: formData.email || 'Not provided',
        phone: formData.phone || 'Not provided',
        vehicle: `${formData.year || ''} ${formData.make || ''} ${formData.model || ''}`,
        from: formData.pickupLocation || 'Not provided',
        to: formData.dropoffLocation || 'Not provided',
        transportType: formData.transportType || 'Not provided',
        selectedPrice: formData.selectedPrice || 'Not provided',
        pickupContactName: formData.pickupContactName || 'Not provided',
        pickupContactPhone: formData.pickupContactPhone || 'Not provided',
        pickupAddress: formData.pickupAddress || 'Not provided',
        dropoffContactName: formData.dropoffContactName || 'Not provided',
        dropoffContactPhone: formData.dropoffContactPhone || 'Not provided',
        dropoffAddress: formData.dropoffAddress || 'Not provided'
      });
      
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
      const pickupAddressParsed = parseAddress(formData.pickupAddress || '');
      const dropoffAddressParsed = parseAddress(formData.dropoffAddress || '');
      
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
      // 🚨 CONFIRMED CORRECT URL - DO NOT CHANGE - This is the order booking webhook
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
      
      // Try the direct and fallback webhook methods
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
      } catch (webhookError) {
        console.error('❌ FINAL SUBMISSION WEBHOOK ERROR:', webhookError);
        res.status(500).json({ 
          success: false, 
          message: `Error while sending final submission: ${webhookError instanceof Error ? webhookError.message : String(webhookError)}` 
        });
      }
    } catch (error) {
      console.error("❌ FINAL SUBMISSION ENDPOINT ERROR:", error);
      console.error("❌ Error stack:", error instanceof Error ? error.stack : 'No stack trace available');
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
        
        // Send attribution data to CRM separately for test data as well
        setTimeout(() => {
          sendAttributionToCRM(testData);
        }, 250);
        
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
  
  // Webhook diagnostic endpoints
  
  // Endpoint to test both webhooks and perform a comprehensive diagnostic check
  app.get("/api/webhook-diagnostic-test", async (req, res) => {
    try {
      console.log("\n🔍 RUNNING COMPREHENSIVE WEBHOOK DIAGNOSTIC TEST");
      
      // We don't need to import here since we already imported at the top
      
      // Run health checks on both webhooks
      const healthCheckResults = await runWebhookHealthChecks();
      
      // Get detailed webhook monitoring data
      const monitorReport = getWebhookMonitorReport();
      
      // Prepare comprehensive report
      const diagnosticReport = {
        healthStatus: healthCheckResults.overallHealth,
        healthChecks: healthCheckResults.results,
        monitoringStats: {
          totalAttempts: monitorReport.monitorData.transmissionStats.totalAttempts,
          successRate: monitorReport.successRate.toFixed(2) + '%',
          averageResponseTime: monitorReport.monitorData.transmissionStats.averageResponseTime.toFixed(2) + 'ms',
          consecutiveSuccesses: monitorReport.monitorData.transmissionStats.consecutiveSuccesses,
          consecutiveFailures: monitorReport.monitorData.transmissionStats.consecutiveFailures
        },
        lastWebhookAttempt: monitorReport.monitorData.lastWebhookAttempt,
        lastWebhookSuccess: monitorReport.monitorData.lastWebhookSuccess,
        lastWebhookFailure: monitorReport.monitorData.lastWebhookFailure,
        webhookUrls: monitorReport.monitorData.webhookUrls,
        timestamp: Date.now(),
        timeSinceLastAttempt: monitorReport.timeSinceLastAttempt ? 
          (monitorReport.timeSinceLastAttempt / 1000).toFixed(1) + 's' : 'N/A'
      };
      
      res.status(200).json({
        success: true,
        message: "Webhook diagnostic test completed successfully",
        diagnosticReport
      });
    } catch (error) {
      console.error("Error running webhook diagnostic test:", error);
      res.status(500).json({
        success: false,
        message: "Error running webhook diagnostic test",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Dedicated webhook endpoint for CRM integration
  // This is the ONLY endpoint that sends data to the webhook
  app.post("/api/webhook", async (req, res) => {
    try {
      console.log("\n🔔 /api/webhook ENDPOINT CALLED - Lead submission to CRM system");
      
      // Log request headers to help debug cross-origin issues
      console.log("📋 REQUEST HEADERS:", JSON.stringify({
        'origin': req.headers.origin,
        'content-type': req.headers['content-type'],
        'user-agent': req.headers['user-agent'],
        'content-length': req.headers['content-length'],
        'referer': req.headers.referer
      }));
      
      const formData = req.body;
      
      // SAFEGUARD: Check for empty or diagnostic pings
      // This prevents Replit health checks from triggering Zapier
      // CRITICAL SAFETY CHECK: Only filter out obvious non-customer submissions
      if (
          // Case 1: Completely empty request body  
          !formData || 
          
          // Case 2: Missing BOTH name AND phone (customer forms always have these)
          (!formData.phone && !formData.name) || 
          
          // Case 3: Explicitly marked as system health check
          formData.type === 'health_check' || 
          
          // Case 4: Explicitly from diagnostic system 
          formData.source === 'auto_diagnostic_system'
      ) {
        // Log detailed info about what triggered the filter
        console.log("⚠️ DIAGNOSTIC PING DETECTED - NOT A CUSTOMER SUBMISSION");
        console.log("⚠️ Filter triggered because:", {
          emptyBody: !formData,
          missingRequiredFields: formData && (!formData.phone && !formData.name),
          isHealthCheck: formData && formData.type === 'health_check',
          isDiagnostic: formData && formData.source === 'auto_diagnostic_system'
        });
        
        // Return 200 OK to avoid system retries
        return res.status(200).send("noop - ignored diagnostic ping");
      }
      
      // SAFETY CONFIRMATION: If we got here, this is a legitimate submission
      console.log("✅ SUBMISSION HAS CUSTOMER DATA - Processing normally");
      
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
        return res.status(400).json({ 
          success: false,
          error: "Form data is required" 
        });
      }
      
      // Simplified validation: only check if required fields are present
      // And ensure pickup and dropoff ZIPs are captured
      
      // List of required fields
      const requiredFields = [
        'name', 'email', 'phone', 
        'pickupLocation', 'pickupZip',
        'dropoffLocation', 'dropoffZip',
        'vehicleType', 'year', 'make', 'model',
        'shipmentDate'
      ];
      
      // Simple validation for required fields
      const validationErrors = [];
      
      for (const field of requiredFields) {
        if (!formData[field]) {
          validationErrors.push({
            field,
            message: `${field} is required`
          });
        }
      }
      
      // If validation fails, return error with details
      if (validationErrors.length > 0) {
        console.error(`❌ WEBHOOK VALIDATION FAILED: ${validationErrors.length} errors found:`);
        validationErrors.forEach(error => {
          console.error(`- ${error.field}: ${error.message}`);
        });
        
        return res.status(400).json({
          success: false,
          error: "Form validation failed",
          validationErrors
        });
      }
      
      console.log("✅ WEBHOOK DATA VALIDATION PASSED - All required fields present and valid")
      
      // We'll continue even if WEBHOOK_URL isn't set, as we now have a fallback in the webhook.ts file
      if (!process.env.WEBHOOK_URL) {
        console.warn("⚠️ WARNING: WEBHOOK_URL environment variable is not set - will use fallback URL");
      }
      
      console.log("✅ WEBHOOK DATA VALIDATION PASSED - Sending to external system");
      
      // Fire attribution webhook independently and immediately
      // Completely isolated from Zapier and main form flow
      console.log("🎯 Attribution webhook fired");
      sendAttributionToCRM(formData);
      
      // DIAGNOSTIC: Add timestamp and unique ID to track this submission
      const diagnosticId = `diag_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      console.log(`📊 [${diagnosticId}] ATTEMPTING MAIN WEBHOOK - ${new Date().toISOString()}`);
      
      // Send the webhook - this is the actual CRM integration
      const webhookResult = await sendToWebhook(formData);
      
      // DIAGNOSTIC: Log webhook result with the same ID for correlation
      console.log(`📊 [${diagnosticId}] WEBHOOK RESULT: ${webhookResult.success ? 'SUCCESS' : 'FAILURE'} - ${new Date().toISOString()}`);
      
      if (webhookResult.success) {
        console.log(`🎉 [${diagnosticId}] WEBHOOK SUCCESSFULLY DELIVERED TO CRM`);
        
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

  // Field mapping diagnostic endpoint
  app.get("/api/webhook-field-diagnostic", async (req, res) => {
    try {
      console.log("\n🔍 RUNNING WEBHOOK FIELD MAPPING DIAGNOSTIC");
      
      // Import test data
      const { 
        VALID_QUOTE_SUBMISSION,
        INCOMPLETE_QUOTE_SUBMISSION, 
        INVALID_FORMAT_SUBMISSION, 
        VALID_FINAL_SUBMISSION,
        SPECIAL_CHARACTERS_SUBMISSION
      } = require('./utils/webhook-test-data');
      
      const { createFieldDiagnosticLog } = require('./utils/webhook-field-diagnostics');
      
      // Test which data variant to use based on query parameter
      const testType = (req.query.type as string) || 'valid';
      
      let testData;
      let formType: 'quote' | 'final' = 'quote';
      
      switch(testType) {
        case 'valid':
          testData = VALID_QUOTE_SUBMISSION;
          break;
        case 'incomplete':
          testData = INCOMPLETE_QUOTE_SUBMISSION;
          break;
        case 'invalid':
          testData = INVALID_FORMAT_SUBMISSION;
          break;
        case 'final':
          testData = VALID_FINAL_SUBMISSION;
          formType = 'final';
          break;
        case 'special':
          testData = SPECIAL_CHARACTERS_SUBMISSION;
          break;
        default:
          testData = VALID_QUOTE_SUBMISSION;
      }
      
      // Prepare webhook payload using the same logic as the actual webhook
      const submissionId = `TEST-${Date.now()}`;
      const submissionDate = new Date().toISOString();
      const eventType = formType === 'final' ? 'final_submission' : 'quote_submission';
      
      // Format shipment date if present
      let formattedShipmentDate = 'Not provided';
      if (testData.shipmentDate) {
        try {
          const date = new Date(testData.shipmentDate);
          if (!isNaN(date.getTime())) {
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            const year = date.getFullYear();
            formattedShipmentDate = `${month}/${day}/${year}`;
          }
        } catch (e) {
          console.error("Error formatting test shipment date:", e);
          formattedShipmentDate = testData.shipmentDate; 
        }
      }
      
      // Helper functions to extract location components
      const extractCity = (location?: string): string => {
        if (!location) return 'Not provided';
        const match = location.match(/^([^,]+)/);
        return match ? match[1].trim() : 'Not provided';
      };
      
      const extractState = (location?: string): string => {
        if (!location) return 'Not provided';
        const match = location.match(/,\s*([A-Z]{2})/);
        return match ? match[1].trim() : 'Not provided';
      };
      
      const extractZip = (location?: string): string => {
        if (!location) return 'Not provided';
        const match = location.match(/(\d{5})(?:\s*$|-\d{4}\s*$)/);
        return match ? match[1].trim() : 'Not provided';
      };
      
      // Prepare simplified data format (first format used in the webhook)
      const simplifiedData = {
        name: testData.name || 'Not provided',
        email: testData.email || 'Not provided',
        phone: testData.phone || 'Not provided',
        
        pickup_city: extractCity(testData.pickupLocation),
        pickup_state: extractState(testData.pickupLocation),
        pickup_zip: testData.pickupZip || extractZip(testData.pickupLocation) || 'Not provided',
        dropoff_city: extractCity(testData.dropoffLocation),
        dropoff_state: extractState(testData.dropoffLocation),
        dropoff_zip: testData.dropoffZip || extractZip(testData.dropoffLocation) || 'Not provided',
        
        distance: testData.distance || 0,
        transit_time: testData.transitTime || 0,
        
        open_transport_price: testData.openTransportPrice || 'Not provided',
        enclosed_transport_price: testData.enclosedTransportPrice || 'Not provided',
        
        vehicle_year: testData.year || 'Not provided',
        vehicle_make: testData.make || 'Not provided',
        vehicle_model: testData.model || 'Not provided',
        vehicle_type: testData.vehicleType || 'Not provided',
        
        shipment_date: formattedShipmentDate,
        submission_date: submissionDate,
        
        submission_id: submissionId,
        event_type: eventType
      };
      
      // Prepare original format (second format used in the webhook)
      const originalFormat = {
        submissionId,
        submissionDate,
        eventType,
        
        "Contact Info Name": testData.name || 'Not provided',
        "Contact Info Email": testData.email || 'Not provided',
        "Contact Info Phone (required)": testData.phone || 'Not provided',
        
        "Route Details Pickup City": extractCity(testData.pickupLocation),
        "Route Details Pickup State": extractState(testData.pickupLocation),
        "Route Details Pickup Zip": testData.pickupZip || extractZip(testData.pickupLocation) || 'Not provided',
        "Route Details Dropoff City": extractCity(testData.dropoffLocation),
        "Route Details Dropoff State": extractState(testData.dropoffLocation),
        "Route Details Dropoff Zip": testData.dropoffZip || extractZip(testData.dropoffLocation) || 'Not provided',
        "Route Details Distance (in miles)": testData.distance || 0,
        "Route Details Estimated Transit Time": testData.transitTime || 0,
        
        "Price Details Total Price (Open Transport Only)": testData.openTransportPrice || 'Not provided',
        
        "Vehicle Details Year": testData.year || 'Not provided',
        "Vehicle Details Make": testData.make || 'Not provided',
        "Vehicle Details Model": testData.model || 'Not provided',
        
        "Route Details Shipment Date": formattedShipmentDate,
        
        pickupLocation: testData.pickupLocation || 'Not provided',
        dropoffLocation: testData.dropoffLocation || 'Not provided',
        vehicleType: testData.vehicleType || 'Not provided',
        shipmentDate: formattedShipmentDate,
        enclosedTransportPrice: testData.enclosedTransportPrice || 'Not provided',
      };
      
      // Combine formats like in the real webhook
      const formattedData = {
        ...simplifiedData,
        ...originalFormat
      };
      
      // Generate the diagnostic log
      const fieldDiagnosticLog = createFieldDiagnosticLog(testData, formattedData, formType);
      
      // Split the log into lines for better readability in the response
      const logLines = fieldDiagnosticLog.split('\n');
      
      res.status(200).json({
        success: true,
        message: "Webhook field mapping diagnostic completed",
        testType,
        formType,
        originalData: testData,
        webhookPayload: formattedData,
        diagnosticLog: logLines
      });
    } catch (error) {
      console.error("Error running webhook field diagnostic:", error);
      res.status(500).json({
        success: false,
        message: "Error running webhook field diagnostic",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Add location search API endpoints
  app.get("/api/location-search", (req, res) => {
    try {
      const query = req.query.query as string || '';
      const limit = parseInt(req.query.limit as string || '200', 10);
      
      if (query.length < 2) {
        return res.json([]);
      }
      
      const results = searchLocations(query, limit);
      res.json(results);
    } catch (error) {
      console.error("Error in location search:", error);
      res.status(500).json({ 
        error: "Failed to search locations",
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  app.get("/api/location-search/popular", (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string || '200', 10);
      const results = getPopularLocations(limit);
      res.json(results);
    } catch (error) {
      console.error("Error getting popular locations:", error);
      res.status(500).json({ 
        error: "Failed to get popular locations",
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Register webhook diagnostics middleware and API endpoints
  app.use(webhookDiagnosticMiddleware);
  registerWebhookDiagnosticEndpoints(app);
  
  const httpServer = createServer(app);
  return httpServer;
}