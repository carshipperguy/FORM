import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ThankYou from "@/pages/thank-you";
import Checkout from "@/pages/checkout";
import Booking from "@/pages/booking";
import FinalQuote from "@/pages/final-quote";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/final-quote" component={FinalQuote} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/booking" component={Booking} />
      <Route path="/thank-you" component={ThankYou} />
      <Route component={NotFound} />
    </Switch>
  );
}

function ShareableUrlDisplay() {
  const replit_url = `https://${import.meta.env.REPL_SLUG}.${import.meta.env.REPL_OWNER}.repl.co`;
  return (
    <div className="bg-muted/50 p-2 text-center text-sm">
      <p>Share this quote calculator: <a href={replit_url} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">{replit_url}</a></p>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="mx-auto">
        <ShareableUrlDisplay />
        <div className="[&>*:first-child]:w-[308px] [&>*:not(:first-child)]:w-[500px] mx-auto">
          <Router />
        </div>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;