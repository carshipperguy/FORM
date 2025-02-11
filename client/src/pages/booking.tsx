import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const bookingSchema = z.object({
  pickupContactName: z.string().min(1, "Pickup contact name is required"),
  pickupContactPhone: z.string().min(1, "Pickup contact phone is required"),
  deliveryContactName: z.string().min(1, "Delivery contact name is required"),
  deliveryContactPhone: z.string().min(1, "Delivery contact phone is required"),
  pickupAddress: z.string().min(1, "Pickup address is required"),
  deliveryAddress: z.string().min(1, "Delivery address is required"),
  notes: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

type QuoteData = {
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
  selectedTransport: "open" | "enclosed";
  guaranteedDate: boolean;
  finalPrice: number;
};

export default function Booking() {
  const [, navigate] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const data = JSON.parse(decodeURIComponent(searchParams.get("data") || "{}")) as QuoteData;

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      pickupContactName: data.name || "",
      pickupContactPhone: data.phone || "",
      deliveryContactName: "",
      deliveryContactPhone: "",
      pickupAddress: "",
      deliveryAddress: "",
      notes: "",
    },
  });

  const onSubmit = async (formData: BookingFormData) => {
    // Here we would submit the complete booking data
    navigate("/thank-you");
  };

  // Extract city, state from location string
  const extractLocation = (location: string) => {
    const parts = location.split(',');
    return {
      city: parts[0]?.trim() || "",
      state: parts[1]?.trim() || "",
      zip: location.match(/\d{5}/)?.[0] || ""
    };
  };

  const pickupLocation = extractLocation(data.pickupLocation);
  const dropoffLocation = extractLocation(data.dropoffLocation);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <Card className="max-w-[800px] mx-auto">
        <CardHeader>
          <CardTitle>Complete Your Booking Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Pickup Location Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Pickup Location</h3>
                <p className="text-sm text-muted-foreground">
                  {pickupLocation.city}, {pickupLocation.state} {pickupLocation.zip}
                </p>
                <FormField
                  control={form.control}
                  name="pickupAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter complete street address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="pickupContactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pickupContactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Phone</FormLabel>
                        <FormControl>
                          <Input type="tel" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Delivery Location Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Delivery Location</h3>
                <p className="text-sm text-muted-foreground">
                  {dropoffLocation.city}, {dropoffLocation.state} {dropoffLocation.zip}
                </p>
                <FormField
                  control={form.control}
                  name="deliveryAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter complete street address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="deliveryContactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="deliveryContactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Phone</FormLabel>
                        <FormControl>
                          <Input type="tel" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Notes Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Additional Notes</h3>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>If you need to add any important details, leave them here</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter any additional information about your shipment"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full">
                Complete Booking
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
