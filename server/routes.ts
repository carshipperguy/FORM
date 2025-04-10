import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertQuoteSchema } from "@shared/schema";
import { sendConfirmationEmail, sendConfirmationSMS } from "./utils/notifications";

// Use MapQuest instead of Google Maps API as per the application code
const MAPQUEST_API_KEY = process.env.MAPQUEST_API_KEY;

async function getDistance(origin: string, destination: string): Promise<number> {
  // Use MapQuest API to get distance
  const url = `https://www.mapquestapi.com/directions/v2/route?key=${MAPQUEST_API_KEY}&from=${encodeURIComponent(
    origin
  )}&to=${encodeURIComponent(destination)}&unit=M`;

  try {
    console.log("Making MapQuest request:", url);
    const response = await fetch(url);
    const data = await response.json();

    if (data.route && data.route.distance) {
      return Math.round(data.route.distance); // Already in miles
    } else {
      throw new Error("Distance calculation failed");
    }
  } catch (error) {
    console.error("MapQuest API Error:", error);
    throw error;
  }
}

export function registerRoutes(app: Express): Server {
  app.get("/api/distance", async (req, res) => {
    const { origin, destination } = req.query;

    if (!origin || !destination) {
      return res.status(400).json({ error: "Origin and destination are required" });
    }

    try {
      const distance = await getDistance(origin as string, destination as string);
      res.json({ distance });
    } catch (error) {
      res.status(500).json({ error: "Failed to calculate distance" });
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