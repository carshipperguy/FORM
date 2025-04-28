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

// Define an iframe test component
const IframeTest = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-blue-900 mb-6">Amerigo Auto Transport - Iframe Embedding Test</h1>
      
      <div className="bg-blue-50 border-l-4 border-blue-900 p-4 mb-6">
        <p className="font-semibold">This test page demonstrates how the auto transport quote calculator works when embedded in an iframe.</p>
        <p>The iframe below is loading the application from the same domain, but in production it would be embedded on the client's WordPress site.</p>
      </div>
      
      <div className="flex flex-wrap gap-4">
        <div className="w-full md:w-[320px] bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-bold text-blue-900 mb-4">Mobile View (308px width)</h2>
          <div className="border border-gray-300 p-2 bg-white">
            <iframe src="/" style={{width: '308px', height: '600px', border: '1px solid #ccc'}}></iframe>
          </div>
        </div>
        
        <div className="flex-1 min-w-0 md:min-w-[600px] bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-bold text-blue-900 mb-4">Responsive View</h2>
          <div className="border border-gray-300 p-2 bg-white">
            <iframe src="/" style={{width: '100%', height: '600px', border: '1px solid #ccc'}}></iframe>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 border-l-4 border-blue-900 p-4 mt-6">
        <p className="font-semibold">Technical Details:</p>
        <ul className="list-disc pl-6 mt-2">
          <li>All fetch requests are made with <code className="bg-gray-100 px-1 rounded">credentials: 'include'</code></li>
          <li>CORS headers are configured to allow iframe embedding</li>
          <li>All URLs are absolute using window.location.origin</li>
          <li>No references to window.parent to maintain iframe independence</li>
        </ul>
      </div>
    </div>
  );
};

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
      <Route path="/iframe-test" component={IframeTest} />
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
