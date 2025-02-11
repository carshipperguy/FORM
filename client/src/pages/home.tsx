import { useState } from "react";
import { useLocation } from "wouter";
import { QuoteForm } from "@/components/quote-form";
import { calculatePricing } from "@/lib/pricing";
import { type QuoteFormData } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

async function getDistance(origin: string, destination: string): Promise<number> {
  const response = await fetch(`/api/distance?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`);
  if (!response.ok) {
    throw new Error("Failed to calculate distance");
  }
  const data = await response.json();
  return data.distance;
}

export default function Home() {
  const [isCalculating, setIsCalculating] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const handleCalculate = async (data: QuoteFormData) => {
    setIsCalculating(true);
    try {
      const distance = await getDistance(data.pickupLocation, data.dropoffLocation);
      const pricing = calculatePricing(distance, data.vehicleType);

      if (data.vehicleType !== "car/truck/suv") {
        navigate("/thank-you");
        return;
      }

      const checkoutData = {
        ...data,
        openTransportPrice: pricing.openTransport,
        enclosedTransportPrice: pricing.enclosedTransport,
        transitTime: pricing.transitTime,
        distance,
      };

      const params = new URLSearchParams({
        data: encodeURIComponent(JSON.stringify(checkoutData)),
      });

      navigate(`/checkout?${params.toString()}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to calculate the quote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="bg-background">
      <QuoteForm onCalculate={handleCalculate} isCalculating={isCalculating} />
    </div>
  );
}