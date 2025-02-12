// Pricing constants
const BASE_RATE_PER_MILE = 0.614;  // Base rate per mile (for long distances)
const MINIMUM_PRICE = 450;          // Minimum charge for short routes

// Vehicle type multipliers
const VEHICLE_MULTIPLIERS = {
  "car/truck/suv": 1.0,
  "boat": 1.4,
  "golf cart": 0.8,
  "motorcycle": 0.7,
  "rv/5th wheel": 1.8,
  "travel trailer": 1.6,
  "atv/utv": 0.75,
  "heavy equipment": 2.0,
  "other": 1.3
} as const;

const ENCLOSED_MULTIPLIER = 1.40;   // Enclosed transport is 40% more expensive

export type VehicleType = keyof typeof VEHICLE_MULTIPLIERS;

interface PricingResult {
  openTransport: number;
  enclosedTransport: number;
  transitTime: number;
  message?: string;
}

export function calculatePricing(
  distance: number,
  vehicleType: VehicleType,
  date: Date = new Date()
): PricingResult {
  // Calculate transit time based on distance
  // Assume average of 300 miles per day plus 1 day for pickup/delivery
  const transitTime = Math.ceil(distance / 300) + 1;

  // For short distances, return message only
  if (distance <= 100) {
    return {
      openTransport: 0,
      enclosedTransport: 0,
      transitTime,
      message: "For short distances under 100 miles, please contact us directly for a custom quote."
    };
  }

  // Calculate base price with distance multiplier
  let basePrice = distance <= 800
    ? distance * BASE_RATE_PER_MILE * 1.10  // 10% higher for mid-range trips
    : distance * BASE_RATE_PER_MILE;

  // Ensure minimum price
  basePrice = Math.max(basePrice, MINIMUM_PRICE);

  // Apply vehicle type multiplier
  const vehicleMultiplier = VEHICLE_MULTIPLIERS[vehicleType];
  const openTransportPrice = basePrice * vehicleMultiplier;
  const enclosedTransportPrice = openTransportPrice * ENCLOSED_MULTIPLIER;

  // Round all prices to nearest whole dollar
  return {
    openTransport: Math.round(openTransportPrice),
    enclosedTransport: Math.round(enclosedTransportPrice),
    transitTime
  };
}