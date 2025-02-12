export function calculatePricing(
  distance: number,
  vehicleType: string,
  date: Date = new Date()
): {
  openTransport: number;
  enclosedTransport: number;
  transitTime: number;
} {
  // Base rate per mile
  const openBaseRate = 1.2;  // $1.20 per mile
  const enclosedBaseRate = 1.8;  // $1.80 per mile

  // Minimum prices
  const openMinPrice = 495;
  const enclosedMinPrice = 795;

  // Calculate raw prices based on distance
  let openPrice = Math.max(distance * openBaseRate, openMinPrice);
  let enclosedPrice = Math.max(distance * enclosedBaseRate, enclosedMinPrice);

  // Round to nearest $5
  openPrice = Math.ceil(openPrice / 5) * 5;
  enclosedPrice = Math.ceil(enclosedPrice / 5) * 5;

  // Calculate transit time based on distance
  // Assume average of 300 miles per day plus 1 day for pickup/delivery
  const transitDays = Math.ceil(distance / 300) + 1;

  return {
    openTransport: openPrice,
    enclosedTransport: enclosedPrice,
    transitTime: transitDays
  };
}