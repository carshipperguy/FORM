import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, XCircle, Calendar, User, Mail, Phone, MapPin, Car } from "lucide-react";
import { format } from "date-fns";

interface QuoteData {
  id: string;
  timestamp: number;
  formType: "quote" | "final";
  data: any;
  success: boolean;
  source?: "webhook" | "database";
}

interface QuotesResponse {
  success: boolean;
  count: number;
  quotes: QuoteData[];
  breakdown?: {
    webhook: number;
    database: number;
  };
}

export default function QuotesToday() {
  const { data, isLoading, error } = useQuery<QuotesResponse>({
    queryKey: ["/api/quotes/today"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Loading today's quotes...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-4 text-red-600">Error loading quotes</h1>
          <p className="text-gray-600">Unable to fetch quotes. Please try again later.</p>
        </div>
      </div>
    );
  }

  const quotes = data?.quotes || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900" data-testid="page-title">
              Today's Quotes
            </h1>
            <p className="text-gray-600 mt-2">
              {format(new Date(), "EEEE, MMMM d, yyyy")}
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-blue-600" data-testid="quote-count">
              {quotes.length}
            </div>
            <div className="text-sm text-gray-600">
              {quotes.length === 1 ? "lead" : "leads"} submitted
            </div>
            {data?.breakdown && (data.breakdown.webhook > 0 || data.breakdown.database > 0) && (
              <div className="text-xs text-gray-500 mt-1">
                {data.breakdown.database > 0 && `${data.breakdown.database} stored`}
                {data.breakdown.webhook > 0 && data.breakdown.database > 0 && " • "}
                {data.breakdown.webhook > 0 && `${data.breakdown.webhook} in-memory`}
              </div>
            )}
          </div>
        </div>

        {quotes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-xl font-medium text-gray-600" data-testid="no-quotes-message">
                No quotes submitted today
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Check back later or try a different date
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {quotes.map((quote) => (
              <Card key={quote.id} className="hover:shadow-lg transition-shadow" data-testid={`quote-card-${quote.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">
                          Quote #{quote.id.slice(-8)}
                        </CardTitle>
                        <Badge
                          variant={quote.formType === "final" ? "default" : "secondary"}
                          data-testid={`badge-type-${quote.id}`}
                        >
                          {quote.formType === "final" ? "Final Booking" : "Initial Quote"}
                        </Badge>
                        {quote.success ? (
                          <Badge variant="outline" className="text-green-600 border-green-600" data-testid={`badge-status-${quote.id}`}>
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Sent
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-red-600 border-red-600" data-testid={`badge-status-${quote.id}`}>
                            <XCircle className="w-3 h-3 mr-1" />
                            Failed
                          </Badge>
                        )}
                      </div>
                      <CardDescription>
                        Submitted at {format(new Date(quote.timestamp), "h:mm a")}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {quote.data.name && (
                      <div className="space-y-4">
                        <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wide">
                          Customer Information
                        </h3>
                        <div className="space-y-3">
                          {quote.data.name && (
                            <div className="flex items-center gap-3">
                              <User className="w-4 h-4 text-gray-400" />
                              <span data-testid={`customer-name-${quote.id}`}>{quote.data.name}</span>
                            </div>
                          )}
                          {quote.data.email && (
                            <div className="flex items-center gap-3">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span className="text-sm" data-testid={`customer-email-${quote.id}`}>{quote.data.email}</span>
                            </div>
                          )}
                          {quote.data.phone && (
                            <div className="flex items-center gap-3">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span className="text-sm" data-testid={`customer-phone-${quote.id}`}>{quote.data.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wide">
                        Vehicle Details
                      </h3>
                      <div className="space-y-3">
                        {(quote.data.year || quote.data.make || quote.data.model) && (
                          <div className="flex items-center gap-3">
                            <Car className="w-4 h-4 text-gray-400" />
                            <span data-testid={`vehicle-info-${quote.id}`}>
                              {quote.data.year} {quote.data.make} {quote.data.model}
                            </span>
                          </div>
                        )}
                        {quote.data.vehicleType && (
                          <div className="text-sm text-gray-600">
                            Type: <span className="font-medium" data-testid={`vehicle-type-${quote.id}`}>{quote.data.vehicleType}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4 md:col-span-2">
                      <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wide">
                        Shipping Route
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-4 h-4 text-green-600 mt-1" />
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Pickup</div>
                            <div className="font-medium" data-testid={`pickup-location-${quote.id}`}>
                              {quote.data.pickupLocation || "Not specified"}
                            </div>
                            {quote.data.pickupZip && (
                              <div className="text-sm text-gray-600">{quote.data.pickupZip}</div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <MapPin className="w-4 h-4 text-red-600 mt-1" />
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Delivery</div>
                            <div className="font-medium" data-testid={`dropoff-location-${quote.id}`}>
                              {quote.data.dropoffLocation || "Not specified"}
                            </div>
                            {quote.data.dropoffZip && (
                              <div className="text-sm text-gray-600">{quote.data.dropoffZip}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {(quote.data.distance || quote.data.shipmentDate) && (
                      <div className="md:col-span-2 pt-4 border-t">
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          {quote.data.distance && (
                            <div>
                              <div className="text-gray-500 mb-1">Distance</div>
                              <div className="font-medium" data-testid={`distance-${quote.id}`}>
                                {Math.round(quote.data.distance)} miles
                              </div>
                            </div>
                          )}
                          {quote.data.shipmentDate && (
                            <div>
                              <div className="text-gray-500 mb-1">Shipment Date</div>
                              <div className="font-medium" data-testid={`shipment-date-${quote.id}`}>
                                {typeof quote.data.shipmentDate === 'string' 
                                  ? quote.data.shipmentDate 
                                  : format(new Date(quote.data.shipmentDate), "MMM d, yyyy")}
                              </div>
                            </div>
                          )}
                          {quote.data.selectedPrice && (
                            <div>
                              <div className="text-gray-500 mb-1">Price</div>
                              <div className="font-medium text-green-600" data-testid={`price-${quote.id}`}>
                                ${quote.data.selectedPrice}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
