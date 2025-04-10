import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, Share2, Mail, Phone } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import MobileContainer from "@/components/MobileContainer";

export default function ThankYou() {
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  const [sentEmail, setSentEmail] = useState(false);
  const [sentSMS, setSentSMS] = useState(false);
  const searchParams = new URLSearchParams(window.location.search);
  const data = searchParams.get("data") ? JSON.parse(decodeURIComponent(searchParams.get("data") || "{}")) : {};

  useEffect(() => {
    async function sendConfirmations() {
      if (data.email || data.phone) {
        setIsSending(true);
        try {
          const response = await apiRequest("POST", '/api/send-confirmations', data);
          const result = await response.json();
          
          if (result.emailSent) {
            setSentEmail(true);
          }
          
          if (result.smsSent) {
            setSentSMS(true);
          }
          
          if (!result.success) {
            throw new Error('Failed to send confirmations');
          }
        } catch (error) {
          console.error("Error sending confirmations:", error);
          toast({
            title: "Notice",
            description: "We'll send your confirmation details shortly.",
            variant: "default",
          });
        } finally {
          setIsSending(false);
        }
      }
    }

    sendConfirmations();
  }, [data, toast]);

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
          <p className="text-xs text-gray-700 mt-1">Military Owned • Family Operated</p>
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
          
          {isSending ? (
            <div className="flex items-center justify-center mb-4 p-2 bg-gray-50 border-t border-b border-gray-200">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              <p className="text-sm text-gray-600">Sending confirmations...</p>
            </div>
          ) : (
            <>
              {(sentEmail || sentSMS) && (
                <div className="mb-4 p-3 bg-gray-50 border-t border-b border-gray-200">
                  <h3 className="font-medium text-sm mb-2">Confirmations Sent:</h3>
                  <div className="flex justify-center space-x-6">
                    {sentEmail && (
                      <div className="flex items-center text-green-600">
                        <Mail className="w-4 h-4 mr-1" />
                        <span className="text-sm">Email</span>
                      </div>
                    )}
                    {sentSMS && (
                      <div className="flex items-center text-green-600">
                        <Phone className="w-4 h-4 mr-1" />
                        <span className="text-sm">SMS</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
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
          You will receive a confirmation email with your booking details.
        </p>
      </div>
    </MobileContainer>
  );
}