import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { quoteFormSchema, type QuoteFormData } from "@shared/schema";
import { vehicleTypes, years, makes, modelsByMake, newMakesWithFreeTextModels } from "@/lib/vehicle-data";
import { LocationSelector } from "@/components/location-selector";

type QuoteFormProps = {
  onCalculate: (data: QuoteFormData) => void;
  isCalculating: boolean;
};

export function QuoteForm({ onCalculate, isCalculating }: QuoteFormProps) {
  const [showContactFields, setShowContactFields] = useState(false);

  const form = useForm<QuoteFormData>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      vehicleType: undefined,
      year: "",
      make: "",
      model: "",
      pickupLocation: "",
      pickupZip: "",  // Add pickup ZIP field
      dropoffLocation: "",
      dropoffZip: "",  // Add dropoff ZIP field
      shipmentDate: undefined,
      name: "",
      phone: "",
      email: "",
    },
  });

  const vehicleType = form.watch("vehicleType");
  const make = form.watch("make");
  const year = form.watch("year");
  const shipmentDate = form.watch("shipmentDate");
  
  // Check if vehicle year is pre-1990 for free-text model input
  const isVehiclePre1990 = year && parseInt(year) < 1990;

  useEffect(() => {
    if (shipmentDate && !showContactFields) {
      setShowContactFields(true);
    }
  }, [shipmentDate]);

  const onSubmit = (data: QuoteFormData) => {
    if (!data.pickupLocation || !data.dropoffLocation) {
      return;
    }
    
    // Make sure the ZIP codes are explicitly included in the data object
    const formZips = {
      pickupZip: form.getValues("pickupZip"),
      dropoffZip: form.getValues("dropoffZip")
    };
    
    // Create an enriched data object with all fields, including zipCodes
    const enrichedData = {
      ...data,
      ...formZips
    };
    
    // Log the entire form data before submission to verify ZIP codes are included
    console.log("QuoteForm onSubmit - Full form data:", enrichedData);
    console.log("ZIP codes being sent:", formZips);
    
    // Pass the enriched data with ZIP codes to parent
    onCalculate(enrichedData);
  };

  const isCarTruckSuv = vehicleType === "car/truck/suv";

  return (
    <Card className="form-container border-0 shadow-none">
      <CardContent className="p-[10px] pt-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-[10px]">
            <div>
              <div className="bg-[#1e3a8a] text-white text-[10px] font-medium p-1 mb-1.5 rounded-sm">
                ORIGIN & DESTINATION
              </div>
              <div className="space-y-1">
                <FormField
                  control={form.control}
                  name="pickupLocation"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormControl>
                        <LocationSelector
                          value={field.value}
                          onChange={(value, zipCode) => {
                            field.onChange(value);
                            // Store the ZIP code in a separate field
                            form.setValue("pickupZip", zipCode || "");
                            console.log("Setting pickupZip:", zipCode, "for location:", value);
                            // Check the current value after setting
                            setTimeout(() => {
                              console.log("Pickup ZIP in form:", form.getValues("pickupZip"));
                            }, 100);
                          }}
                          placeholder="Ship From"
                        />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dropoffLocation"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormControl>
                        <LocationSelector
                          value={field.value}
                          onChange={(value, zipCode) => {
                            field.onChange(value);
                            // Store the ZIP code in a separate field
                            form.setValue("dropoffZip", zipCode || "");
                            console.log("Setting dropoffZip:", zipCode, "for location:", value);
                            // Check the current value after setting
                            setTimeout(() => {
                              console.log("Dropoff ZIP in form:", form.getValues("dropoffZip"));
                            }, 100);
                          }}
                          placeholder="Ship To"
                        />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div>
              <div className="bg-[#1e3a8a] text-white text-[10px] font-medium p-1 mb-1.5 rounded-sm">
                VEHICLE DETAILS
              </div>
              <div className="space-y-1">
                <FormField
                  control={form.control}
                  name="vehicleType"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Select Vehicle Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="car/truck/suv">Car/Truck/SUV</SelectItem>
                          {vehicleTypes.filter(type => type !== "car/truck/suv").map((type) => (
                            <SelectItem key={type} value={type}>
                              {type.split("/").map((word) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                              ).join("/")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-1">
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem className="space-y-0">
                        {isCarTruckSuv ? (
                          <Select onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Year" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {years.map((year) => (
                                <SelectItem key={year} value={year}>
                                  {year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <FormControl>
                            <Input className="h-8 text-xs" placeholder="Year" {...field} />
                          </FormControl>
                        )}
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="make"
                    render={({ field }) => (
                      <FormItem className="space-y-0">
                        {isCarTruckSuv ? (
                          <Select onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Make" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {makes.map((make) => (
                                <SelectItem key={make} value={make}>
                                  {make}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <FormControl>
                            <Input className="h-8 text-xs" placeholder="Make" {...field} />
                          </FormControl>
                        )}
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      {isCarTruckSuv ? (
                        (make && newMakesWithFreeTextModels.includes(make)) || isVehiclePre1990 ? (
                          // Free text input for new vehicle makes or pre-1990 vehicles
                          <FormControl>
                            <Input className="h-8 text-xs" placeholder="Model" {...field} />
                          </FormControl>
                        ) : (
                          // Select dropdown for original makes of 1990+ vehicles
                          <Select onValueChange={field.onChange} disabled={!make}>
                            <FormControl>
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Model" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {make && modelsByMake[make]?.map((model) => (
                                <SelectItem key={model} value={model}>
                                  {model}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )
                      ) : (
                        // Free text input for non-car/truck/SUV vehicles
                        <FormControl>
                          <Input className="h-8 text-xs" placeholder="Model" {...field} />
                        </FormControl>
                      )}
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div>
              <div className="bg-[#1e3a8a] text-white text-[10px] font-medium p-1 mb-1.5 rounded-sm">
                SHIPMENT DETAILS
              </div>
              <div className="space-y-1">
                <FormField
                  control={form.control}
                  name="shipmentDate"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full h-8 pl-3 text-left font-normal text-xs",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "MM-dd-yy")
                              ) : (
                                <span>Shipping Date</span>
                              )}
                              <CalendarIcon className="ml-auto h-3 w-3 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />

                {showContactFields && (
                  <div className="space-y-1 pt-1">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="space-y-0">
                          <FormControl>
                            <Input className="h-8 text-xs" placeholder="Your Name" {...field} />
                          </FormControl>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-1">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem className="space-y-0">
                            <FormControl>
                              <Input className="h-8 text-xs" placeholder="Phone" type="tel" {...field} />
                            </FormControl>
                            <FormMessage className="text-[10px]" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className="space-y-0">
                            <FormControl>
                              <Input className="h-8 text-xs" placeholder="Email" type="email" {...field} />
                            </FormControl>
                            <FormMessage className="text-[10px]" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full h-8 text-xs font-bold mt-1 bg-[#dc2626] hover:bg-[#b91c1c]" disabled={isCalculating}>
              {isCalculating ? "Calculating..." : "Get Instant Quote"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}