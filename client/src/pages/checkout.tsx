import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Calendar, Mail, Phone, User, Car, Truck, Shield } from "lucide-react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const bookingSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  pickupAddress: z.string().min(1, "Pickup address is required"),
  deliveryAddress: z.string().min(1, "Delivery address is required"),
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
    // For now, just navigate to thank you page
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
              <p><span className="font-medium">From:</span> Los Angeles, CA</p>
              <p><span className="font-medium">To:</span> Miami, FL</p>
              <p><span className="font-medium">Ship Date:</span> {new Date(data.shipmentDate).toLocaleDateString()}</p>
              <p><span className="font-medium">Distance:</span> 2,789 miles</p>
              <p><span className="font-medium">Transit Time:</span> {data.transitTime} days</p>
            </div>
          </div>

          <Separator />

          {/* Booking Form */}
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
                      <FormMessage />
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
                      <FormMessage />
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
                      <FormMessage />
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
                      <FormMessage />
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
                      <FormMessage />
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Price Display */}
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">Total Price</h3>
                    <p className="text-sm text-muted-foreground">Open Transport</p>
                  </div>
                  <p className="text-3xl font-bold">${data.openTransportPrice}</p>
                </div>
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full h-12 text-lg font-semibold" size="lg">
                Complete Booking
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <p className="text-sm text-center text-muted-foreground">
                No payment required to reserve your spot
              </p>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}