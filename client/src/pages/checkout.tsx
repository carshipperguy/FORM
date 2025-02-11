import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
//import { apiRequest } from "@/lib/queryClient"; // Removed unnecessary import
import { ArrowRight, Calendar, Mail, Phone, User, Car, Truck, Shield } from "lucide-react";

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
  openTransportPrice: number;
  enclosedTransportPrice: number;
  transitTime: number;
  distance: number;
};

export default function Checkout() {
  const [selectedTransport, setSelectedTransport] = useState<"open" | "enclosed">();
  const [, navigate] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const data = JSON.parse(decodeURIComponent(searchParams.get("data") || "{}")) as CheckoutData;

  if (!data.openTransportPrice) {
    navigate("/");
    return null;
  }

  const handleConfirm = () => {
    if (!selectedTransport) return;
    navigate("/thank-you");
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <Card className="max-w-[600px] mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Your Transport Quote</CardTitle>
          <p className="text-muted-foreground">Review your quote and confirm your reservation</p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Transport Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Select Transport Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card
                className={`cursor-pointer transition-all ${
                  selectedTransport === "open" ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedTransport("open")}
              >
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    <h4 className="font-medium">Open Transport</h4>
                  </div>
                  <p className="text-2xl font-bold">${data.openTransportPrice}</p>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${
                  selectedTransport === "enclosed" ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedTransport("enclosed")}
              >
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    <h4 className="font-medium">Enclosed Transport</h4>
                  </div>
                  <p className="text-2xl font-bold">${data.enclosedTransportPrice}</p>
                </CardContent>
              </Card>
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
            </div>
          </div>

          <Separator />

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

          {/* Shipping Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Shipping Details
            </h3>
            <div className="grid gap-2">
              <p><span className="font-medium">From:</span> Los Angeles, CA</p>
              <p><span className="font-medium">To:</span> Miami, FL</p>
              <p><span className="font-medium">Ship Date:</span> {new Date(data.shipmentDate).toLocaleDateString()}</p>
              <p><span className="font-medium">Distance:</span> 2,789 miles</p>
              <p><span className="font-medium">Transit Time:</span> {data.transitTime} days</p>
            </div>
          </div>

          {/* CTA Button */}
          <Button
            onClick={handleConfirm}
            disabled={!selectedTransport}
            className="w-full h-12 text-lg font-semibold"
            size="lg"
          >
            Book Your Free Reservation Now!
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            No payment required to reserve your spot
          </p>
        </CardContent>
      </Card>
    </div>
  );
}