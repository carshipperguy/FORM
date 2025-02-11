import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Calendar, Car, Truck, Shield } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Switch } from "@/components/ui/switch";

// Make all fields optional for testing
const bookingSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

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
  const data = JSON.parse(decodeURIComponent(searchParams.get("data") || "{}")) as CheckoutData;

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: data.email || "",
      phone: data.phone || "",
    },
  });

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

  const onSubmit = async (formData: BookingFormData) => {
    navigate("/thank-you");
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <Card className="max-w-[800px] mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Complete Your Booking</CardTitle>
          <p className="text-muted-foreground">
            Fill in your details to secure your vehicle transport
          </p>
          <div className="mx-auto w-fit">
            <img
              src="/assets/google-rating.png"
              alt="4.7 Star Google Rating"
              className="h-12"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Transport Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Door to Door Service</h3>
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
                  <p className="text-2xl font-bold">${calculatePrice(data.openTransportPrice)}</p>
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
                  <p className="text-2xl font-bold">${calculatePrice(data.enclosedTransportPrice)}</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Guaranteed Date Option */}
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

          {/* Shipping Details */}
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
                <p><span className="font-medium">From:</span> {data.pickupLocation} (ZIP: {data.pickupLocation.match(/\d{5}/)?.[0] || 'N/A'})</p>
                <p><span className="font-medium">To:</span> {data.dropoffLocation} (ZIP: {data.dropoffLocation.match(/\d{5}/)?.[0] || 'N/A'})</p>
                <p><span className="font-medium">Ship Date:</span> {new Date(data.shipmentDate).toLocaleDateString()}</p>
                <p><span className="font-medium">Distance:</span> {data.distance} miles</p>
                <p><span className="font-medium">Transit Time:</span> {data.transitTime} days</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="(555) 555-5555" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full h-12 text-lg font-semibold" size="lg">
                Reserve Your Spot
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <div className="space-y-4 text-center">
                <p className="text-xl font-bold">
                  No credit card required to reserve your spot
                </p>
                <p className="text-sm text-muted-foreground">
                  Quotes do not account for inoperable or oversized vehicles, existing transport
                  arrangements with other companies, or off-route locations that may incur additional costs.
                </p>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}