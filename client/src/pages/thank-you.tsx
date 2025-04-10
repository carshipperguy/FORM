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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-md">
        <div className="mb-4 text-center">
          <img
            src="https://i.postimg.cc/wxSYD63g/Amerigo-auto-transport-logo222.png"
            className="mx-auto h-10 object-contain bg-white rounded-lg p-2 shadow-sm"
            alt="Amerigo Auto Transport Logo" 
          />
        </div>
        <Card className="border-gray-100 shadow-lg bg-white/80 backdrop-blur-md">
          <CardContent className="pt-5 pb-4 px-4 text-center">
            <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            
            <h1 className="text-xl font-bold mb-1 text-[#1e3a8a]">Thank You!</h1>
            <p className="text-sm text-gray-600 mb-4">
              Your booking request has been received. Our team will contact you soon to confirm your vehicle transport.
            </p>
            
            {data.finalPrice && (
              <div className="bg-blue-50 p-3 rounded-lg mb-4">
                <h2 className="font-medium text-sm">Booking Summary</h2>
                <p className="text-xs text-gray-600">
                  {data.year} {data.make} {data.model}
                </p>
                <div className="text-xs text-gray-600 mb-1 flex items-center justify-center">
                  <span className="truncate max-w-[140px]">{data.pickupLocation}</span>
                  <span className="mx-1">→</span>
                  <span className="truncate max-w-[140px]">{data.dropoffLocation}</span>
                </div>
                <p className="text-lg font-bold text-[#dc2626]">{formattedPrice}</p>
              </div>
            )}
            
            {isSending ? (
              <div className="flex items-center justify-center mb-4">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <p className="text-xs text-gray-600">Sending confirmations...</p>
              </div>
            ) : (
              <>
                {(sentEmail || sentSMS) && (
                  <div className="mb-4 bg-gray-50 p-2 rounded-lg">
                    <h3 className="text-xs font-medium mb-1">Confirmations Sent:</h3>
                    <div className="flex justify-center space-x-4">
                      {sentEmail && (
                        <div className="flex items-center text-green-600">
                          <Mail className="w-3 h-3 mr-1" />
                          <span className="text-xs">Email</span>
                        </div>
                      )}
                      {sentSMS && (
                        <div className="flex items-center text-green-600">
                          <Phone className="w-3 h-3 mr-1" />
                          <span className="text-xs">SMS</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
            
            <div className="grid grid-cols-2 gap-2 mb-3">
              <Button asChild size="sm" className="text-xs py-1 h-auto bg-[#1e3a8a] hover:bg-[#0f2a63]">
                <Link href="/">Get Another Quote</Link>
              </Button>
              <Button variant="outline" size="sm" className="text-xs py-1 h-auto" onClick={handleShare}>
                <Share2 className="w-3 h-3 mr-1" /> Share Quote
              </Button>
            </div>
            
            <p className="text-xs text-gray-500">
              Military Owned • Family Operated • Proudly American
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}