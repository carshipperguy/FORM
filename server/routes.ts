import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

async function getDistance(origin: string, destination: string): Promise<number> {
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
    origin
  )}&destinations=${encodeURIComponent(destination)}&key=${GOOGLE_MAPS_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.rows[0].elements[0].status === "OK") {
      return Math.round(data.rows[0].elements[0].distance.value / 1609.34); // Convert meters to miles
    } else {
      throw new Error("Distance calculation failed");
    }
  } catch (error) {
    console.error("Google Maps API Error:", error);
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

  const httpServer = createServer(app);
  return httpServer;
}
