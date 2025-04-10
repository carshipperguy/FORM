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
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a8a] via-[#ffffff] to-[#dc2626] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-none shadow-2xl">
        <CardContent className="pt-6 text-center">
          <div className="bg-green-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2 text-[#1e3a8a]">Thank You!</h1>
          <p className="text-gray-600 mb-6">
            Your booking request has been received. Our team will contact you soon to confirm your vehicle transport.
          </p>
          
          {data.finalPrice && (
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h2 className="font-medium">Booking Summary</h2>
              <p className="text-sm text-gray-600">
                {data.year} {data.make} {data.model}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                {data.pickupLocation} to {data.dropoffLocation}
              </p>
              <p className="text-lg font-bold text-[#dc2626]">{formattedPrice}</p>
            </div>
          )}
          
          {isSending ? (
            <div className="flex items-center justify-center mb-6">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <p className="text-sm text-gray-600">Sending confirmations...</p>
            </div>
          ) : (
            <>
              {(sentEmail || sentSMS) && (
                <div className="mb-6 bg-gray-50 p-3 rounded-lg">
                  <h3 className="text-sm font-medium mb-2">Confirmations Sent:</h3>
                  <div className="flex justify-center space-x-4">
                    {sentEmail && (
                      <div className="flex items-center text-green-600">
                        <Mail className="w-4 h-4 mr-1" />
                        <span className="text-xs">Email</span>
                      </div>
                    )}
                    {sentSMS && (
                      <div className="flex items-center text-green-600">
                        <Phone className="w-4 h-4 mr-1" />
                        <span className="text-xs">SMS</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <Button asChild className="flex-1">
              <Link href="/">Get Another Quote</Link>
            </Button>
            <Button variant="outline" className="flex-1" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" /> Share Quote
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 mt-4">
            Military Owned • Family Operated • Proudly American
          </p>
        </CardContent>
      </Card>
    </div>
  );
}