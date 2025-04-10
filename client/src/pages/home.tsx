import { useState } from "react";
import { useLocation } from "wouter";
import { QuoteForm } from "@/components/quote-form";
import { TrustBadges } from "@/components/trust-badges";
import { calculatePricing } from "@/lib/pricing";
import { calculateDistance } from "@/lib/mapquest";
import { type QuoteFormData } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// Function to extract ZIP code from a location string
function extractZipFromLocation(location: string): string {
  // Look for a 5-digit ZIP code pattern, optionally followed by a dash and 4 more digits
  const zipPattern = /\b(\d{5}(-\d{4})?)\b/;
  const match = location.match(zipPattern);
  return match ? match[1] : "";
}

export default function Home() {
  const [isCalculating, setIsCalculating] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const handleCalculate = async (data: QuoteFormData) => {
    setIsCalculating(true);
    try {
      // Get ZIP codes from form data or extract from locations if not available
      const pickupZip = data.pickupZip || extractZipFromLocation(data.pickupLocation);
      const dropoffZip = data.dropoffZip || extractZipFromLocation(data.dropoffLocation);
      
      console.log("Home handleCalculate - Form Data:", JSON.stringify(data, null, 2));
      console.log("Home handleCalculate - Using ZIP codes:", { pickupZip, dropoffZip });
      
      // Format locations in a simpler format that's guaranteed to work with MapQuest API
      // MapQuest prefers "City, State ZIP" format or "City, State" without commas in the city name
      let pickupLocation = data.pickupLocation.trim();
      let dropoffLocation = data.dropoffLocation.trim();
      
      // Make sure pickup location has a state code (2-letter)
      if (!/,\s*[A-Z]{2}/i.test(pickupLocation)) {
        console.log("Pickup location missing state code, cannot proceed with MapQuest API");
        toast({
          title: "Invalid Pickup Location",
          description: "Please select a location with city and state (e.g., 'Los Angeles, CA')",
          variant: "destructive",
        });
        return;
      }
      
      // Make sure dropoff location has a state code (2-letter)
      if (!/,\s*[A-Z]{2}/i.test(dropoffLocation)) {
        console.log("Dropoff location missing state code, cannot proceed with MapQuest API");
        toast({
          title: "Invalid Dropoff Location",
          description: "Please select a location with city and state (e.g., 'Los Angeles, CA')",
          variant: "destructive",
        });
        return;
      }
      
      console.log("Using simplified location format for MapQuest API:", {
        pickup: pickupLocation,
        dropoff: dropoffLocation
      });
      
      // Calculate real distance using MapQuest API
      console.log("Calling MapQuest API with locations:", { 
        pickup: pickupLocation, 
        dropoff: dropoffLocation 
      });
      
      // Use the simplified location format
      const distanceResult = await calculateDistance(pickupLocation, dropoffLocation);
      console.log("MapQuest API result:", distanceResult);

      if (!distanceResult.success) {
        const errorMessage = 'error' in distanceResult ? distanceResult.error : "Could not calculate distance between locations";
        console.error("Distance calculation failed:", errorMessage);
        
        toast({
          title: "Location Error",
          description: "Please verify both pickup and delivery locations are valid cities with state codes (e.g., 'Los Angeles, CA'). Try entering just the city and state without ZIP codes.",
          variant: "destructive",
        });
        return;
      }

      // TypeScript check: If we're here, the distanceResult is successful and has a distance property
      if (!('distance' in distanceResult)) {
        // This should never happen since we already checked success above,
        // but we need this check to satisfy the TypeScript compiler
        console.error("Unexpected error: successful distance result without distance property");
        toast({
          title: "Error Calculating Distance",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      const distance = distanceResult.distance;
      console.log("Calculating pricing with distance:", distance, "and vehicle type:", data.vehicleType);
      
      const pricing = calculatePricing(distance, data.vehicleType);
      console.log("Pricing calculation result:", pricing);

      if (pricing.message) {
        toast({
          title: "Quote Information",
          description: pricing.message,
        });
        return;
      }

      const quoteData = {
        ...data,
        // Store ZIP codes explicitly
        pickupZip,
        dropoffZip,
        openTransportPrice: pricing.openTransport,
        enclosedTransportPrice: pricing.enclosedTransport,
        transitTime: pricing.transitTime,
        distance: distance,
      };

      const params = new URLSearchParams({
        data: encodeURIComponent(JSON.stringify(quoteData)),
      });

      navigate(`/final-quote?${params.toString()}`);
    } catch (error) {
      console.error("Calculation error:", error);
      toast({
        title: "Error",
        description: "Failed to calculate the quote. Please check your location inputs and try again.",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-2 sm:p-4 md:p-6 lg:p-8">
      <div className="form-container">
        <div className="text-center mb-4 md:mb-6">
          <img
            src="https://i.postimg.cc/wxSYD63g/Amerigo-auto-transport-logo222.png"
            className="mx-auto mb-3 md:mb-4 h-12 md:h-14 lg:h-16 object-contain bg-white rounded-lg p-2 shadow-sm"
            alt="Amerigo Auto Transport Logo" 
          />
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#1e3a8a] mb-1 md:mb-2">
            Instant Car Shipping Quote
          </h1>
          <p className="text-xs md:text-sm lg:text-base text-gray-600">Free, no-obligation estimate - takes 30 seconds</p>
        </div>
        <div className="bg-white/80 backdrop-blur-md shadow-lg rounded-xl p-4 md:p-6 lg:p-8 mb-6 md:mb-8 border border-gray-100">
          <QuoteForm onCalculate={handleCalculate} isCalculating={isCalculating} />
        </div>
        <TrustBadges />
      </div>
    </div>
  );
}