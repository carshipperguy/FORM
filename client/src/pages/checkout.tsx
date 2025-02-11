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
  pickupAddress: z.string().optional(),
  deliveryAddress: z.string().optional(),
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
      pickupAddress: "",
      deliveryAddress: "",
    },
  });

  if (!data.openTransportPrice) {
    navigate("/");
    return null;
  }

  const onSubmit = async (formData: BookingFormData) => {
    // Here we would typically submit the booking data to the server
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
                  <p className="text-2xl font-bold">${data.openTransportPrice}</p>
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
                  <p className="text-2xl font-bold">${data.enclosedTransportPrice}</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator />

          {/* Vehicle Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Car className="h-5 w-5" />
              Vehicle Details
            </h3>
            <div className="grid gap-2">
              <p><span className="font-medium">Year:</span> {data.year}</p>
              <p><span className="font-medium">Make:</span> {data.make}</p>
              <p><span className="font-medium">Model:</span> {data.model}</p>
            </div>
          </div>

          <Separator />

          {/* Shipping Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Shipping Details
            </h3>
            <div className="grid gap-2">
              <p><span className="font-medium">From:</span> {data.pickupLocation}</p>
              <p><span className="font-medium">To:</span> {data.dropoffLocation}</p>
              <p><span className="font-medium">Ship Date:</span> {new Date(data.shipmentDate).toLocaleDateString()}</p>
              <p><span className="font-medium">Distance:</span> {data.distance} miles</p>
              <p><span className="font-medium">Transit Time:</span> {data.transitTime} days</p>
            </div>
          </div>

          <Separator />

          {/* Guaranteed Date Option */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-medium">Guaranteed Pickup Date</h3>
              <p className="text-sm text-muted-foreground">Add $75 for guaranteed pickup within 24 hours of your preferred date</p>
            </div>
            <Switch
              checked={guaranteedDate}
              onCheckedChange={setGuaranteedDate}
            />
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

                <FormField
                  control={form.control}
                  name="pickupAddress"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Pickup Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter complete pickup address" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deliveryAddress"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Delivery Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter complete delivery address" {...field} />
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

              <p className="text-sm text-center text-muted-foreground">
                By reserving, you acknowledge that the final price may vary based on vehicle condition and specific requirements.
                No payment required to reserve your spot.
              </p>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}