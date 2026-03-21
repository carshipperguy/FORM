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
    priceUnavailable?: boolean;
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

  if (quoteData.priceUnavailable) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <img
              src="https://i.postimg.cc/wxSYD63g/Amerigo-auto-transport-logo222.png"
              className="mx-auto h-14 object-contain"
              alt="Amerigo Auto Transport"
            />
          </div>
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#002C42]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#002C42] mb-3">We've Got Your Request!</h1>
          <p className="text-gray-600 mb-6">
            Your quote request was received. One of our transport specialists will call you shortly with your exact price.
          </p>
          <div className="bg-blue-50 rounded-lg p-4 text-left mb-6">
            <p className="text-sm font-semibold text-[#002C42] mb-1">Your shipment details:</p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Vehicle:</span> {quoteData.year} {quoteData.make} {quoteData.model}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">From:</span> {quoteData.pickupLocation}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">To:</span> {quoteData.dropoffLocation}
            </p>
          </div>
          <p className="text-xs text-gray-400">
            Questions? Call us at <a href="tel:+18557246863" className="text-[#002C42] font-medium">(855) 724-6863</a>
          </p>
        </div>
      </div>
    );
  }

  return <QuoteOptions data={quoteData} />;
}