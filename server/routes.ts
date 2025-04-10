import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertQuoteSchema } from "@shared/schema";
import { sendConfirmationEmail, sendConfirmationSMS } from "./utils/notifications";

// Use MapQuest instead of Google Maps API as per the application code
const MAPQUEST_API_KEY = process.env.MAPQUEST_API_KEY;

async function getDistance(origin: string, destination: string): Promise<{distance: number, time?: string}> {
  // Use MapQuest API to get distance
  const url = `https://www.mapquestapi.com/directions/v2/route?key=${MAPQUEST_API_KEY}&from=${encodeURIComponent(
    origin
  )}&to=${encodeURIComponent(destination)}&unit=M`;

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
      const quoteData = insertQuoteSchema.parse(req.body);
      const quote = await storage.createQuote(quoteData);
      res.json(quote);
    } catch (error) {
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
      
      // Store the quote in the database
      try {
        // Add fields needed for database storage
        const storeableQuote = {
          ...quoteDetails,
          email: email || null,
          phone: phone || null
        };
        
        await storage.createQuote(storeableQuote);
      } catch (error) {
        console.error("Error storing quote:", error);
        // Continue even if storage fails - we want to prioritize notification
      }
      
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
        sms: false
      };
      
      // Send email if provided
      if (email) {
        results.email = await sendConfirmationEmail(email, bookingDetails);
      }
      
      // Send SMS if provided
      if (phone) {
        results.sms = await sendConfirmationSMS(phone, bookingDetails);
      }
      
      res.json({
        success: results.email || results.sms,
        emailSent: results.email,
        smsSent: results.sms
      });
    } catch (error) {
      console.error("Error sending confirmations:", error);
      res.status(500).json({ error: "Failed to send confirmations" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}