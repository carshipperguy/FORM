import SimpleQuoteForm from "./components/SimpleQuoteForm";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import "./index.css";

export default function EmergencyApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="simple-quote-page">
        <SimpleQuoteForm />
      </div>
    </QueryClientProvider>
  );
}