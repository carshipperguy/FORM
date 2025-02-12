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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { z } from "zod";
import { validateAddress, calculateDistance, type Address } from "@/lib/mapquest";
import { useToast } from "@/hooks/use-toast";

const bookingSchema = z.object({
  pickupContactName: z.string().min(1, "Pickup contact name is required"),
  pickupContactPhone: z.string().min(1, "Pickup contact phone is required"),
  pickupStreetAddress: z.string().min(1, "Street address is required"),
  pickupCity: z.string(),
  pickupState: z.string(),
  pickupZip: z.string(),

  deliveryContactName: z.string().min(1, "Delivery contact name is required"),
  deliveryContactPhone: z.string().min(1, "Delivery contact phone is required"),
  deliveryStreetAddress: z.string().min(1, "Street address is required"),
  deliveryCity: z.string(),
  deliveryState: z.string(),
  deliveryZip: z.string(),

  notes: z.string().optional(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions"
  })
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
  finalPrice: number;
  distance: number;
  transitTime: number;
};

export default function Booking() {
  const [isPickupContact, setIsPickupContact] = useState(false);
  const [isDeliveryContact, setIsDeliveryContact] = useState(false);
  const [, navigate] = useLocation();

  const searchParams = new URLSearchParams(window.location.search);
  const data = JSON.parse(decodeURIComponent(searchParams.get("data") || "{}")) as QuoteData;

  if (!data.finalPrice) {
    navigate("/");
    return null;
  }

  const extractLocation = (location: string) => {
    const parts = location.split(',').map(part => part.trim());
    return {
      city: parts[0] || '',
      state: parts[1] || '',
      zip: parts[2] || ''
    };
  };

  const pickupLocation = extractLocation(data.pickupLocation);
  const dropoffLocation = extractLocation(data.dropoffLocation);

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      pickupContactName: "",
      pickupContactPhone: "",
      pickupStreetAddress: "",
      pickupCity: pickupLocation.city,
      pickupState: pickupLocation.state,
      pickupZip: pickupLocation.zip,

      deliveryContactName: "",
      deliveryContactPhone: "",
      deliveryStreetAddress: "",
      deliveryCity: dropoffLocation.city,
      deliveryState: dropoffLocation.state,
      deliveryZip: dropoffLocation.zip,

      notes: "",
      acceptTerms: false
    },
  });

  const { toast } = useToast();

  const onSubmit = async (formData: BookingFormData) => {
    const pickupAddress: Address = {
      street: formData.pickupStreetAddress,
      city: formData.pickupCity,
      state: formData.pickupState,
      postalCode: formData.pickupZip
    };

    const deliveryAddress: Address = {
      street: formData.deliveryStreetAddress,
      city: formData.deliveryCity,
      state: formData.deliveryState,
      postalCode: formData.deliveryZip
    };

    // Validate both addresses
    const pickupValidation = await validateAddress(pickupAddress);
    const deliveryValidation = await validateAddress(deliveryAddress);

    if (!pickupValidation.isValid || !deliveryValidation.isValid) {
      toast({
        title: "Invalid Address",
        description: "Please check both addresses and try again.",
        variant: "destructive",
      });
      return;
    }

    // Format addresses for distance calculation
    const pickupAddressStr = `${pickupValidation.formattedAddress}`;
    const deliveryAddressStr = `${deliveryValidation.formattedAddress}`;

    // Calculate accurate distance using formatted addresses
    const distanceResult = await calculateDistance(pickupAddressStr, deliveryAddressStr);

    if (!distanceResult.success) {
      toast({
        title: "Error",
        description: "Could not calculate shipping distance. Please try again.",
        variant: "destructive",
      });
      return;
    }

    // Update the data with validated addresses and accurate distance
    const updatedData = {
      ...data,
      ...formData,
      distance: distanceResult.distance,
      validatedPickupAddress: pickupValidation.formattedAddress,
      validatedDeliveryAddress: deliveryValidation.formattedAddress
    };

    // Use template literal for the URL with query parameters
    navigate(`/thank-you?data=${encodeURIComponent(JSON.stringify(updatedData))}`);
  };

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
            {/* Shipping Details Summary */}
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <h3 className="font-semibold mb-2">Shipping Details</h3>
              <p><span className="font-medium">Ship Date:</span> {new Date(data.shipmentDate).toLocaleDateString()}</p>
              <p><span className="font-medium">Vehicle:</span> {data.year} {data.make} {data.model}</p>
              <p><span className="font-medium">Transport Type:</span> {data.selectedTransport === "enclosed" ? "Enclosed" : "Open"} Transport</p>
              <p><span className="font-medium">Price:</span> ${data.finalPrice}</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Pickup Location */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Pickup Details</h3>
                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox
                      id="isPickupContact"
                      checked={isPickupContact}
                      onCheckedChange={handlePickupContactChange}
                    />
                    <label htmlFor="isPickupContact" className="text-sm">
                      I am the pickup contact
                    </label>
                  </div>

                  {/* Pickup Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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

                  {/* Pickup Address */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="pickupStreetAddress"
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="pickupCity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input {...field} readOnly disabled className="bg-muted" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="pickupState"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input {...field} readOnly disabled className="bg-muted" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="pickupZip"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ZIP Code</FormLabel>
                            <FormControl>
                              <Input {...field} readOnly disabled className="bg-muted" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery Location */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Delivery Details</h3>
                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox
                      id="isDeliveryContact"
                      checked={isDeliveryContact}
                      onCheckedChange={handleDeliveryContactChange}
                    />
                    <label htmlFor="isDeliveryContact" className="text-sm">
                      I am the delivery contact
                    </label>
                  </div>

                  {/* Delivery Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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

                  {/* Delivery Address */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="deliveryStreetAddress"
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="deliveryCity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input {...field} readOnly disabled className="bg-muted" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="deliveryState"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input {...field} readOnly disabled className="bg-muted" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="deliveryZip"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ZIP Code</FormLabel>
                            <FormControl>
                              <Input {...field} readOnly disabled className="bg-muted" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
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

                {/* Terms and Conditions */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <FormField
                      control={form.control}
                      name="acceptTerms"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-x-1">
                            <span>I accept the</span>
                            <Dialog>
                              <DialogTrigger className="text-primary underline hover:text-primary/80">
                                terms and conditions
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Terms and Conditions</DialogTitle>
                                </DialogHeader>
                                <div className="max-h-[60vh] overflow-y-auto">
                                  <p>
                                    By accepting these terms, you agree to our service conditions...
                                  </p>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  Confirm Free Reservation
                </Button>
              </form>
            </Form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}