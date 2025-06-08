import { useState, useEffect } from "react";
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
import { Loader2 } from "lucide-react";

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
    // First part is the city
    city = parts[0];
    
    // Last part should contain state and zip
    const lastPart = parts[parts.length - 1];
    
    // Try to match "STATE ZIP" pattern (e.g., "NY 10001")
    const stateZipPattern = /([A-Z]{2})\s+(\d{5}(-\d{4})?)/;
    const match = lastPart.match(stateZipPattern);

    if (match) {
      state = match[1];
      zip = match[2];
    } else {
      // If no match, try to extract state and zip separately
      // Check if last part only contains the state
      if (/^[A-Z]{2}$/.test(lastPart)) {
        state = lastPart;
        // Try to find zip in second to last part if there are more than 2 parts
        if (parts.length > 2) {
          const zipMatch = parts[parts.length - 2].match(/(\d{5}(-\d{4})?)/);
          if (zipMatch) {
            zip = zipMatch[1];
          }
        }
      } else {
        // Try to parse state from letters and zip from numbers
        const stateMatch = lastPart.match(/([A-Z]{2})/);
        const zipMatch = lastPart.match(/(\d{5}(-\d{4})?)/);
        
        if (stateMatch) state = stateMatch[1];
        if (zipMatch) zip = zipMatch[1];
      }
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
  const [isSubmitting, setIsSubmitting] = useState(false);
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
  
  // Use the pricing library directly for consistent pricing across all pages
  useEffect(() => {
    async function recalculatePricing() {
      if (!data?.vehicleType || !data?.distance) return;
      
      try {
        // Import the pricing calculation function
        const { calculatePrice } = await import('../lib/pricing');
        
        // Re-calculate pricing using the pricing library
        const pricing = calculatePrice(
          data.distance,
          data.vehicleType,
          new Date(),
          data.pickupLocation,
          data.dropoffLocation
        );
        
        console.log("Recalculated pricing:", pricing);
        
        // Set the correct price based on transport type
        if (data.selectedTransport === 'enclosed') {
          data.finalPrice = pricing.enclosedTransport;
        } else {
          data.finalPrice = pricing.openTransport;
        }
        
        console.log("Final price set to:", data.finalPrice);
      } catch (error) {
        console.error("Error recalculating price:", error);
        // Keep the existing price if there's an error
      }
    }
    
    recalculatePricing();
  }, [data]);
  
  console.log("FINAL PRICE:", {
    distance: data?.distance,
    transportType: data?.selectedTransport,
    finalPrice: data?.finalPrice
  });

  // Get location data - preferably use the explicit ZIP codes if available
  const pickupLocation = {
    ...extractLocation(data.pickupLocation),
    zip: data.pickupZip || extractLocation(data.pickupLocation).zip // Use provided ZIP if available
  };
  
  const dropoffLocation = {
    ...extractLocation(data.dropoffLocation),
    zip: data.dropoffZip || extractLocation(data.dropoffLocation).zip // Use provided ZIP if available
  };
  
  console.log("Using ZIP codes in booking:", { 
    pickupZip: pickupLocation.zip, 
    dropoffZip: dropoffLocation.zip 
  });

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
    setIsSubmitting(true);
    try {
      // Create formatted address strings
      const pickupAddress = `${formData.pickupStreetAddress}, ${formData.pickupCity}, ${formData.pickupState} ${formData.pickupZip}`;
      const dropoffAddress = `${formData.deliveryStreetAddress}, ${formData.deliveryCity}, ${formData.deliveryState} ${formData.deliveryZip}`;
      
      // Combine all data
      const updatedData = {
        ...data,
        ...formData,
        submissionDate: new Date().toISOString(),
        
        // Preserve Facebook/Meta attribution parameters from the original data
        fbclid: data.fbclid || null,
        utm_source: data.utm_source || null,
        utm_medium: data.utm_medium || null,
        utm_campaign: data.utm_campaign || null,
        utm_term: data.utm_term || null,
        utm_content: data.utm_content || null,
        referrer: data.referrer || null,
        
        // Add properly formatted address fields for webhook integration
        pickupContactName: formData.pickupContactName,
        pickupContactPhone: formData.pickupContactPhone,
        pickupAddress: pickupAddress,
        
        dropoffContactName: formData.deliveryContactName,
        dropoffContactPhone: formData.deliveryContactPhone,
        dropoffAddress: dropoffAddress,
        
        // Add transport selection details
        transportType: data.selectedTransport,
        selectedPrice: data.finalPrice,
        isExpeditedShipping: data.guaranteedDate
      };
      
      console.log("🟢 FORM SUBMISSION - DEBUGGING ORDER BOOKING WEBHOOK");
      console.log("📝 SENDING COMPLETE BOOKING DATA TO FINAL SUBMISSION ENDPOINT");
      console.log("📋 BOOKING DATA KEYS:", Object.keys(updatedData));
      
      // Log critical data elements needed for Zapier integration
      console.log("🧾 CRITICAL DATA CHECK:");
      console.log("- Name:", updatedData.name);
      console.log("- Email:", updatedData.email);
      console.log("- Phone:", updatedData.phone);
      console.log("- Transport Type:", updatedData.transportType);
      console.log("- Price:", updatedData.selectedPrice);
      console.log("- Pickup Address:", updatedData.pickupAddress);
      console.log("- Dropoff Address:", updatedData.dropoffAddress);
      
      // Log important fields for address parsing
      console.log("🏠 ADDRESS DATA CHECK:");
      console.log("- Pickup Street:", formData.pickupStreetAddress);
      console.log("- Pickup City:", formData.pickupCity);
      console.log("- Pickup State:", formData.pickupState);
      console.log("- Pickup ZIP:", formData.pickupZip);
      console.log("- Delivery Street:", formData.deliveryStreetAddress);
      console.log("- Delivery City:", formData.deliveryCity);
      console.log("- Delivery State:", formData.deliveryState);
      console.log("- Delivery ZIP:", formData.deliveryZip);
      
      console.log("📅 DATES:");
      console.log("- Shipment Date:", data.shipmentDate);
      
      try {
        // Send the complete data to our new final-submission endpoint
        console.log("🚀 CALLING FINAL-SUBMISSION API ENDPOINT AT: /api/final-submission");
        // Log the exact JSON payload we're sending
        console.log("📦 PAYLOAD BEING SENT:", JSON.stringify(updatedData).substring(0, 500));
        
        // Get the current domain to handle iframe scenarios
        const currentDomain = window.location.origin;
        console.log("Current domain for API request:", currentDomain);
        
        // Use the full URL to avoid issues when embedded in an iframe
        const apiUrl = `${currentDomain}/api/final-submission`;
        console.log("Using API URL:", apiUrl);
        
        // Use window.fetch directly to ensure we're not hitting any caching or framework issues
        const response = await window.fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store",
            "X-Debug-Timestamp": new Date().toISOString()
          },
          // Include credentials to ensure cookies are sent even for cross-origin requests
          credentials: "include",
          body: JSON.stringify(updatedData),
        });
        
        console.log("📡 API RESPONSE STATUS:", response.status);
        
        if (response.ok) {
          const responseData = await response.json();
          console.log("✅ SUCCESSFULLY SENT COMPLETE BOOKING DATA TO ZAPIER", responseData);
        } else {
          const errorText = await response.text();
          console.error("❌ ERROR SENDING FINAL SUBMISSION:", errorText);
          console.error("❌ ERROR STATUS:", response.status);
        }
      } catch (webhookError) {
        console.error("❌ WEBHOOK REQUEST FAILED:", webhookError);
        // Continue with booking process despite webhook failure
      }
      
      // Use setTimeout to create a smooth transition
      // This helps prevent the "strange behavior" during page transitions
      setTimeout(() => {
        console.log("🔄 Redirecting to thank-you page with complete order data");
        console.log("🧐 NOTE: The final order webhook will be triggered from the thank-you page");
        // Include a flag that confirms this data came from booking
        updatedData.fromBookingForm = true;
        navigate(
          `/thank-you?data=${encodeURIComponent(JSON.stringify(updatedData))}`,
        );
      }, 500);
      
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description:
          "There was a problem submitting the form. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
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

        
        <div className="bg-white text-black border border-gray-200 mb-4">
          <div className="bg-[#002C42] text-white p-2 flex items-center justify-center">
            <img
              src="https://amerigoautotransport.net/wp-content/uploads/2024/09/Amerigo-auto-transport-logo.png"
              alt="Amerigo Auto Transport Logo"
              style={{
                width: '140px',
                maxWidth: '100%',
                height: 'auto',
                objectFit: 'contain'
              }}
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/140x50?text=Amerigo+Logo';
              }}
            />
          </div>
          <div className="p-3 space-y-2 text-sm text-gray-700">
            <div>
              <span className="font-medium text-[#002C42]">Vehicle:</span>{" "}
              {data.year} {data.make} {data.model}
            </div>
            <div>
              <span className="font-medium text-[#002C42]">Transport:</span>{" "}
              {data.selectedTransport === "enclosed" ? "Enclosed" : "Open"}
              {data.guaranteedDate && " (Express)"}
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
                          <Input {...field} className="h-8 text-sm bg-gray-50" readOnly />
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
                          <Input {...field} className="h-8 text-sm bg-gray-50" readOnly />
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
                          <Input {...field} className="h-8 text-sm bg-gray-50" readOnly />
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
                          <Input {...field} className="h-8 text-sm bg-gray-50" readOnly />
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
                          <Input {...field} className="h-8 text-sm bg-gray-50" readOnly />
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
                          <Input {...field} className="h-8 text-sm bg-gray-50" readOnly />
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
                            <DialogContent className="max-w-[90vw] md:max-w-[500px] w-[290px] md:w-[500px]">
                              <DialogHeader className="border-b border-gray-200 pb-2">
                                <DialogTitle className="text-[#002C42] text-lg font-semibold">
                                  Terms and Conditions
                                </DialogTitle>
                              </DialogHeader>
                              <div className="max-h-[350px] overflow-y-auto text-sm py-2 pr-2">
                                <div className="bg-[#f8fafc] p-3 rounded-md mb-4 border-l-4 border-[#002C42]">
                                  <h3 className="font-bold text-[#002C42] mb-2">Amerigo Auto Transport – Terms of Service</h3>
                                  <p className="text-gray-600 text-xs">Last updated: April 10, 2025</p>
                                </div>
                                
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-semibold text-[#002C42] mb-1">1. Agreement to Terms</h4>
                                    <p className="pl-1 text-gray-700">By using our auto transport services, you agree to these Terms and Conditions in their entirety.</p>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-semibold text-[#002C42] mb-1">2. Service Description</h4>
                                    <p className="pl-1 text-gray-700">Amerigo Auto Transport arranges for the transportation of vehicles between specified locations through contracted carriers. We operate as a licensed broker, connecting customers with qualified, vetted auto transport carriers.</p>
                                  </div>
                                
                                  <div>
                                    <h4 className="font-semibold text-[#002C42] mb-1">3. Pricing and Payment</h4>
                                    <ul className="pl-4 list-disc space-y-1 text-gray-700">
                                      <li>The price quoted is based on the information provided at the time of booking, including vehicle type, condition, operability, transport type, pickup and dropoff locations.</li>
                                      <li>Payment methods accepted include credit card, debit card, or electronic payment.</li>
                                      <li>A deposit may be required at the time of booking, with the remaining balance due before or at the time of delivery.</li>
                                    </ul>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-semibold text-[#002C42] mb-1">4. Cancellation Policy</h4>
                                    <ul className="pl-4 list-disc space-y-1 text-gray-700">
                                      <li>There is no cancellation fee unless a carrier has already been assigned and dispatched.</li>
                                      <li>Once a carrier is assigned and the order is dispatched, an obligation has been made to that specific carrier.</li>
                                      <li>Amerigo Auto Transport reserves the right to cancel service due to unforeseen circumstances.</li>
                                    </ul>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-semibold text-[#002C42] mb-1">5. Vehicle Condition</h4>
                                    <ul className="pl-4 list-disc space-y-1 text-gray-700">
                                      <li>Customers must provide accurate information regarding the vehicle's condition and operability.</li>
                                      <li>Vehicles must be in the same condition at pickup as described at the time of booking.</li>
                                      <li>Personal belongings should be removed unless explicitly approved.</li>
                                    </ul>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-semibold text-[#002C42] mb-1">6. Insurance and Liability</h4>
                                    <ul className="pl-4 list-disc space-y-1 text-gray-700">
                                      <li>All carriers maintain active insurance coverage as required by federal law.</li>
                                      <li>A pre-transport inspection report will document the vehicle's condition.</li>
                                      <li>Any damage claims must be noted on the delivery inspection report.</li>
                                    </ul>
                                  </div>
                                </div>
                                <div className="mt-4 pt-3 border-t border-gray-200 flex justify-end">
                                  <Button variant="outline" className="text-sm bg-[#002C42] text-white hover:bg-[#001c32]" onClick={() => {
                                    const closeButton = document.querySelector("[data-state='open'] button[aria-label='Close']") as HTMLButtonElement;
                                    closeButton?.click();
                                  }}>
                                    I Understand
                                  </Button>
                                </div>
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
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Submit"
                  )}
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