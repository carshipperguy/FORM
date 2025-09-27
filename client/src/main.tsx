import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// 🚨 ATTRIBUTION DEBUG - Log incoming URL parameters 
console.log("[ATTRIBUTION DEBUG] window.location.search =", window.location.search);
console.log("[ATTRIBUTION DEBUG] Full URL =", window.location.href);

createRoot(document.getElementById("root")!).render(<App />);
