import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Attribution tracking is handled silently by the attribution-tracker module

createRoot(document.getElementById("root")!).render(<App />);
