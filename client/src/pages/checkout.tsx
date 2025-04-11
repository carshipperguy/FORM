import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Star } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import MobileContainer from "@/components/MobileContainer";

type CheckoutData = {
  vehicleType: string;
  year: string;
  make: string;
  model: string;
  pickupLocation: string;
  pickupZip?: string;  // Add pickup ZIP field
  dropoffLocation: string;
  dropoffZip?: string;  // Add dropoff ZIP field
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
    <MobileContainer>
      <div className="p-4 bg-white">
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold text-[#002C42]">Finalize Your Booking</h1>
          <p className="text-xs text-gray-700 mt-1">Military Owned • Family Operated</p>
        </div>

        <div className="mb-4">
          <div className="bg-white text-black border border-gray-200 mb-3">
            <div className="bg-[#002C42] text-white p-2">
              <h2 className="text-sm font-medium">Your Shipping Details</h2>
            </div>
            <div className="p-3 space-y-2 text-sm text-gray-700">
              <div>
                <span className="font-medium text-[#002C42]">Ship Date:</span>{" "}
                {data.shipmentDate instanceof Date 
                  ? data.shipmentDate.toLocaleDateString() 
                  : new Date(data.shipmentDate).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium text-[#002C42]">Vehicle:</span>{" "}
                {data.year} {data.make} {data.model}
              </div>
              <div>
                <span className="font-medium text-[#002C42]">Pickup:</span>{" "}
                {data.pickupLocation} {data.pickupZip && <span className="text-gray-800">(ZIP: {data.pickupZip})</span>}
              </div>
              <div>
                <span className="font-medium text-[#002C42]">Dropoff:</span>{" "}
                {data.dropoffLocation} {data.dropoffZip && <span className="text-gray-800">(ZIP: {data.dropoffZip})</span>}
              </div>
              <div>
                <span className="font-medium text-[#002C42]">Distance:</span>{" "}
                {data.distance} miles
              </div>
              <div>
                <span className="font-medium text-[#002C42]">Transit Time:</span>{" "}
                {data.transitTime} days
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="bg-white text-black border border-gray-200 mb-3">
            <div className="bg-[#002C42] text-white p-2">
              <h2 className="text-sm font-medium">Choose Transport Method</h2>
            </div>
            <div className="p-3">
              <div className="flex flex-col space-y-3">
                <div 
                  className={`p-3 cursor-pointer border ${selectedTransport === "open" 
                    ? "border-[#002C42] bg-blue-50" 
                    : "border-gray-200"}`}
                  onClick={() => setSelectedTransport("open")}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Open Transport</span>
                    <span className="text-lg font-bold">
                      ${calculatePrice(data.openTransportPrice)}
                    </span>
                  </div>
                </div>
                
                <div 
                  className={`p-3 cursor-pointer border ${selectedTransport === "enclosed" 
                    ? "border-[#002C42] bg-blue-50" 
                    : "border-gray-200"}`}
                  onClick={() => setSelectedTransport("enclosed")}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Enclosed Transport</span>
                    <span className="text-lg font-bold">
                      ${calculatePrice(data.enclosedTransportPrice)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 flex items-center justify-between p-2 bg-gray-50 border border-gray-200">
                <div>
                  <h4 className="text-sm font-medium text-[#002C42]">Expedited Shipping</h4>
                  <p className="text-xs text-gray-600">Priority dispatch</p>
                </div>
                <Switch
                  checked={guaranteedDate}
                  onCheckedChange={setGuaranteedDate}
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <Button
            onClick={handleReserve}
            className="w-full bg-[#002C42] text-white py-3 font-medium"
            disabled={!selectedTransport}
          >
            Submit
          </Button>
          
          <p className="text-center text-xs text-gray-600 mt-2">
            No payment is required until the vehicle is dispatched.
          </p>
        </div>
      </div>
    </MobileContainer>
  );
}