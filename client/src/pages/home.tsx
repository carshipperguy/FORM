import { useState } from "react";
import { useLocation } from "wouter";
import { QuoteForm } from "@/components/quote-form";
import { TrustBadges } from "@/components/trust-badges";
import { calculatePricing } from "@/lib/pricing";
import { calculateDistance } from "@/lib/mapquest";
import { type QuoteFormData } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [isCalculating, setIsCalculating] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const handleCalculate = async (data: QuoteFormData) => {
    setIsCalculating(true);
    try {
      // Calculate real distance using MapQuest API
      const distanceResult = await calculateDistance(data.pickupLocation, data.dropoffLocation);

      if (!distanceResult.success) {
        toast({
          title: "Error Calculating Distance",
          description: distanceResult.error || "Could not calculate distance between locations. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const pricing = calculatePricing(distanceResult.distance, data.vehicleType);

      if (pricing.message) {
        toast({
          title: "Quote Information",
          description: pricing.message,
        });
        return;
      }

      const quoteData = {
        ...data,
        openTransportPrice: pricing.openTransport,
        enclosedTransportPrice: pricing.enclosedTransport,
        transitTime: pricing.transitTime,
        distance: distanceResult.distance,
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-2 sm:p-4">
      <div className="mx-auto max-w-sm">
        <div className="text-center mb-4">
          <img
            src="https://i.postimg.cc/wxSYD63g/Amerigo-auto-transport-logo222.png"
            className="mx-auto mb-3 h-12 object-contain bg-white rounded-lg p-2 shadow-sm"
            alt="Amerigo Auto Transport Logo" 
          />
          <h1 className="text-xl font-bold text-[#1e3a8a] mb-1">
            Instant Car Shipping Quote
          </h1>
          <p className="text-xs text-gray-600">Free, no-obligation estimate - takes 30 seconds</p>
        </div>
        <div className="bg-white/80 backdrop-blur-md shadow-lg rounded-xl p-4 mb-6 border border-gray-100">
          <QuoteForm onCalculate={handleCalculate} isCalculating={isCalculating} />
        </div>
        <TrustBadges />
      </div>
    </div>
  );
}