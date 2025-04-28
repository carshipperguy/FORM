import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ThankYou from "@/pages/thank-you";
import Checkout from "@/pages/checkout";
import Booking from "@/pages/booking-new";
import FinalQuote from "@/pages/final-quote";
import SimpleQuote from "@/pages/simple-quote";
import TestMapQuest from "@/pages/test-mapquest";
import EmbeddingInstructions from "@/pages/embedding-instructions";
import { logIframeDebugInfo, isRunningInIframe } from "./lib/iframe-utils";
import { useEffect } from "react";

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
  // Log iframe debug info on component mount
  useEffect(() => {
    // Check if running in iframe and log environment information
    logIframeDebugInfo();
    
    // Log that the app is iframe-ready
    console.log('🚀 App initialized with iframe compatibility');
    
    // Add listener for messages from parent frame (if in iframe)
    if (isRunningInIframe()) {
      const handleMessage = (event: MessageEvent) => {
        // Only process messages we expect
        if (event.data && typeof event.data === 'object' && event.data.type === 'FROM_PARENT') {
          console.log('📨 Received message from parent frame:', event.data);
        }
      };
      
      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }
  }, []);

  // Add a class to the body if running in iframe
  useEffect(() => {
    if (isRunningInIframe()) {
      document.body.classList.add('in-iframe');
    } else {
      document.body.classList.add('standalone-app');
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="mx-auto">
        <div className="mx-auto">
          <Router />
        </div>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
