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

console.log('App.tsx loaded');

function Router() {
  console.log('Router component rendering');
  try {
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
  } catch (error) {
    console.error('Router error:', error);
    return <div>Router Error: {error.message}</div>;
  }
}

function App() {
  console.log('App component rendering');
  try {
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
  } catch (error) {
    console.error('App component error:', error);
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h2>Application Error</h2>
        <p>Error in App component: {error.message}</p>
      </div>
    );
  }
}

export default App;