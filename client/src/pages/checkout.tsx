import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";

type CheckoutData = {
  vehicleType: string;
  make?: string;
  model?: string;
  customVehicleDetails?: string;
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
    <div className="p-4">
      <Card className="max-w-[500px] mx-auto">
        <CardHeader>
          <CardTitle>Review Your Quote</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-semibold">Vehicle Information</h3>
            <p>Type: {data.vehicleType}</p>
            {data.make && <p>Make: {data.make}</p>}
            {data.model && <p>Model: {data.model}</p>}
            {data.customVehicleDetails && <p>Details: {data.customVehicleDetails}</p>}
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="font-semibold">Transport Details</h3>
            <p>From: {data.pickupLocation}</p>
            <p>To: {data.dropoffLocation}</p>
            <p>Date: {new Date(data.shipmentDate).toLocaleDateString()}</p>
            <p>Transport Type: {data.transportType === "open" ? "Open Transport" : "Enclosed Transport"}</p>
            <p>Transit Time: {data.transitTime} days</p>
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="font-semibold">Contact Information</h3>
            {data.name && <p>Name: {data.name}</p>}
            {data.phone && <p>Phone: {data.phone}</p>}
            {data.email && <p>Email: {data.email}</p>}
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="font-semibold">Price</h3>
            <p className="text-2xl font-bold">${data.price}</p>
            <p className="text-sm text-muted-foreground">No payment required to reserve your spot</p>
          </div>

          <Button onClick={handleConfirm} className="w-full">
            Confirm Booking
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
