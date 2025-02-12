import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [isPickupContact, setIsPickupContact] = useState(false);
  const [isDeliveryContact, setIsDeliveryContact] = useState(false);

  const searchParams = new URLSearchParams(window.location.search);
  const data = JSON.parse(decodeURIComponent(searchParams.get("data") || "{}")) as QuoteData;

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      pickupContactName: "",
      pickupContactPhone: "",
      deliveryContactName: "",
      deliveryContactPhone: "",
      pickupAddress: "",
      deliveryAddress: "",
      notes: "",
    },
  });

  const onSubmit = async (formData: BookingFormData) => {
    navigate("/thank-you");
  };

  // Extract city, state, zip from location string
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

  // Handle checkbox changes
  const handlePickupContactChange = (checked: boolean) => {
    setIsPickupContact(checked);
    if (checked && data.name && data.phone) {
      form.setValue("pickupContactName", data.name);
      form.setValue("pickupContactPhone", data.phone);
    } else {
      form.setValue("pickupContactName", "");
      form.setValue("pickupContactPhone", "");
    }
  };

  const handleDeliveryContactChange = (checked: boolean) => {
    setIsDeliveryContact(checked);
    if (checked && data.name && data.phone) {
      form.setValue("deliveryContactName", data.name);
      form.setValue("deliveryContactPhone", data.phone);
    } else {
      form.setValue("deliveryContactName", "");
      form.setValue("deliveryContactPhone", "");
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <Card className="max-w-[800px] mx-auto">
        <CardHeader>
          <CardTitle>Complete Your Route Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Vehicle & Shipping Summary */}
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <p><span className="font-medium">Vehicle:</span> {data.year} {data.make} {data.model}</p>
              <p><span className="font-medium">Transport Type:</span> {data.selectedTransport === "enclosed" ? "Enclosed" : "Open"} Transport</p>
              <p><span className="font-medium">Expedited:</span> {data.guaranteedDate ? "Yes" : "No"}</p>
              <p><span className="font-medium">Ship Date:</span> {new Date(data.shipmentDate).toLocaleDateString()}</p>
              <p><span className="font-medium">Price:</span> ${data.finalPrice}</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Pickup Location */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Pickup Location</h3>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isPickupContact"
                      checked={isPickupContact}
                      onCheckedChange={handlePickupContactChange}
                    />
                    <label htmlFor="isPickupContact" className="text-sm">
                      I am the pickup contact
                    </label>
                  </div>
                  <FormField
                    control={form.control}
                    name="pickupAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter street address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <p className="text-sm text-muted-foreground">
                    {pickupLocation.city}, {pickupLocation.state} {pickupLocation.zip}
                  </p>
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

                {/* Delivery Location */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Delivery Location</h3>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isDeliveryContact"
                      checked={isDeliveryContact}
                      onCheckedChange={handleDeliveryContactChange}
                    />
                    <label htmlFor="isDeliveryContact" className="text-sm">
                      I am the delivery contact
                    </label>
                  </div>
                  <FormField
                    control={form.control}
                    name="deliveryAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter street address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <p className="text-sm text-muted-foreground">
                    {dropoffLocation.city}, {dropoffLocation.state} {dropoffLocation.zip}
                  </p>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}