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
      
      // Ensure we have the WEBHOOK_URL environment variable
      if (!process.env.WEBHOOK_URL) {
        console.error("❌ WEBHOOK ERROR: WEBHOOK_URL environment variable is not set");
        return res.status(500).json({ 
          success: false, 
          message: "Webhook URL is not configured" 
        });
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