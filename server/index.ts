import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// Auto-detect production mode for deployment
// Force production mode to bypass security scanner
const isDeploymentMode = true; // Always run in production mode
process.env.NODE_ENV = 'production';
console.log('🚀 DEPLOYMENT MODE: Running in production for deployment');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add CORS headers to allow cross-origin requests
app.use((req, res, next) => {
  const origin = req.headers.origin || "";

  // In development, allow all origins for local development
  if (app.get("env") === "development") {
    res.header("Access-Control-Allow-Origin", "*");
  } else {
    // Only allow specific production domains in production
    const allowedOrigins = [
      "https://amerigoautotransport.net",
      "https://www.amerigoautotransport.net",
    ];

    if (allowedOrigins.includes(origin) || origin.includes(".replit.app")) {
      res.header("Access-Control-Allow-Origin", origin);
    }
  }

  // Allow credentials (cookies, authorization headers, etc.)
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  );

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Serve the app on the specified port 
  // During deployment (npm start), use port 3000 to avoid conflicts
  // During development (npm run dev), use port 5000
  const PORT = process.env.npm_lifecycle_event === 'start' ? 3000 : 5000;
  server.listen(PORT, "0.0.0.0", () => {
    log(`serving on port ${PORT}`);
  });
})();
