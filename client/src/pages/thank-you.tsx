import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, Share2, Mail, Phone } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

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
  const shareText = `I'm shipping my ${data.year} ${data.make} ${data.model} from ${data.pickupLocation} to ${data.dropoffLocation} for ${formattedPrice}. Check out Amerigo Auto Transport!`;

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
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a8a] via-[#ffffff] to-[#dc2626] text-black px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#1e3a8a] drop-shadow-md">Thank You!</h1>
          <p className="text-sm text-gray-700 mt-2">Military Owned • Family Operated • Proudly American</p>
        </div>
        
        <div className="bg-white text-black rounded-2xl p-5 shadow-xl border border-gray-200 max-w-2xl mx-auto">
          <div className="bg-green-50 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-8 h-8 md:w-10 md:h-10 text-green-500" />
          </div>
          
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-[#1e3a8a] mb-2">Booking Confirmed</h2>
            <p className="text-gray-600">
              Your booking request has been received. Our team will contact you soon to confirm your vehicle transport.
            </p>
          </div>
          
          {data.finalPrice && (
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h3 className="font-medium text-[#1e3a8a] mb-3">Booking Summary</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Vehicle:</span> {data.year} {data.make} {data.model}
                </div>
                <div>
                  <span className="font-medium">From:</span> {data.pickupLocation}
                </div>
                <div>
                  <span className="font-medium">To:</span> {data.dropoffLocation}
                </div>
                <div>
                  <span className="font-medium">Price:</span> <span className="text-lg font-bold text-[#dc2626]">{formattedPrice}</span>
                </div>
              </div>
            </div>
          )}
          
          {isSending ? (
            <div className="flex items-center justify-center mb-6 p-3 bg-gray-50 rounded-lg">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <p className="text-gray-600">Sending confirmations...</p>
            </div>
          ) : (
            <>
              {(sentEmail || sentSMS) && (
                <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Confirmations Sent:</h3>
                  <div className="flex justify-center space-x-6">
                    {sentEmail && (
                      <div className="flex items-center text-green-600">
                        <Mail className="w-4 h-4 mr-2" />
                        <span>Email</span>
                      </div>
                    )}
                    {sentSMS && (
                      <div className="flex items-center text-green-600">
                        <Phone className="w-4 h-4 mr-2" />
                        <span>SMS</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-4">
            <Button asChild className="bg-[#1e3a8a] hover:bg-[#0f2a63] rounded-full px-6">
              <Link href="/">Get Another Quote</Link>
            </Button>
            <Button variant="outline" className="rounded-full" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" /> Share Quote
            </Button>
          </div>
        </div>
        
        <p className="text-center text-xs text-gray-800 mt-6">
          Note: You will receive a confirmation email with your booking details and next steps.
        </p>
      </div>
    </div>
  );
}