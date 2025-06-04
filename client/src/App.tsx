import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";

import NotFound from "./pages/not-found";
import Home from "./pages/home";
import ThankYou from "./pages/thank-you";
import Checkout from "./pages/checkout";
import Booking from "./pages/booking-new";
import FinalQuote from "./pages/final-quote";
import SimpleQuote from "./pages/simple-quote";
import TestMapQuest from "./pages/test-mapquest";
import EmbeddingInstructions from "./pages/embedding-instructions";

function Router() {
  return (
    <Switch>
      <Route path="/" component={SimpleQuote} />
      <Route path="/home" component={Home} />
      <Route path="/final-quote" component={FinalQuote} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/booking" component={Booking} />
      <Route path="/thank-you" component={ThankYou} />
      <Route path="/test-mapquest" component={TestMapQuest} />
      <Route path="/embedding-instructions" component={EmbeddingInstructions} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background font-sans antialiased">
        <div className="relative flex min-h-screen flex-col">
          <div className="flex-1">
            <Router />
          </div>
        </div>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;