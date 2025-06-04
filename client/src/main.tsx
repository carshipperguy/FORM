import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log('Main.tsx starting...');

// Render the application immediately
try {
  const rootElement = document.getElementById("root");
  console.log('Root element found:', !!rootElement);
  
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  
  console.log('Creating React root...');
  const root = createRoot(rootElement);
  
  console.log('Rendering App component...');
  root.render(<App />);
  
  console.log('React app rendered successfully');
} catch (error) {
  console.error('Error rendering React app:', error);
  
  // Fallback error display
  const rootElement = document.getElementById("root");
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; color: red; font-family: Arial;">
        <h2>App Loading Error</h2>
        <p>Failed to load the application: ${errorMessage}</p>
        <p>Please refresh the page or contact support.</p>
      </div>
    `;
  }
}

// Preload critical modules in the background after render
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
