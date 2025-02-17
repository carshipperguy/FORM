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
    <Card className="w-full max-w-[500px] mx-auto">
      <CardContent className="p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <h2 className="text-base font-semibold mb-2">Origin & Destination</h2>
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="pickupLocation"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-sm">Pickup Location</FormLabel>
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
                    <FormItem className="space-y-1">
                      <FormLabel className="text-sm">Dropoff Location</FormLabel>
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

            <Separator className="my-2" />

            <div>
              <h2 className="text-base font-semibold mb-2">Vehicle Details</h2>
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="vehicleType"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-sm">What Would You Like To Ship?</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
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

                <div className="grid grid-cols-3 gap-2">
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-sm">Year</FormLabel>
                        {isCarTruckSuv ? (
                          <Select onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
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
                            <Input placeholder="Year" {...field} />
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
                      <FormItem className="space-y-1">
                        <FormLabel className="text-sm">Make</FormLabel>
                        {isCarTruckSuv ? (
                          <Select onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
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
                            <Input placeholder="Make" {...field} />
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
                      <FormItem className="space-y-1">
                        <FormLabel className="text-sm">Model</FormLabel>
                        {isCarTruckSuv ? (
                          <Select onValueChange={field.onChange} disabled={!make}>
                            <FormControl>
                              <SelectTrigger>
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
                            <Input placeholder="Model" {...field} />
                          </FormControl>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <Separator className="my-2" />

            <div>
              <h2 className="text-base font-semibold mb-2">Shipment Details</h2>
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="shipmentDate"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-sm">Shipment Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
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
                  <div className="grid grid-cols-3 gap-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormControl>
                            <Input placeholder="Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormControl>
                            <Input placeholder="Phone" type="tel" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormControl>
                            <Input placeholder="Email" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full mt-4" disabled={isCalculating}>
              {isCalculating ? "Calculating..." : "Submit"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}