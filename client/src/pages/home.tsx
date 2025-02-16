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

      const checkoutData = {
        ...data,
        openTransportPrice: pricing.openTransport,
        enclosedTransportPrice: pricing.enclosedTransport,
        transitTime: pricing.transitTime,
        distance: distanceResult.distance,
      };

      if (pricing.message) {
        toast({
          title: "Quote Information",
          description: pricing.message,
        });
        return;
      }

      const params = new URLSearchParams({
        data: encodeURIComponent(JSON.stringify(checkoutData)),
      });

      navigate(`/checkout?${params.toString()}`);
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
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-[800px] mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Instant Car Shipping Quote – Get a Price in 30 Seconds!
        </h1>
        <QuoteForm onCalculate={handleCalculate} isCalculating={isCalculating} />
        <TrustBadges />
      </div>
    </div>
  );
}