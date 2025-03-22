import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type QuoteFormData } from "@shared/schema";

export default function FinalQuote() {
  const [, navigate] = useLocation();

  const searchParams = new URLSearchParams(window.location.search);
  const data = searchParams.get("data") ?
    JSON.parse(decodeURIComponent(searchParams.get("data") || "{}")) as QuoteFormData :
    null;

  if (!data) {
    navigate("/");
    return null;
  }

  const calculatePrice = (basePrice: number, isGuaranteed: boolean) => {
    return isGuaranteed ? Math.round(basePrice * 1.3) : basePrice;
  };

  const handleReserve = (type: 'open' | 'enclosed', isGuaranteed: boolean) => {
    const params = new URLSearchParams({
      data: encodeURIComponent(JSON.stringify({
        ...data,
        selectedTransport: type,
        guaranteedDate: isGuaranteed,
        finalPrice: calculatePrice(type === 'enclosed' ? data.enclosedTransportPrice : data.openTransportPrice, isGuaranteed)
      }))
    });
    navigate(`/booking?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-[1200px] mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-[#003366]">
          Choose Your Shipping Option
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Open Transport - Standard */}
          <Card className="p-6 border-2">
            <div className="mb-4">
              <h3 className="text-xl font-bold mb-2">Open Transport</h3>
              <div className="text-4xl font-bold mb-4">${data.openTransportPrice}</div>
              <ul className="space-y-2">
                <li>Picked up within 7 business days</li>
                <li>Open carrier</li>
                <li>$0 Due Now</li>
              </ul>
            </div>
            <Button 
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              onClick={() => handleReserve('open', false)}
            >
              Reserve Now - No Credit Card Required
            </Button>
          </Card>

          {/* Enclosed Transport - Standard */}
          <Card className="p-6 border-2">
            <div className="mb-4">
              <h3 className="text-xl font-bold mb-2">Enclosed Transport</h3>
              <div className="text-4xl font-bold mb-4">${data.enclosedTransportPrice}</div>
              <ul className="space-y-2">
                <li>Picked up within 7 business days</li>
                <li>Enclosed carrier</li>
                <li>$0 Due Now</li>
              </ul>
            </div>
            <Button 
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              onClick={() => handleReserve('enclosed', false)}
            >
              Reserve Now - No Credit Card Required
            </Button>
          </Card>

          {/* Open Transport - Guaranteed */}
          <Card className="p-6 border-2">
            <div className="mb-4">
              <h3 className="text-xl font-bold mb-2">Open + Guaranteed Date</h3>
              <div className="text-4xl font-bold mb-4">
                ${calculatePrice(data.openTransportPrice, true)}
              </div>
              <ul className="space-y-2">
                <li>Guaranteed pickup date</li>
                <li>Open carrier</li>
                <li>$0 Due Now</li>
              </ul>
            </div>
            <Button 
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              onClick={() => handleReserve('open', true)}
            >
              Reserve Now - No Credit Card Required
            </Button>
          </Card>

          {/* Enclosed Transport - Guaranteed */}
          <Card className="p-6 border-2">
            <div className="mb-4">
              <h3 className="text-xl font-bold mb-2">Enclosed + Guaranteed Date</h3>
              <div className="text-4xl font-bold mb-4">
                ${calculatePrice(data.enclosedTransportPrice, true)}
              </div>
              <ul className="space-y-2">
                <li>Guaranteed pickup date</li>
                <li>Enclosed carrier</li>
                <li>$0 Due Now</li>
              </ul>
            </div>
            <Button 
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              onClick={() => handleReserve('enclosed', true)}
            >
              Reserve Now - No Credit Card Required
            </Button>
          </Card>
        </div>

        <div className="text-center text-sm max-w-[800px] mx-auto">
          <p>
            Got more than one vehicle? Shipping something modified or inoperable?<br />
            Please call <span className="font-semibold">954-642-2118</span> for a custom quote — these require special handling.
          </p>
        </div>
      </div>
    </div>
  );
}