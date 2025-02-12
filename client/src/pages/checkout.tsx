import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Calendar } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { TrustBadges } from "@/components/trust-badges";
import Image from "@/components/ui/image";

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
  let data = JSON.parse(decodeURIComponent(searchParams.get("data") || "{}")) as CheckoutData;

  const calculateDistance = async (pickup: string, dropoff: string) => {
    return new Promise<{success: boolean, distance: number}>((resolve) => {
      setTimeout(() => {
        resolve({success: true, distance: 100}); 
      }, 500)
    })
  };

  if (!data.distance) {
    calculateDistance(data.pickupLocation, data.dropoffLocation)
      .then(result => {
        if (result.success) {
          data.distance = result.distance;
          data.transitTime = Math.ceil(result.distance / 300) + 1; 
        }
      })
      .catch(console.error);
  }

  if (!data.openTransportPrice) {
    navigate("/");
    return null;
  }

  const calculatePrice = (basePrice: number) => {
    return guaranteedDate ? Math.round(basePrice * 1.3) : basePrice;
  };

  const currentPrice = selectedTransport === "enclosed"
    ? calculatePrice(data.enclosedTransportPrice)
    : calculatePrice(data.openTransportPrice);

  const handleReserve = () => {
    const params = new URLSearchParams({
      data: encodeURIComponent(JSON.stringify({
        ...data,
        selectedTransport,
        guaranteedDate,
        finalPrice: currentPrice
      }))
    });
    navigate(`/booking?${params.toString()}`);
  };

  const extractCity = (location: string) => {
    const parts = location.split(',');
    return parts[0].trim();
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <Card className="max-w-[800px] mx-auto">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">Your Confirmed Price</CardTitle>
          <TrustBadges />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Door-to-Door Service – We Make It Easy!</h3>
            <p className="text-muted-foreground mb-4">Fully Insured Transport – Your vehicle is covered every step of the way</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedTransport === "open" ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedTransport("open")}
              >
                <CardContent className="p-6">
                  <div className="aspect-[2/1] relative mb-4">
                    <Image
                      src="/open-trailer.png"
                      alt="Open Car Trailer"
                      className="object-contain w-full h-full"
                      width={300}
                      height={150}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Open Transport</h4>
                      <span className="text-2xl font-bold">${calculatePrice(data.openTransportPrice)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Basic and affordable</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>✓ Insurance included</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedTransport === "enclosed" ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedTransport("enclosed")}
              >
                <CardContent className="p-6">
                  <div className="aspect-[2/1] relative mb-4">
                    <Image
                      src="/enclosed-trailer.png"
                      alt="Enclosed Trailer"
                      className="object-contain w-full h-full"
                      width={300}
                      height={150}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Enclosed Transport</h4>
                      <span className="text-2xl font-bold">${calculatePrice(data.enclosedTransportPrice)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Suitable for luxury cars</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>✓ Insurance included</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-medium">Guaranteed Date Expedited Shipping</h3>
              <p className="text-sm text-muted-foreground">
                Expedited shipping ensures your vehicle is prioritized for pickup and delivery,
                arriving faster than standard transit times. Your transport is scheduled with a
                guaranteed pickup date for maximum convenience.
              </p>
            </div>
            <Switch
              checked={guaranteedDate}
              onCheckedChange={setGuaranteedDate}
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Shipping Details
            </h3>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <h4 className="font-medium">Vehicle Information</h4>
                <p><span className="font-medium">Vehicle:</span> {data.year} {data.make} {data.model}</p>
              </div>

              <div className="grid gap-2">
                <h4 className="font-medium">Route Information</h4>
                <p><span className="font-medium">From:</span> {extractCity(data.pickupLocation)}</p>
                <p><span className="font-medium">To:</span> {extractCity(data.dropoffLocation)}</p>
                <p><span className="font-medium">Ship Date:</span> {new Date(data.shipmentDate).toLocaleDateString()}</p>
                <p><span className="font-medium">Distance:</span> {data.distance} miles</p>
                <p><span className="font-medium">Transit Time:</span> {data.transitTime} days</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Button
              onClick={handleReserve}
              className="w-full h-12 text-lg font-semibold"
              size="lg"
            >
              Reserve Your Spot
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <div className="space-y-4 text-center">
              <p className="text-2xl font-bold">
                NO PAYMENT REQUIRED
              </p>
              <p className="text-sm text-muted-foreground">
                Quotes do not account for inoperable or oversized vehicles, existing transport
                arrangements with other companies, or off-route locations that may incur additional costs.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}