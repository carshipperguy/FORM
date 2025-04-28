import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add CORS headers to allow the form to be used in an iframe
app.use((req, res, next) => {
  // Get the request origin (or use a default value)
  const origin = req.headers.origin || "";
  
  // List of allowed domains to embed this app in an iframe
  // Includes potential production domains where this might be embedded
  const allowedOrigins = [
    // Development domains
    'http://localhost',
    'https://localhost',
    'http://127.0.0.1',
    'https://127.0.0.1',
    // Replit domains
    'https://replit.com',
    '.replit.app',
    // Client website domains
    'https://amerigoautotransport.net',
    'https://www.amerigoautotransport.net',
    // Allow the current origin in all cases
    origin
  ];
  
  // Check if the request origin is allowed or matches a wildcard pattern
  const isAllowedOrigin = allowedOrigins.some(allowedOrigin => {
    // Exact match
    if (allowedOrigin === origin) return true;
    // Wildcard match (e.g., '.replit.app' should match any replit app subdomain)
    if (allowedOrigin.startsWith('.') && origin.endsWith(allowedOrigin)) return true;
    return false;
  });
  
  // Set the appropriate CORS header based on origin validation
  if (isAllowedOrigin) {
    // Allow the specific origin that sent the request - required for credentials
    res.header('Access-Control-Allow-Origin', origin);
    
    // Log allowed CORS origin for debugging
    console.log(`CORS: Allowing origin ${origin}`);
  } else {
    // For safety, still allow the request but log it for debugging
    res.header('Access-Control-Allow-Origin', origin);
    console.log(`CORS WARNING: Allowing unrecognized origin ${origin}`);
  }
  
  // Allow credentials (cookies, authorization headers, etc.)
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Allow these HTTP methods
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  // Allow these headers
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
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

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client
  const PORT = 5000;
  server.listen(PORT, "0.0.0.0", () => {
    log(`serving on port ${PORT}`);
  });
})();
