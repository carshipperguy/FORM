import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Share2 } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import MobileContainer from "@/components/MobileContainer";

export default function ThankYou() {
  const { toast } = useToast();
  const searchParams = new URLSearchParams(window.location.search);
  const data = searchParams.get("data") ? JSON.parse(decodeURIComponent(searchParams.get("data") || "{}")) : {};

  // Calculate and format the price
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(data.finalPrice || 0);

  // Generate a shareable message for quick share feature
  const shareText = `I'm shipping my ${data.year} ${data.make} ${data.model} from ${data.pickupLocation}${data.pickupZip ? ` (${data.pickupZip})` : ''} to ${data.dropoffLocation}${data.dropoffZip ? ` (${data.dropoffZip})` : ''} for ${formattedPrice}. Check out Amerigo Auto Transport!`;

  // Handle sharing functionality
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Auto Transport Quote',
          text: shareText,
          url: window.location.origin
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback for browsers that don't support navigator.share
      try {
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "Copied to clipboard",
          description: "Share text copied to clipboard!",
        });
      } catch (error) {
        console.error('Error copying to clipboard:', error);
      }
    }
  };

  return (
    <MobileContainer>
      
      <div className="p-4 bg-white">
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold text-[#002C42]">Thank You!</h1>
          <div className="flex items-center justify-center mt-1">
            <img 
              src="/amerigo-logo.png" 
              alt="Amerigo Auto Transport Logo" 
              className="h-7 mr-2"
            />
            <p className="text-xs text-gray-700">Military Owned • Family Operated</p>
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
            <Button variant="outline" className="w-full border-[#002C42] text-[#002C42]" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" /> Share Quote
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