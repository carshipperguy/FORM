import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { type QuoteFormData } from "@shared/schema";
// @ts-ignore - This is a JSX file being imported into a TSX file
import QuoteOptions from "@/components/QuoteOptions";
import { Loader2 } from "lucide-react";

export default function FinalQuote() {
  const [, navigate] = useLocation();
  const [quoteData, setQuoteData] = useState<QuoteFormData & {
    openTransportPrice: number;
    enclosedTransportPrice: number;
    transitTime: number;
    distance: number;
    pickupZip?: string;
    dropoffZip?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      let parsed: any | null = null;
      
      // 🔧 SAFE STORAGE ACCESS: Wrap in try/catch to handle blocked sessionStorage
      let stored: string | null = null;
      try {
        // Prefer sessionStorage to avoid putting PII in the URL
        stored = sessionStorage.getItem('quote_data');
      } catch (storageError) {
        console.warn('⚠️ SessionStorage read blocked, using URL fallback:', storageError);
        // stored remains null, will trigger URL fallback below
      }
      
      // 🔧 FALLBACK ACTIVATION: If storage is null/blocked, check URL params
      if (!stored) {
        // Fallback: legacy URL param (for backward compatibility only)
        const searchParams = new URLSearchParams(window.location.search);
        const encodedData = searchParams.get("data");
        if (!encodedData) {
          navigate("/");
          return;
        }
        console.log("Raw encoded URL data:", encodedData);
        const decodedURI = decodeURIComponent(encodedData);
        console.log("Decoded URI:", decodedURI);
        parsed = JSON.parse(decodedURI);
        setQuoteData(parsed);
      } else {
        parsed = JSON.parse(stored);
        // 🔍 CRITICAL DIAGNOSTIC: Log what was retrieved from sessionStorage
        console.log("🔍 DISTANCE RETRIEVED FROM SESSIONSTORAGE:", parsed.distance);
        console.log("🔍 PRICES RETRIEVED FROM SESSIONSTORAGE:", {
          openTransportPrice: parsed.openTransportPrice,
          enclosedTransportPrice: parsed.enclosedTransportPrice
        });
        setQuoteData(parsed);
        // Best effort cleanup
        try { sessionStorage.removeItem('quote_data'); } catch (_) {}
      }
      
      // Debug check for the distance value
      if (parsed && parsed.distance) {
        console.log("🔍 DISTANCE VALUE CHECK:", {
          distanceValue: parsed.distance,
          distanceType: typeof parsed.distance,
          isExactly1200: parsed.distance === 1200,
          pickupLocation: parsed.pickupLocation,
          dropoffLocation: parsed.dropoffLocation
        });
      } else {
        console.warn("⚠️ NO DISTANCE FOUND IN QUOTE DATA");
      }
      
      // Validate required properties (allow 0; only block null/undefined)
      if (
        !parsed ||
        parsed.openTransportPrice == null ||
        parsed.enclosedTransportPrice == null
      ) {
        console.error("Missing required price data");
        navigate("/");
        return;
      }
      
      console.log("DECODED FINAL QUOTE DATA:", JSON.stringify(parsed, null, 2));
    } catch (error) {
      console.error("Error parsing quote data:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#1E3A4C]" />
          <p className="mt-4 text-gray-600">Calculating your quote...</p>
        </div>
      </div>
    );
  }

  if (!quoteData) {
    navigate("/");
    return null;
  }

  return <QuoteOptions data={quoteData} />;
}