import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function ThankYou() {
  const { toast } = useToast();
  const searchParams = new URLSearchParams(window.location.search);
  const data = searchParams.get("data") ? JSON.parse(decodeURIComponent(searchParams.get("data") || "{}")) : {};

  useEffect(() => {
    async function sendConfirmations() {
      if (data.email || data.phone) {
        try {
          const response = await fetch('/api/send-confirmations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
          });

          if (!response.ok) {
            throw new Error('Failed to send confirmations');
          }
        } catch (error) {
          toast({
            title: "Notice",
            description: "We'll send your confirmation details shortly.",
            variant: "default",
          });
        }
      }
    }

    sendConfirmations();
  }, [data, toast]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Thank You!</h1>
          <p className="text-muted-foreground mb-6">
            Your request has been received. Our team will contact you soon with confirmed availability.
          </p>
          {(data.email || data.phone) && (
            <p className="text-sm text-muted-foreground mb-6">
              A confirmation {data.email && data.phone ? 'email and SMS have' : (data.email ? 'email has' : 'SMS has')} been sent with your booking details.
            </p>
          )}
          <Button asChild>
            <Link href="/">Get Another Quote</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}