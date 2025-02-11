import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { ArrowRight, Calendar, Mail, Phone, User, Car } from "lucide-react";

type CheckoutData = {
  vehicleType: string;
  year: string;
  make: string;
  model: string;
  pickupLocation: string;
  dropoffLocation: string;
  shipmentDate: Date;
  name?: string;
  phone?: string;
  email?: string;
  transportType: "open" | "enclosed";
  price: number;
  transitTime: number;
};

export default function Checkout() {
  const [, navigate] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const data = JSON.parse(decodeURIComponent(searchParams.get("data") || "{}")) as CheckoutData;

  if (!data.price) {
    navigate("/");
    return null;
  }

  const handleConfirm = async () => {
    try {
      await apiRequest("POST", "/api/quotes", data);
      navigate("/thank-you");
    } catch (error) {
      console.error("Failed to submit quote:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <Card className="max-w-[600px] mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Your Transport Quote</CardTitle>
          <p className="text-muted-foreground">Review your quote and confirm your reservation</p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5" />
              Contact Information
            </h3>
            <div className="grid gap-2">
              {data.name && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{data.name}</span>
                </div>
              )}
              {data.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{data.phone}</span>
                </div>
              )}
              {data.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{data.email}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Vehicle Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Car className="h-5 w-5" />
              Vehicle Details
            </h3>
            <div className="grid gap-2">
              <p><span className="font-medium">Year:</span> {data.year}</p>
              <p><span className="font-medium">Make:</span> {data.make}</p>
              <p><span className="font-medium">Model:</span> {data.model}</p>
              <p><span className="font-medium">Transport Type:</span> {data.transportType === "open" ? "Open Transport" : "Enclosed Transport"}</p>
            </div>
          </div>

          <Separator />

          {/* Shipping Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Shipping Details
            </h3>
            <div className="grid gap-2">
              <p><span className="font-medium">From:</span> {data.pickupLocation}</p>
              <p><span className="font-medium">To:</span> {data.dropoffLocation}</p>
              <p><span className="font-medium">Ship Date:</span> {new Date(data.shipmentDate).toLocaleDateString()}</p>
              <p><span className="font-medium">Transit Time:</span> {data.transitTime} days</p>
            </div>
          </div>

          <Separator />

          {/* Price */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <h3 className="text-lg font-semibold">Total Price</h3>
                <p className="text-sm text-muted-foreground">No payment required to reserve</p>
              </div>
              <p className="text-3xl font-bold">${data.price}</p>
            </div>
          </div>

          {/* CTA Button */}
          <Button 
            onClick={handleConfirm} 
            className="w-full h-12 text-lg font-semibold"
            size="lg"
          >
            Book Your Free Reservation Now!
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}