import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import MobileContainer from "@/components/MobileContainer";

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


  notes: z.string().optional(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

function extractLocation(location: string) {
  const parts = location.split(",").map((part) => part.trim());
  let city = "",
    state = "",
    zip = "";

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
    city: city || "N/A",
    state: state || "N/A",
    zip: zip || "N/A",
  };
}

export default function Booking() {
  const [isPickupContact, setIsPickupContact] = useState(false);
  const [isDeliveryContact, setIsDeliveryContact] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const searchParams = new URLSearchParams(window.location.search);
  const data = searchParams.get("data")
    ? JSON.parse(decodeURIComponent(searchParams.get("data") || "{}"))
    : null;

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


      notes: "",
      acceptTerms: false,
    },
  });

  const onSubmit = async (formData: any) => {
    try {
      const updatedData = {
        ...data,
        ...formData,
      };
      navigate(
        `/thank-you?data=${encodeURIComponent(JSON.stringify(updatedData))}`,
      );
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description:
          "There was a problem submitting the form. Please try again.",
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
  
  return (
    <MobileContainer>
      <div className="p-4 bg-white">
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold text-[#002C42]">Complete Details</h1>
          <p className="text-xs text-gray-700 mt-1">Military Owned • Family Operated</p>
        </div>
        
        <div className="bg-white text-black border border-gray-200 mb-4">
          <div className="bg-[#002C42] text-white p-2">
            <h2 className="text-sm font-medium">Your Shipping Details</h2>
          </div>
          <div className="p-3 space-y-2 text-sm text-gray-700">
            <div>
              <span className="font-medium text-[#002C42]">Vehicle:</span>{" "}
              {data.year} {data.make} {data.model}
            </div>
            <div>
              <span className="font-medium text-[#002C42]">Transport:</span>{" "}
              {data.selectedTransport === "enclosed" ? "Enclosed" : "Open"}
            </div>
            <div>
              <span className="font-medium text-[#002C42]">Ship Date:</span>{" "}
              {new Date(data.shipmentDate).toLocaleDateString()}
            </div>
            <div>
              <span className="font-medium text-[#002C42]">From:</span>{" "}
              {`${pickupLocation.city}, ${pickupLocation.state} ${pickupLocation.zip}`}
            </div>
            <div>
              <span className="font-medium text-[#002C42]">To:</span>{" "}
              {`${dropoffLocation.city}, ${dropoffLocation.state} ${dropoffLocation.zip}`}
            </div>
            <div>
              <span className="font-medium text-[#002C42]">Price:</span>{" "}
              <span className="text-base font-bold text-green-600">${data.finalPrice}</span>
            </div>
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Pickup Details */}
            <div className="bg-white text-black border border-gray-200 mb-4">
              <div className="bg-[#002C42] text-white p-2">
                <h2 className="text-sm font-medium">Pickup Details</h2>
              </div>
              <div className="p-3 space-y-3">
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

                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="pickupContactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Contact Name</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-8 text-sm" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pickupContactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Contact Phone</FormLabel>
                        <FormControl>
                          <Input type="tel" {...field} className="h-8 text-sm" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="pickupStreetAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Street Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter street address"
                          {...field}
                          className="h-8 text-sm"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-2">
                  <FormField
                    control={form.control}
                    name="pickupCity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">City</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-8 text-sm" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pickupState"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">State</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-8 text-sm" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pickupZip"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">ZIP</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-8 text-sm" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Delivery Details */}
            <div className="bg-white text-black border border-gray-200 mb-4">
              <div className="bg-[#002C42] text-white p-2">
                <h2 className="text-sm font-medium">Delivery Details</h2>
              </div>
              <div className="p-3 space-y-3">
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

                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="deliveryContactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Contact Name</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-8 text-sm" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="deliveryContactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Contact Phone</FormLabel>
                        <FormControl>
                          <Input type="tel" {...field} className="h-8 text-sm" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="deliveryStreetAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Street Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter street address"
                          {...field}
                          className="h-8 text-sm"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-2">
                  <FormField
                    control={form.control}
                    name="deliveryCity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">City</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-8 text-sm" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="deliveryState"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">State</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-8 text-sm" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="deliveryZip"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">ZIP</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-8 text-sm" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-white text-black border border-gray-200 mb-4">
              <div className="bg-[#002C42] text-white p-2">
                <h2 className="text-sm font-medium">Additional Information</h2>
              </div>
              <div className="p-3 space-y-3">

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter any other important details about your shipment"
                          className="min-h-[80px] text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Terms and Submit */}
            <div className="bg-white text-black border border-gray-200 mb-4">
              <div className="p-3 space-y-3">
                <FormField
                  control={form.control}
                  name="acceptTerms"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1">
                        <div className="text-sm">
                          I accept the
                          <Dialog>
                            <DialogTrigger className="text-blue-600 underline hover:text-blue-800 px-1">
                              terms and conditions
                            </DialogTrigger>
                            <DialogContent className="max-w-[280px]">
                              <DialogHeader>
                                <DialogTitle>
                                  Terms and Conditions
                                </DialogTitle>
                              </DialogHeader>
                              <div className="max-h-[200px] overflow-y-auto text-xs">
                                <p>
                                  By accepting these terms, you agree to our service conditions including payment terms, cancellation policy, and liability coverage.
                                </p>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                        <FormMessage className="text-xs" />
                      </div>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-[#002C42] hover:bg-[#001c32] text-white py-2"
                >
                  Complete Reservation - No CC Required
                </Button>
                
                <p className="text-center text-xs text-gray-500">
                  No payment required until vehicle pickup
                </p>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </MobileContainer>
  );
}