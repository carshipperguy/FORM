import { useState } from "react";
import { useLocation } from "wouter";
import { QuoteForm } from "@/components/quote-form";
import { PriceDisplay } from "@/components/price-display";
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
  const [prices, setPrices] = useState<{
    openTransport: number;
    enclosedTransport: number;
    transitTime: number;
  } | null>(null);
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

      setPrices(pricing);
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

  const handleReserve = async (type: "open" | "enclosed") => {
    navigate("/thank-you");
  };

  return (
    <div className="bg-background">
      <QuoteForm onCalculate={handleCalculate} isCalculating={isCalculating} />
      {prices && <PriceDisplay {...prices} onReserve={handleReserve} />}
    </div>
  );
}