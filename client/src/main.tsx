import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Attribution tracking is handled silently by the attribution-tracker module

// Dsignable deploy marker - helps verify latest version in the browser console
// If you see this line, the Form app is on the current branch build
console.log("[Dsignable] Form build active - fix/meta-pixel-dedup");

createRoot(document.getElementById("root")!).render(<App />);
