export function calculatePricing(
  distance: number,
  vehicleType: string,
  date: Date = new Date()
): {
  openTransport: number;
  enclosedTransport: number;
  transitTime: number;
} {
  if (distance < 500) {
    return {
      openTransport: 0,
      enclosedTransport: 0,
      transitTime: Math.ceil(distance / 400),
    };
  }

  // Base price calculation
  let basePrice = distance * 0.614;
  if (distance <= 800) {
    basePrice *= 1.1; // 10% margin for 500-800 miles
  }

  // Minimum price enforcement
  basePrice = Math.max(basePrice, 450);

  // Vehicle type adjustments
  if (vehicleType === "suv") {
    basePrice *= distance < 1600 ? 1.25 : 1.075;
  } else if (vehicleType === "pickup") {
    basePrice *= 1.289;
  }

  // Seasonal adjustments
  const month = date.getMonth() + 1;
  if ((month >= 10 && month <= 12) || (month >= 1 && month <= 3)) {
    basePrice *= 1.35; // Southbound winter pricing
  } else if (month >= 4 && month <= 9) {
    basePrice *= 1.35; // Northbound summer pricing
  }

  // Calculate enclosed transport price
  let enclosedPrice = basePrice * 1.4;
  if (vehicleType === "pickup") {
    enclosedPrice *= 1.2;
  }

  return {
    openTransport: Math.round(basePrice),
    enclosedTransport: Math.round(enclosedPrice),
    transitTime: Math.ceil(distance / 400),
  };
}
