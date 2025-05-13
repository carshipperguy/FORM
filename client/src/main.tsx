import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Preload critical modules in the background
// This improves perceived performance by having modules ready when needed
const preloadModules = async () => {
  try {
    // Pricing module is critical for quote calculations
    const pricingModule = await import('./lib/pricing');
    console.log('Pricing module preloaded successfully');
    
    // Preload API client
    await import('./lib/api');
  } catch (err) {
    // Silent fail - preloading is an optimization, not a requirement
    console.warn('Module preloading encountered an issue:', err);
  }
};

// Start preloading in the background without blocking initial render
preloadModules();

// Render the application
createRoot(document.getElementById("root")!).render(<App />);
