import { useState } from "react";
import { useLocation } from "wouter";
import { QuoteForm } from "@/components/quote-form";
import { TrustBadges } from "@/components/trust-badges";
import { calculatePrice } from "@/lib/pricing";
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
      
      // URGENT FIX: Ensure proper location format for MapQuest API
      // Strictly enforce "City, State ZIP" format (with comma between city and state)
      
      // Validate pickup location and format
      if (!data.pickupLocation || !pickupZip) {
        console.error("Missing pickup location or ZIP code");
        toast({
          title: "Missing Pickup Information",
          description: "Please select a valid pickup location with city, state and ZIP code",
          variant: "destructive",
        });
        setIsCalculating(false);
        return;
      }
      
      // Validate dropoff location and format
      if (!data.dropoffLocation || !dropoffZip) {
        console.error("Missing dropoff location or ZIP code");
        toast({
          title: "Missing Delivery Information",
          description: "Please select a valid delivery location with city, state and ZIP code",
          variant: "destructive",
        });
        setIsCalculating(false);
        return;
      }
      
      // Extract city and state from the location strings
      const pickupMatch = data.pickupLocation.match(/^([^,]+),\s*([A-Z]{2})/i);
      const dropoffMatch = data.dropoffLocation.match(/^([^,]+),\s*([A-Z]{2})/i);
      
      if (!pickupMatch || pickupMatch.length < 3) {
        console.error("Invalid pickup location format:", data.pickupLocation);
        toast({
          title: "Invalid Pickup Format",
          description: "Pickup location must be in 'City, State' format",
          variant: "destructive",
        });
        setIsCalculating(false);
        return;
      }
      
      if (!dropoffMatch || dropoffMatch.length < 3) {
        console.error("Invalid dropoff location format:", data.dropoffLocation);
        toast({
          title: "Invalid Delivery Format",
          description: "Delivery location must be in 'City, State' format",
          variant: "destructive",
        });
        setIsCalculating(false);
        return;
      }
      
      // Format locations in the exact format MapQuest expects: "City, State ZIP"
      const pickupCity = pickupMatch[1].trim();
      const pickupState = pickupMatch[2].trim().toUpperCase();
      const dropoffCity = dropoffMatch[1].trim();
      const dropoffState = dropoffMatch[2].trim().toUpperCase();
      
      // Create properly formatted location strings
      const formattedPickupLocation = `${pickupCity}, ${pickupState} ${pickupZip}`;
      const formattedDropoffLocation = `${dropoffCity}, ${dropoffState} ${dropoffZip}`;
      
      console.log("FIXED: Using properly formatted locations for MapQuest API:", {
        pickup: formattedPickupLocation,
        dropoff: formattedDropoffLocation
      });
      
      // Use our server-side API to calculate distance with properly formatted locations
      // Get the current domain to handle iframe scenarios
      const currentDomain = window.location.origin;
      
      // Use the full URL to avoid issues when embedded in an iframe
      const serverDistanceUrl = `${currentDomain}/api/distance?origin=${encodeURIComponent(formattedPickupLocation)}&destination=${encodeURIComponent(formattedDropoffLocation)}`;
      console.log("FIXED: Calling server API with exact format:", serverDistanceUrl);
      
      const serverDistanceResponse = await fetch(serverDistanceUrl, {
        // Include credentials to ensure cookies are sent even for cross-origin requests
        credentials: "include"
      });
      const serverDistanceData = await serverDistanceResponse.json();
      
      console.log("UPDATED APPROACH: Server API response:", serverDistanceData);
      
      // Convert server response to our DistanceResult format
      const distanceResult = serverDistanceData.error
        ? { success: false, error: serverDistanceData.error }
        : { success: true, distance: serverDistanceData.distance, time: serverDistanceData.time };
      
      console.log("UPDATED APPROACH: Final distance result:", distanceResult);

      if (!distanceResult.success) {
        const errorMessage = 'error' in distanceResult ? distanceResult.error : "Could not calculate distance between locations";
        console.error("Distance calculation failed:", errorMessage);
        
        // URGENT FIX: Provide more actionable error message with clear instructions
        toast({
          title: "Unable to Calculate Distance",
          description: "Please select valid locations from the dropdown menu. Both origin and destination must have city, state and ZIP code information.",
          variant: "destructive",
        });
        setIsCalculating(false);
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
      // Force lowercase for vehicle type to ensure consistent matching
      const normalizedVehicleType = typeof data.vehicleType === 'string' ? data.vehicleType.toLowerCase() : data.vehicleType;
      
      console.log("Calculating pricing with distance:", distance, "and vehicle type:", {
        original: data.vehicleType,
        normalized: normalizedVehicleType,
        isBoat: normalizedVehicleType === 'boat',
        containsBoat: typeof normalizedVehicleType === 'string' ? normalizedVehicleType.includes('boat') : false,
        typeOfVariable: typeof normalizedVehicleType
      });
      
      // DEBUG: Force a known vehicle type for testing
      console.log("*** TESTING DIRECT HARD-CODED VALUES ***");
      const flatRateTest = calculatePrice(distance, "boat");
      console.log("Flat rate test (should be $2.50/mile):", {
        boatPrice: flatRateTest,
        expectedFlatRate: Math.round(distance * 2.5)
      });
      
      // CALCULATE PRICE BASED ON VEHICLE TYPE
      let pricing;
      
      // Let the pricing library handle all cases, passing locations for Snowbird route detection
      console.log("Calling pricing function with locations:", {
        pickupLocation: data.pickupLocation,
        dropoffLocation: data.dropoffLocation
      });
      
      // Use the pricing library for all vehicle types
      pricing = calculatePrice(
        distance, 
        normalizedVehicleType, 
        new Date(), 
        data.pickupLocation, 
        data.dropoffLocation
      );
      
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
      
      // Log the full quoteData being passed to the URL
      console.log("FULL QUOTE DATA BEING PASSED:", JSON.stringify(quoteData, null, 2));

      // Send initial form data to webhook - this is the ONLY place in the app that calls the webhook
      // Only happens when user clicks "Get Instant Quote" button
      console.log("⚡ SENDING INITIAL QUOTE DATA TO WEBHOOK - This is the only webhook call in the app");
      
      try {
        const webhookData = {
          ...quoteData,
          eventType: "quote_submission",
          eventDate: new Date().toISOString()
        };
        
        // Use await to ensure we catch any errors properly but don't block the UI
        (async () => {
          // Flag to track if retry has been attempted
          let retryAttempted = false;
          
          // Function to handle sending webhook data with retry capability
          const sendWebhookData = async (isRetry = false) => {
            try {
              if (isRetry) {
                console.log("⚡ RETRY: SENDING WEBHOOK DATA (COLD START RECOVERY)");
              } else {
                console.log("⚡ SENDING WEBHOOK DATA:", JSON.stringify(webhookData, null, 2));
              }
              
              // Get the current domain to handle iframe scenarios
              const currentDomain = window.location.origin;
              
              // Use the full URL to avoid issues when embedded in an iframe
              const apiUrl = `${currentDomain}/api/webhook`;
              console.log(`Using webhook API URL${isRetry ? " (retry)" : ""}:`, apiUrl);
              
              // Add a unique timestamp to prevent caching issues during retry
              const uniqueWebhookData = isRetry ? {
                ...webhookData,
                retryTimestamp: Date.now(),
                isRetry: true
              } : webhookData;
              
              // Set a timeout to prevent hanging request
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
              
              const webhookResponse = await fetch(apiUrl, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Accept": "application/json"
                },
                // Include credentials to ensure cookies are sent even for cross-origin requests
                credentials: "include",
                body: JSON.stringify(uniqueWebhookData),
                signal: controller.signal
              });
              
              clearTimeout(timeoutId);
              
              try {
                // Try to parse the response JSON
                const responseData = await webhookResponse.json();
                
                if (webhookResponse.ok || responseData.success) {
                  console.log(`⚡ WEBHOOK ${isRetry ? "RETRY " : ""}SENT SUCCESSFULLY`);
                  if (isRetry) {
                    console.log("⚡ COLD START RECOVERY SUCCESSFUL");
                  }
                  return true; // Success
                } else {
                  console.warn(`⚡ WEBHOOK ${isRetry ? "RETRY " : ""}RETURNED ERROR:`, responseData);
                  return false; // Failed but got a response
                }
              } catch (jsonError) {
                // If we can't parse JSON, just check the response status
                if (webhookResponse.ok) {
                  console.log(`⚡ WEBHOOK ${isRetry ? "RETRY " : ""}SENT SUCCESSFULLY (no JSON response)`);
                  return true; // Success
                } else {
                  console.error(`⚡ WEBHOOK ${isRetry ? "RETRY " : ""}ERROR:`, webhookResponse.status, webhookResponse.statusText);
                  return false; // Failed
                }
              }
            } catch (webhookError) {
              console.error(`⚡ ERROR ${isRetry ? "RETRYING" : "SENDING"} DATA TO WEBHOOK:`, webhookError);
              return false; // Failed
            }
          };
          
          // First attempt
          const initialResult = await sendWebhookData();
          
          // If first attempt fails or times out, retry once after delay
          if (!initialResult && !retryAttempted) {
            console.log("⚡ WEBHOOK FAILED - SCHEDULING RETRY IN 2 SECONDS");
            retryAttempted = true;
            
            // Wait 2 seconds before retrying to allow cold start completion
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Retry the webhook submission
            await sendWebhookData(true);
          }
          
          // Continue with the quote process regardless of webhook success
          // This ensures users can still get quotes even if CRM integration has issues
        })();
      } catch (error) {
        console.error("⚡ ERROR PREPARING WEBHOOK DATA:", error);
      }

      const params = new URLSearchParams({
        data: encodeURIComponent(JSON.stringify(quoteData)),
      });

      navigate(`/final-quote?${params.toString()}`);
    } catch (error) {
      console.error("Calculation error:", error);
      
      // URGENT FIX: More detailed error message for general calculation failures
      toast({
        title: "Quote Calculation Error",
        description: "We couldn't calculate your shipping quote. Please ensure both locations include city, state (like 'New York, NY') and ZIP code. Try selecting from the dropdown menu.",
        variant: "destructive",
      });
      setIsCalculating(false);
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