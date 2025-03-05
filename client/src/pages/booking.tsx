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
import { useToast } from "@/hooks/use-toast";

// Schema and types remain the same
const bookingSchema = z.object({
  pickupContactName: z.string().min(1, "Pickup contact name is required"),
  pickupContactPhone: z.string().min(1, "Pickup contact phone is required"),
  pickupStreetAddress: z.string().min(1, "Street address is required"),
  pickupCity: z.string().min(1, "City is required"),
  pickupState: z.string().min(1, "State is required"),
  pickupZip: z.string().min(1, "ZIP code is required"),

  deliveryContactName: z.string().min(1, "Delivery contact name is required"),
  deliveryContactPhone: z.string().min(1, "Delivery contact phone is required"),
  deliveryStreetAddress: z.string().min(1, "Street address is required"),
  deliveryCity: z.string().min(1, "City is required"),
  deliveryState: z.string().min(1, "State is required"),
  deliveryZip: z.string().min(1, "ZIP code is required"),

  expeditedShipping: z.boolean().optional(),
  notes: z.string().optional(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions"
  })
});

export function extractLocation(location: string) {
  const parts = location.split(',').map(part => part.trim());
  let city = '', state = '', zip = '';

  if (parts.length >= 2) {
    city = parts[0];
    const lastPart = parts[parts.length - 1];
    const stateZipPattern = /([A-Z]{2})\s+(\d{5})/;
    const match = lastPart.match(stateZipPattern);

    if (match) {
      state = match[1];
      zip = match[2];
    }
  }

  return {
    city: city || 'N/A',
    state: state || 'N/A',
    zip: zip || 'N/A'
  };
}

export default function Booking() {
  const [isPickupContact, setIsPickupContact] = useState(false);
  const [isDeliveryContact, setIsDeliveryContact] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const searchParams = new URLSearchParams(window.location.search);
  const data = searchParams.get("data") ?
    JSON.parse(decodeURIComponent(searchParams.get("data") || "{}")) :
    null;

  if (!data?.finalPrice) {
    navigate("/");
    return null;
  }

  const pickupLocation = extractLocation(data.pickupLocation);
  const dropoffLocation = extractLocation(data.dropoffLocation);

  const form = useForm({
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

      expeditedShipping: false,
      notes: "",
      acceptTerms: false
    },
  });

  const onSubmit = async (formData) => {
    try {
      const updatedData = {
        ...data,
        ...formData,
      };
      navigate(`/thank-you?data=${encodeURIComponent(JSON.stringify(updatedData))}`);
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description: "There was a problem submitting the form. Please try again.",
        variant: "destructive",
      });
    }
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

  const FormSection = ({ title, children }) => (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-lg mx-auto">
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-xl">Complete Your Booking</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-6">
            {/* Quote Summary */}
            <div className="bg-primary/5 rounded-lg p-4">
              <h3 className="font-medium mb-3">Quote Summary</h3>
              <div className="text-sm space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <p><span className="font-medium">Date:</span> {new Date(data.shipmentDate).toLocaleDateString()}</p>
                  <p><span className="font-medium">Price:</span> ${data.finalPrice}</p>
                </div>
                <p><span className="font-medium">Vehicle:</span> {data.year} {data.make} {data.model}</p>
                <p><span className="font-medium">Transport:</span> {data.selectedTransport === "enclosed" ? "Enclosed" : "Open"}</p>
                <p><span className="font-medium">From:</span> {`${pickupLocation.city}, ${pickupLocation.state} ${pickupLocation.zip}`}</p>
                <p><span className="font-medium">To:</span> {`${dropoffLocation.city}, ${dropoffLocation.state} ${dropoffLocation.zip}`}</p>
                <div className="grid grid-cols-2 gap-2">
                  <p><span className="font-medium">Distance:</span> {data.distance} miles</p>
                  <p><span className="font-medium">Transit:</span> {data.transitTime} days</p>
                </div>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Pickup Information */}
                <FormSection title="Pickup Information">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="isPickupContact"
                        checked={isPickupContact}
                        onCheckedChange={handlePickupContactChange}
                      />
                      <label htmlFor="isPickupContact" className="text-sm">
                        I am the pickup contact
                      </label>
                    </div>

                    <div className="grid gap-4">
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
                      <FormField
                        control={form.control}
                        name="pickupStreetAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Street Address</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="pickupCity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <FormField
                            control={form.control}
                            name="pickupState"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>State</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="pickupZip"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>ZIP</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </FormSection>

                {/* Delivery Information */}
                <FormSection title="Delivery Information">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="isDeliveryContact"
                        checked={isDeliveryContact}
                        onCheckedChange={handleDeliveryContactChange}
                      />
                      <label htmlFor="isDeliveryContact" className="text-sm">
                        I am the delivery contact
                      </label>
                    </div>

                    <div className="grid gap-4">
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
                      <FormField
                        control={form.control}
                        name="deliveryStreetAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Street Address</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="deliveryCity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <FormField
                            control={form.control}
                            name="deliveryState"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>State</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="deliveryZip"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>ZIP</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </FormSection>

                {/* Additional Options */}
                <FormSection title="Additional Options">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="expeditedShipping"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="leading-none">
                            <FormLabel>Expedited Shipping</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter any special instructions or requirements"
                              className="min-h-[100px] resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </FormSection>

                {/* Terms and Conditions */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="acceptTerms"
                    render={({ field }) => (
                      <FormItem className="flex items-start gap-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-x-1 text-sm">
                          <span>I accept the</span>
                          <Dialog>
                            <DialogTrigger className="text-primary hover:underline">
                              terms and conditions
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Terms and Conditions</DialogTitle>
                              </DialogHeader>
                              <div className="max-h-[60vh] overflow-y-auto text-sm">
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

                <Button type="submit" className="w-full">
                  Confirm Booking
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}