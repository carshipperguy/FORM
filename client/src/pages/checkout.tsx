import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Star } from "lucide-react";
import { Switch } from "@/components/ui/switch";

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
  const [guaranteedDate, setGuaranteedDate] = useState(false);
  const [, navigate] = useLocation();

  const searchParams = new URLSearchParams(window.location.search);
  const data = searchParams.get("data") ?
    JSON.parse(decodeURIComponent(searchParams.get("data") || "{}")) as CheckoutData :
    null;

  if (!data?.openTransportPrice) {
    navigate("/");
    return null;
  }

  const calculatePrice = (basePrice: number) => {
    return guaranteedDate ? Math.round(basePrice * 1.3) : basePrice;
  };

  const handleReserve = () => {
    if (!selectedTransport) return;

    const params = new URLSearchParams({
      data: encodeURIComponent(JSON.stringify({
        ...data,
        selectedTransport,
        guaranteedDate,
        finalPrice: selectedTransport === "enclosed" ? calculatePrice(data.enclosedTransportPrice) : calculatePrice(data.openTransportPrice)
      }))
    });
    navigate(`/booking?${params.toString()}`);
  };

  const extractCity = (location: string) => {
    const parts = location.split(',');
    return parts[0].trim();
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <Card className="w-full max-w-[500px] mx-auto">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl">Your Confirmed Price</CardTitle>
          <div className="flex items-center justify-center gap-2 mt-2">
            <img src="/google.png" alt="Google" className="h-6" />
            <div className="flex items-center">
              <span className="text-lg font-bold mr-1">4.7</span>
              <span className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </span>
              <span className="ml-1">Rating</span>
            </div>
          </div>
          <div className="flex justify-center mt-2">
            <img src="/bbb trust logo.webp" alt="BBB Accredited Business" className="h-12" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6 p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Door-to-Door Service – We Make It Easy!</h3>
              <p className="text-sm text-muted-foreground">
                Fully Insured Transport – Your vehicle is covered every step of the way
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card
                className={`cursor-pointer transition-all hover:bg-primary/5 ${
                  selectedTransport === "open" ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedTransport("open")}
              >
                <CardContent className="p-4">
                  <div className="text-center mb-2">Open Transport</div>
                  <div className="text-3xl font-bold text-center">${calculatePrice(data.openTransportPrice)}</div>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all hover:bg-primary/5 ${
                  selectedTransport === "enclosed" ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedTransport("enclosed")}
              >
                <CardContent className="p-4">
                  <div className="text-center mb-2">Enclosed Transport</div>
                  <div className="text-3xl font-bold text-center">${calculatePrice(data.enclosedTransportPrice)}</div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="font-medium">Expedited Shipping</h4>
                  <p className="text-sm text-muted-foreground">
                    Expedited shipping ensures your vehicle is prioritized for pickup
                    and delivery, arriving faster than standard transit times.
                  </p>
                </div>
                <Switch
                  checked={guaranteedDate}
                  onCheckedChange={setGuaranteedDate}
                />
              </div>
            </div>

            {selectedTransport && (
              <Button
                onClick={handleReserve}
                className="w-full h-12 text-lg font-semibold"
                size="lg"
              >
                Reserve Your Spot
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            )}

            <div className="text-center space-y-2">
              <p className="text-2xl font-bold">NO PAYMENT REQUIRED</p>
              <p className="text-sm text-muted-foreground">
                Get your quote instantly. We'll contact you to confirm details and schedule pickup.
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Shipping Details</h3>
            <div className="grid gap-2 text-sm">
              <div className="grid gap-1">
                <h4 className="font-medium">Vehicle Information</h4>
                <p>Vehicle: {data.year} {data.make} {data.model}</p>
              </div>

              <div className="grid gap-1">
                <h4 className="font-medium">Route Information</h4>
                <p>From: {extractCity(data.pickupLocation)}</p>
                <p>To: {extractCity(data.dropoffLocation)}</p>
                <p>Ship Date: {new Date(data.shipmentDate).toLocaleDateString()}</p>
                <p>Distance: {data.distance} miles</p>
                <p>Transit Time: {data.transitTime} days</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}