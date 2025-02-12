import { useState } from "react";
import { useLocation } from "wouter";
import { QuoteForm } from "@/components/quote-form";
import { calculatePricing } from "@/lib/pricing";
import { type QuoteFormData } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [isCalculating, setIsCalculating] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const handleCalculate = async (data: QuoteFormData) => {
    setIsCalculating(true);
    try {
      // TODO: Replace with actual distance calculation
      const distance = 1000; // Mock distance for testing
      const pricing = calculatePricing(distance, data.vehicleType);

      const checkoutData = {
        ...data,
        openTransportPrice: pricing.openTransport,
        enclosedTransportPrice: pricing.enclosedTransport,
        transitTime: pricing.transitTime,
        distance,
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
        description: "Failed to calculate the quote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-[800px] mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          Get Your Auto Transport Quote
        </h1>
        <QuoteForm onCalculate={handleCalculate} isCalculating={isCalculating} />
      </div>
    </div>
  );
}