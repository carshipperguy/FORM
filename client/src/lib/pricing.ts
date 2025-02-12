// Pricing constants
const BASE_RATE_PER_MILE = 0.614;  // Sedan rate per mile (for long distances)
const SUV_MULTIPLIER = 1.05;        // SUV costs 5% more than sedan
const TRUCK_MULTIPLIER = 1.05;      // Pickup truck costs 5% more than SUV
const ENCLOSED_MULTIPLIER = 1.40;   // Enclosed transport is 40% more expensive
const MINIMUM_PRICE = 450;          // Minimum charge for short routes

export type VehicleType = 'Sedan' | 'SUV' | 'Pickup Truck';

interface PricingResult {
  message?: string;
  openTransport?: {
    Sedan: number;
    SUV: number;
    'Pickup Truck': number;
  };
  enclosedTransport?: {
    Sedan: number;
    SUV: number;
    'Pickup Truck': number;
  };
  transitTime: number;
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
  if (distance <= 500) {
    return {
      message: "Thank you for your request! For short distances, please contact us directly for a custom quote.",
      transitTime
    };
  }

  // Calculate base sedan price with distance multiplier
  let sedanPrice = distance <= 800
    ? distance * BASE_RATE_PER_MILE * 1.10  // 10% higher for mid-range trips
    : distance * BASE_RATE_PER_MILE;

  // Ensure minimum price
  sedanPrice = Math.max(sedanPrice, MINIMUM_PRICE);

  // Calculate prices for SUVs and Pickup Trucks
  const suvPrice = sedanPrice * SUV_MULTIPLIER;
  const truckPrice = suvPrice * TRUCK_MULTIPLIER;

  // Calculate enclosed transport prices
  const sedanEnclosed = sedanPrice * ENCLOSED_MULTIPLIER;
  const suvEnclosed = suvPrice * ENCLOSED_MULTIPLIER;
  const truckEnclosed = truckPrice * ENCLOSED_MULTIPLIER;

  // Round all prices to nearest whole dollar
  return {
    openTransport: {
      Sedan: Math.round(sedanPrice),
      SUV: Math.round(suvPrice),
      'Pickup Truck': Math.round(truckPrice)
    },
    enclosedTransport: {
      Sedan: Math.round(sedanEnclosed),
      SUV: Math.round(suvEnclosed),
      'Pickup Truck': Math.round(truckEnclosed)
    },
    transitTime
  };
}