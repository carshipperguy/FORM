import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, Shield } from "lucide-react";

type PriceDisplayProps = {
  openTransport: number;
  enclosedTransport: number;
  transitTime: number;
  onReserve: (type: "open" | "enclosed") => void;
};

export function PriceDisplay({
  openTransport,
  enclosedTransport,
  transitTime,
  onReserve,
}: PriceDisplayProps) {
  if (openTransport === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto mt-8">
        <CardContent className="pt-6">
          <p className="text-center text-lg">
            For routes under 500 miles, please contact us directly for a custom quote.
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatUSD = (price: number) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="min-h-[240px] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-6 w-6" />
              Open Transport
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <div className="text-4xl font-bold mb-4">{formatUSD(openTransport)}</div>
            <Button
              className="w-full mt-auto"
              onClick={() => onReserve("open")}
            >
              Reserve Now - No CC Required
            </Button>
          </CardContent>
        </Card>

        <Card className="min-h-[240px] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Enclosed Transport
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <div className="text-4xl font-bold mb-4">{formatUSD(enclosedTransport)}</div>
            <Button
              className="w-full mt-auto"
              onClick={() => onReserve("enclosed")}
            >
              Reserve Now - No CC Required
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Estimated Transit Time</h3>
              <p>{transitTime} days</p>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">
                Prices are based on mileage and do not account for inoperable or oversized
                vehicles, or very specific timing needs. If you have an urgent time-sensitive
                request, please call, text, or live chat with us.
              </p>
              <p>No payment required to reserve your spot.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
