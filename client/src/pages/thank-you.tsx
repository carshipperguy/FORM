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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8">
      <div className="w-full form-container">
        <div className="mb-4 md:mb-6 text-center">
          <img
            src="https://i.postimg.cc/wxSYD63g/Amerigo-auto-transport-logo222.png"
            className="mx-auto h-10 md:h-12 lg:h-16 object-contain bg-white rounded-lg p-2 shadow-sm"
            alt="Amerigo Auto Transport Logo" 
          />
        </div>
        <Card className="border-gray-100 shadow-lg bg-white/80 backdrop-blur-md">
          <CardContent className="pt-5 md:pt-8 pb-4 md:pb-6 px-4 md:px-6 lg:px-8 text-center">
            <div className="bg-green-50 w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-5">
              <CheckCircle className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-green-500" />
            </div>
            
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-1 md:mb-2 text-[#1e3a8a]">Thank You!</h1>
            <p className="text-sm md:text-base lg:text-lg text-gray-600 mb-4 md:mb-6">
              Your booking request has been received. Our team will contact you soon to confirm your vehicle transport.
            </p>
            
            {data.finalPrice && (
              <div className="bg-blue-50 p-3 md:p-5 rounded-lg mb-4 md:mb-6">
                <h2 className="font-medium text-sm md:text-base lg:text-lg">Booking Summary</h2>
                <p className="text-xs md:text-sm text-gray-600">
                  {data.year} {data.make} {data.model}
                </p>
                <div className="text-xs md:text-sm text-gray-600 mb-1 md:mb-2 flex items-center justify-center">
                  <span className="truncate max-w-[140px] md:max-w-[200px]">{data.pickupLocation}</span>
                  <span className="mx-1 md:mx-2">→</span>
                  <span className="truncate max-w-[140px] md:max-w-[200px]">{data.dropoffLocation}</span>
                </div>
                <p className="text-lg md:text-xl lg:text-2xl font-bold text-[#dc2626]">{formattedPrice}</p>
              </div>
            )}
            
            {isSending ? (
              <div className="flex items-center justify-center mb-4 md:mb-6">
                <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin mr-2" />
                <p className="text-xs md:text-sm text-gray-600">Sending confirmations...</p>
              </div>
            ) : (
              <>
                {(sentEmail || sentSMS) && (
                  <div className="mb-4 md:mb-6 bg-gray-50 p-2 md:p-4 rounded-lg">
                    <h3 className="text-xs md:text-sm font-medium mb-1 md:mb-2">Confirmations Sent:</h3>
                    <div className="flex justify-center space-x-4 md:space-x-6">
                      {sentEmail && (
                        <div className="flex items-center text-green-600">
                          <Mail className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                          <span className="text-xs md:text-sm">Email</span>
                        </div>
                      )}
                      {sentSMS && (
                        <div className="flex items-center text-green-600">
                          <Phone className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                          <span className="text-xs md:text-sm">SMS</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
            
            <div className="grid grid-cols-2 gap-2 md:gap-4 mb-3 md:mb-5">
              <Button asChild size="sm" className="text-xs md:text-sm lg:text-base py-1 md:py-2 lg:py-3 h-auto md:h-auto bg-[#1e3a8a] hover:bg-[#0f2a63]">
                <Link href="/">Get Another Quote</Link>
              </Button>
              <Button variant="outline" size="sm" className="text-xs md:text-sm lg:text-base py-1 md:py-2 lg:py-3 h-auto md:h-auto" onClick={handleShare}>
                <Share2 className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" /> Share Quote
              </Button>
            </div>
            
            <p className="text-xs md:text-sm text-gray-500">
              Military Owned • Family Operated • Proudly American
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}