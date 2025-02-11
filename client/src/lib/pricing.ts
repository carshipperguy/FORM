export function calculatePricing(
  distance: number,
  vehicleType: string,
  date: Date = new Date()
): {
  openTransport: number;
  enclosedTransport: number;
  transitTime: number;
} {
  // Fixed price for testing
  return {
    openTransport: 995,
    enclosedTransport: 1395,
    transitTime: 3 // Example transit time
  };
}