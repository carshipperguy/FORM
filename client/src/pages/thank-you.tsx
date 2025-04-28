import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { Link } from "wouter";
import MobileContainer from "@/components/MobileContainer";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ThankYou() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionComplete, setSubmissionComplete] = useState(false);
  
  const searchParams = new URLSearchParams(window.location.search);
  const data = searchParams.get("data") ? JSON.parse(decodeURIComponent(searchParams.get("data") || "{}")) : {};

  // Calculate and format the price
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(data.finalPrice || 0);
  
  // Send final submission to our order webhook when the component mounts
  useEffect(() => {
    async function sendFinalSubmission() {
      if (!data || submissionComplete || isSubmitting) return;
      
      try {
        setIsSubmitting(true);
        console.log("🚗 ThankYou page - Sending final order submission to webhook");
        console.log("📦 Order data:", data);
        
        // Add the specific event type for final submissions and preserve attribution data for CRM tracking
        const finalData = {
          ...data,
          eventType: "final_submission",
          submissionTime: new Date().toISOString(),
          // Preserve attribution parameters for CRM/lead source tracking (not for Meta CAPI)
          fbclid: data.fbclid || null,
          utm_source: data.utm_source || null,
          utm_medium: data.utm_medium || null,
          utm_campaign: data.utm_campaign || null,
          utm_term: data.utm_term || null,
          utm_content: data.utm_content || null,
          referrer: data.referrer || null
        };
        
        // Get the current domain to handle iframe scenarios
        const currentDomain = window.location.origin;
        console.log("Current domain for API request:", currentDomain);
        
        // Use the full URL to avoid issues when embedded in an iframe
        const apiUrl = `${currentDomain}/api/final-submission`;
        console.log("Using API URL:", apiUrl);
        
        // Send the complete order data to the final-submission endpoint
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store"
          },
          // Include credentials to ensure cookies are sent even for cross-origin requests
          credentials: "include",
          body: JSON.stringify(finalData)
        });
        
        console.log("📡 Final submission response status:", response.status);
        
        if (response.ok) {
          const responseData = await response.json();
          console.log("✅ Final submission successful:", responseData);
          setSubmissionComplete(true);
        } else {
          const errorText = await response.text();
          console.error("❌ Final submission error:", errorText);
          console.error("❌ Error status:", response.status);
        }
      } catch (error) {
        console.error("❌ Final submission request failed:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
    
    sendFinalSubmission();
  }, [data, submissionComplete, isSubmitting]);

  return (
    <MobileContainer>
      
      <div className="p-4 bg-white">
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold text-[#002C42]">Thank You!</h1>
          <div className="flex flex-col items-center justify-center mt-1">
            <img
              src="https://amerigoautotransport.net/wp-content/uploads/2024/09/Amerigo-auto-transport-logo.png"
              alt="Amerigo Auto Transport Logo"
              style={{
                width: '160px',
                display: 'block',
                margin: '0 auto',
                maxWidth: '100%',
                height: 'auto',
                objectFit: 'contain'
              }}
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/160x60?text=Amerigo+Logo';
              }}
            />
          </div>
        </div>
        
        <div className="bg-white text-black border border-gray-200 mb-4">
          <div className="bg-green-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mt-4 mb-3">
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
          
          <div className="text-center mb-4 px-3">
            <h2 className="text-lg font-semibold text-[#002C42] mb-1">Booking Confirmed</h2>
            <p className="text-sm text-gray-600">
              Your booking request has been received. Our team will contact you shortly.
            </p>
          </div>
          
          {data.finalPrice && (
            <div className="bg-gray-50 p-3 border-t border-b border-gray-200 mb-4">
              <h3 className="font-medium text-[#002C42] mb-2 text-sm">Booking Summary</h3>
              <div className="space-y-1 text-sm">
                <div>
                  <span className="font-medium">Vehicle:</span> {data.year} {data.make} {data.model}
                </div>
                <div>
                  <span className="font-medium">From:</span> {data.pickupLocation}
                  {data.pickupZip && <span className="ml-1 text-gray-600">(ZIP: {data.pickupZip})</span>}
                </div>
                <div>
                  <span className="font-medium">To:</span> {data.dropoffLocation}
                  {data.dropoffZip && <span className="ml-1 text-gray-600">(ZIP: {data.dropoffZip})</span>}
                </div>
                <div>
                  <span className="font-medium">Price:</span> <span className="text-base font-bold text-green-600">{formattedPrice}</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex flex-col p-3 gap-3 mb-3">
            <Button asChild className="bg-[#002C42] hover:bg-[#001C32] w-full">
              <Link href="/">Get Another Quote</Link>
            </Button>
          </div>
        </div>
        
        <p className="text-center text-xs text-gray-600 mb-4">
          Thank you for choosing Amerigo Auto Transport!
        </p>
      </div>
    </MobileContainer>
  );
}