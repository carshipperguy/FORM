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
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a8a] via-[#ffffff] to-[#dc2626] text-black px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#1e3a8a] drop-shadow-md">Finalize Your Booking</h1>
          <p className="text-sm text-gray-700 mt-2">Military Owned • Family Operated • Proudly American</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 mb-10">
          <div className="bg-white text-black rounded-2xl p-5 shadow-xl border border-gray-200">
            <h2 className="text-xl font-semibold text-[#1e3a8a] mb-4">Your Shipping Details</h2>
            <div className="space-y-3 text-sm text-gray-700">
              <div>
                <span className="block font-medium text-[#1e3a8a]">Ship Date:</span>
                {data.shipmentDate instanceof Date 
                  ? data.shipmentDate.toLocaleDateString() 
                  : new Date(data.shipmentDate).toLocaleDateString()}
              </div>
              <div>
                <span className="block font-medium text-[#1e3a8a]">Vehicle:</span>
                {data.year} {data.make} {data.model}
              </div>
              <div>
                <span className="block font-medium text-[#1e3a8a]">Pickup Location:</span>
                {data.pickupLocation}
              </div>
              <div>
                <span className="block font-medium text-[#1e3a8a]">Dropoff Location:</span>
                {data.dropoffLocation}
              </div>
              <div>
                <span className="block font-medium text-[#1e3a8a]">Route Distance:</span>
                {data.distance} miles (est.)
              </div>
              <div>
                <span className="block font-medium text-[#1e3a8a]">Transit Time:</span>
                {data.transitTime} days (est.)
              </div>
            </div>
          </div>

          <div className="bg-white text-black rounded-2xl p-5 shadow-xl border border-gray-200">
            <h2 className="text-xl font-semibold text-[#1e3a8a] mb-4">Choose Your Transport Method</h2>
            
            <div className="flex flex-col space-y-4">
              <div 
                className={`p-4 rounded-xl cursor-pointer border ${selectedTransport === "open" 
                  ? "border-blue-600 bg-blue-50" 
                  : "border-gray-200 hover:bg-gray-50"}`}
                onClick={() => setSelectedTransport("open")}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">Open Transport</span>
                  <span className="text-xl font-bold text-[#dc2626]">
                    ${calculatePrice(data.openTransportPrice)}
                  </span>
                </div>
              </div>
              
              <div 
                className={`p-4 rounded-xl cursor-pointer border ${selectedTransport === "enclosed" 
                  ? "border-blue-600 bg-blue-50" 
                  : "border-gray-200 hover:bg-gray-50"}`}
                onClick={() => setSelectedTransport("enclosed")}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">Enclosed Transport</span>
                  <span className="text-xl font-bold text-[#dc2626]">
                    ${calculatePrice(data.enclosedTransportPrice)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-5 flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <h4 className="font-medium text-[#1e3a8a]">Expedited Shipping</h4>
                <p className="text-xs text-gray-600">Priority dispatch with faster transit time</p>
              </div>
              <Switch
                checked={guaranteedDate}
                onCheckedChange={setGuaranteedDate}
              />
            </div>
          </div>
        </div>
        
        <div className="text-center space-y-4">
          <Button
            onClick={handleReserve}
            className="px-10 py-3 text-base font-semibold bg-[#1e3a8a] hover:bg-[#0f2a63] rounded-full text-white transition"
            disabled={!selectedTransport}
          >
            Reserve Now — No credit card required
          </Button>
          
          <p className="text-center text-xs text-gray-800 max-w-2xl mx-auto">
            Note: By reserving, you'll secure your spot in our dispatch system. Our transport specialist will contact you to confirm all details before pickup.
          </p>
        </div>
      </div>
    </div>
  );
}