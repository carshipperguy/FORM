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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-2 sm:p-4 md:p-6 lg:p-8">
      <div className="flex justify-center mb-2 md:mb-4">
        <img
          src="https://i.postimg.cc/wxSYD63g/Amerigo-auto-transport-logo222.png"
          alt="Amerigo Auto Transport"
          className="h-10 md:h-12 lg:h-16 object-contain bg-white rounded-lg p-2 shadow-sm"
        />
      </div>
      <Card className="w-full form-container border-gray-100 shadow-lg bg-white/80 backdrop-blur-md mx-auto">
        <CardHeader className="text-center pb-2 pt-3 md:pt-4 md:pb-3">
          <CardTitle className="text-xl md:text-2xl lg:text-3xl text-[#1e3a8a]">Your Confirmed Price</CardTitle>
          <div className="flex items-center justify-center gap-2 mt-1 md:mt-2">
            <img src="/google.png" alt="Google" className="h-5 md:h-6" />
            <div className="flex items-center">
              <span className="text-sm md:text-base font-bold mr-1">4.9</span>
              <span className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 md:w-4 md:h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </span>
              <span className="ml-1 text-xs md:text-sm">Rating</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 p-4 md:p-6 lg:p-8">
          <div className="space-y-3">
            <div className="text-center mb-2">
              <h3 className="text-sm md:text-base lg:text-lg font-semibold text-[#1e3a8a]">Door-to-Door Transport Service</h3>
              <p className="text-xs md:text-sm text-gray-600">
                Fully Insured — Your vehicle is covered every step of the way
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-5">
              <Card
                className={`cursor-pointer transition-all hover:shadow ${selectedTransport === "open" ? "ring-2 ring-[#1e3a8a] bg-blue-50" : "bg-white"}`}
                onClick={() => setSelectedTransport("open")}
              >
                <CardContent className="p-3 md:p-5">
                  <div className="text-center mb-1 text-xs md:text-sm lg:text-base font-medium">Open Transport</div>
                  <div className="text-xl md:text-2xl lg:text-3xl font-bold text-center text-[#dc2626]">${calculatePrice(data.openTransportPrice)}</div>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all hover:shadow ${selectedTransport === "enclosed" ? "ring-2 ring-[#1e3a8a] bg-blue-50" : "bg-white"}`}
                onClick={() => setSelectedTransport("enclosed")}
              >
                <CardContent className="p-3 md:p-5">
                  <div className="text-center mb-1 text-xs md:text-sm lg:text-base font-medium">Enclosed Transport</div>
                  <div className="text-xl md:text-2xl lg:text-3xl font-bold text-center text-[#dc2626]">${calculatePrice(data.enclosedTransportPrice)}</div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-blue-50 p-3 md:p-4 lg:p-5 rounded-lg">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h4 className="font-medium text-sm md:text-base lg:text-lg text-[#1e3a8a]">Expedited Shipping</h4>
                  <p className="text-xs md:text-sm text-gray-600">
                    Priority dispatch with faster transit time
                  </p>
                </div>
                <Switch
                  checked={guaranteedDate}
                  onCheckedChange={setGuaranteedDate}
                  className="scale-100 md:scale-125 lg:scale-150"
                />
              </div>
            </div>
            
            <Button
              onClick={handleReserve}
              className="w-full py-2 md:py-3 lg:py-4 text-sm md:text-base lg:text-lg font-semibold bg-[#1e3a8a] hover:bg-[#0f2a63] text-white"
              disabled={!selectedTransport}
            >
              Reserve Your Spot
              <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6" />
            </Button>

            <div className="text-center">
              <p className="text-lg md:text-xl lg:text-2xl font-bold text-[#dc2626]">NO PAYMENT REQUIRED</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h3 className="text-sm md:text-base lg:text-lg font-semibold text-[#1e3a8a]">Shipping Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4 text-xs md:text-sm lg:text-base">
              <div>
                <h4 className="font-medium">Vehicle Information</h4>
                <p>{data.year} {data.make} {data.model}</p>
              </div>

              <div>
                <h4 className="font-medium">Route</h4>
                <p>From: {extractCity(data.pickupLocation)}</p>
                <p>To: {extractCity(data.dropoffLocation)}</p>
              </div>
              
              <div>
                <h4 className="font-medium">Ship Date</h4>
                <p>{new Date(data.shipmentDate).toLocaleDateString()}</p>
              </div>
              
              <div>
                <h4 className="font-medium">Transit Details</h4>
                <p>{data.distance} miles | {data.transitTime} days</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}