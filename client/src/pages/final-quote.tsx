import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
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
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-[#003366]">
          Choose Your Shipping Option
        </h1>

        {/* 2x2 Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-4xl mx-auto">
          {/* Open Transport - Standard */}
          <Card className="border-2">
            <CardContent className="p-6 flex flex-col h-full">
              <div className="flex-grow space-y-4">
                <h3 className="text-xl font-bold whitespace-nowrap">Open Transport</h3>
                <div className="text-4xl font-bold">${data.openTransportPrice}</div>
                <ul className="space-y-2 text-base">
                  <li>Picked up within 7 business days</li>
                  <li>Open carrier</li>
                  <li>$0 Due Now</li>
                </ul>
              </div>
              <Button 
                onClick={() => handleReserve('open', false)}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 mt-4 text-base"
              >
                Reserve Now - No Credit Card Required
              </Button>
            </CardContent>
          </Card>

          {/* Enclosed Transport - Standard */}
          <Card className="border-2">
            <CardContent className="p-6 flex flex-col h-full">
              <div className="flex-grow space-y-4">
                <h3 className="text-xl font-bold whitespace-nowrap">Enclosed Transport</h3>
                <div className="text-4xl font-bold">${data.enclosedTransportPrice}</div>
                <ul className="space-y-2 text-base">
                  <li>Picked up within 7 business days</li>
                  <li>Enclosed carrier</li>
                  <li>$0 Due Now</li>
                </ul>
              </div>
              <Button 
                onClick={() => handleReserve('enclosed', false)}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 mt-4 text-base"
              >
                Reserve Now - No Credit Card Required
              </Button>
            </CardContent>
          </Card>

          {/* Open Transport - Guaranteed */}
          <Card className="border-2">
            <CardContent className="p-6 flex flex-col h-full">
              <div className="flex-grow space-y-4">
                <h3 className="text-xl font-bold">Open + Guaranteed Date</h3>
                <div className="text-4xl font-bold">
                  ${calculatePrice(data.openTransportPrice, true)}
                </div>
                <ul className="space-y-2 text-base">
                  <li>Guaranteed pickup date</li>
                  <li>Open carrier</li>
                  <li>$0 Due Now</li>
                </ul>
              </div>
              <Button 
                onClick={() => handleReserve('open', true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 mt-4 text-base"
              >
                Reserve Now - No Credit Card Required
              </Button>
            </CardContent>
          </Card>

          {/* Enclosed Transport - Guaranteed */}
          <Card className="border-2">
            <CardContent className="p-6 flex flex-col h-full">
              <div className="flex-grow space-y-4">
                <h3 className="text-xl font-bold">Enclosed + Guaranteed Date</h3>
                <div className="text-4xl font-bold">
                  ${calculatePrice(data.enclosedTransportPrice, true)}
                </div>
                <ul className="space-y-2 text-base">
                  <li>Guaranteed pickup date</li>
                  <li>Enclosed carrier</li>
                  <li>$0 Due Now</li>
                </ul>
              </div>
              <Button 
                onClick={() => handleReserve('enclosed', true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 mt-4 text-base"
              >
                Reserve Now - No Credit Card Required
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Disclaimer */}
        <div className="text-center max-w-2xl mx-auto text-sm mt-8">
          <p className="leading-relaxed">
            Got more than one vehicle? Shipping something modified or inoperable?<br />
            Please call <span className="font-semibold">954-642-2118</span> for a custom quote — these require special handling.
          </p>
        </div>
      </div>
    </div>
  );
}