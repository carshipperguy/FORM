import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { quoteFormSchema, type QuoteFormData } from "@shared/schema";
import { vehicleTypes, years, makes, modelsByMake } from "@/lib/vehicle-data";
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
      vehicleType: "car/truck/suv",
      year: "",
      make: "",
      model: "",
      pickupLocation: "",
      dropoffLocation: "",
      shipmentDate: undefined,
      name: "",
      phone: "",
      email: "",
    },
  });

  const vehicleType = form.watch("vehicleType");
  const make = form.watch("make");
  const shipmentDate = form.watch("shipmentDate");

  useEffect(() => {
    if (shipmentDate && !showContactFields) {
      setShowContactFields(true);
    }
  }, [shipmentDate]);

  const onSubmit = (data: QuoteFormData) => {
    if (!data.pickupLocation || !data.dropoffLocation) {
      return;
    }
    onCalculate(data);
  };

  const isCarTruckSuv = vehicleType === "car/truck/suv";

  return (
    <Card className="w-full max-w-[450px] mx-auto">
      <CardContent className="p-3">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <div>
              <h2 className="text-sm font-semibold mb-1.5">Origin & Destination</h2>
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="pickupLocation"
                  render={({ field }) => (
                    <FormItem className="space-y-0.5">
                      <FormLabel className="text-xs">Pickup Location</FormLabel>
                      <FormControl>
                        <LocationSelector
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Enter pickup city or ZIP"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dropoffLocation"
                  render={({ field }) => (
                    <FormItem className="space-y-0.5">
                      <FormLabel className="text-xs">Dropoff Location</FormLabel>
                      <FormControl>
                        <LocationSelector
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Enter delivery city or ZIP"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator className="my-1.5" />

            <div>
              <h2 className="text-sm font-semibold mb-1.5">Vehicle Details</h2>
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="vehicleType"
                  render={({ field }) => (
                    <FormItem className="space-y-0.5">
                      <FormLabel className="text-xs">Vehicle Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Select vehicle type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vehicleTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type.split("/").map((word) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                              ).join("/")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-1.5">
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem className="space-y-0.5">
                        <FormLabel className="text-xs">Year</FormLabel>
                        {isCarTruckSuv ? (
                          <Select onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="h-8">
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
                            <Input className="h-8 text-sm" placeholder="Year" {...field} />
                          </FormControl>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="make"
                    render={({ field }) => (
                      <FormItem className="space-y-0.5">
                        <FormLabel className="text-xs">Make</FormLabel>
                        {isCarTruckSuv ? (
                          <Select onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="h-8">
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
                            <Input className="h-8 text-sm" placeholder="Make" {...field} />
                          </FormControl>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem className="space-y-0.5">
                        <FormLabel className="text-xs">Model</FormLabel>
                        {isCarTruckSuv ? (
                          <Select onValueChange={field.onChange} disabled={!make}>
                            <FormControl>
                              <SelectTrigger className="h-8">
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
                        ) : (
                          <FormControl>
                            <Input className="h-8 text-sm" placeholder="Model" {...field} />
                          </FormControl>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <Separator className="my-1.5" />

            <div>
              <h2 className="text-sm font-semibold mb-1.5">Shipment Details</h2>
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="shipmentDate"
                  render={({ field }) => (
                    <FormItem className="space-y-0.5">
                      <FormLabel className="text-xs">Shipment Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full h-8 pl-3 text-left font-normal text-sm",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {showContactFields && (
                  <div className="grid grid-cols-3 gap-1.5">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="space-y-0.5">
                          <FormControl>
                            <Input className="h-8 text-sm" placeholder="Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem className="space-y-0.5">
                          <FormControl>
                            <Input className="h-8 text-sm" placeholder="Phone" type="tel" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="space-y-0.5">
                          <FormControl>
                            <Input className="h-8 text-sm" placeholder="Email" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full h-8 text-sm mt-3" disabled={isCalculating}>
              {isCalculating ? "Calculating..." : "Submit"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}