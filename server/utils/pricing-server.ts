// Server-side pricing calculation (mirrors client/src/lib/pricing.ts)
// Inlined constants to avoid browser-only module paths

const MULTIPLIER_MODE = 'UNIVERSAL_40_PLUS_SHORTHAUL_40';
const ENABLE_NEW_SPECIAL_PRICING = true;

const BASE_RATE_PER_MILE = 0.614;
const ENCLOSED_MULTIPLIER = 1.40;
const MIN_LOCAL_DISTANCE_MILES = 120;

const VEHICLE_MULTIPLIERS: Record<string, number> = {
  "car/truck/suv": 1.0,
  "boat": 1.4,
  "golf cart": 0.8,
  "motorcycle": 0.7,
  "atv/utv": 0.75,
  "heavy equipment": 2.0,
  "other": 1.3,
};

const NORTHEAST_STATES = ['ME', 'NH', 'VT', 'MA', 'RI', 'CT', 'NY', 'NJ', 'PA'];

function extractState(location: string): string | null {
  if (!location) return null;
  const stateMatch = location.match(/\b([A-Z]{2})\b/);
  return stateMatch ? stateMatch[1] : null;
}

function calculateSpecialPricing(miles: number): number {
  return Math.max(miles * 3.0, 750);
}

function isSpecialVehicleType(vehicleType: string): boolean {
  const lowerType = vehicleType.toLowerCase();
  return (
    lowerType === 'rv' ||
    lowerType === 'rv/5th wheel' ||
    lowerType === 'travel trailer' ||
    lowerType.includes('rv') ||
    lowerType.includes('5th wheel') ||
    lowerType.includes('travel trailer')
  );
}

export interface PricingResult {
  openTransport: number;
  enclosedTransport: number;
  transitTime: number;
  message?: string;
}

export function calculatePriceServer(
  distance: number,
  vehicleType: string,
  date: Date = new Date(),
  pickupLocation?: string,
  dropoffLocation?: string,
): PricingResult {
  if (distance == null || Number.isNaN(distance)) {
    return { openTransport: 0, enclosedTransport: 0, transitTime: 0, message: "Unable to calculate distance." };
  }

  const isVeryShort = distance <= 100;
  const distanceForPricing = isVeryShort ? Math.max(distance, MIN_LOCAL_DISTANCE_MILES) : distance;
  const transitTime = Math.ceil(Math.max(distance, 1) / 400) + 1;

  const STANDARD_PRICING_TYPES = ['car/truck/suv', 'motorcycle', 'golf cart'];
  const usesStandardPricing = STANDARD_PRICING_TYPES.includes(vehicleType.toLowerCase());

  let isSnowbirdRoute = false;
  let isNCGAtoNYRoute = false;

  if (usesStandardPricing && pickupLocation && dropoffLocation) {
    const pickupState = extractState(pickupLocation);
    const dropoffState = extractState(dropoffLocation);

    if (pickupState === 'FL' && dropoffState && NORTHEAST_STATES.includes(dropoffState)) {
      isSnowbirdRoute = true;
    }
    if ((pickupState === 'NC' || pickupState === 'GA') && dropoffState === 'NY') {
      isNCGAtoNYRoute = true;
    }
  }

  let basePrice = distanceForPricing <= 800
    ? distanceForPricing * BASE_RATE_PER_MILE * 1.10
    : distanceForPricing * BASE_RATE_PER_MILE;

  if (MULTIPLIER_MODE === 'UNIVERSAL_40_PLUS_SHORTHAUL_40' && usesStandardPricing) {
    basePrice = basePrice * 1.40;
    if (distanceForPricing < 1500) {
      basePrice = basePrice * 1.40;
    }
  } else {
    if (distanceForPricing < 1500 && usesStandardPricing) {
      basePrice = basePrice * 1.40;
    }
  }

  if (isSnowbirdRoute) basePrice = Math.max(basePrice, 1150);
  if (isNCGAtoNYRoute) basePrice = Math.max(basePrice, 1050);

  if (usesStandardPricing) {
    if (basePrice < 695) basePrice = 695;
    if (basePrice >= 696 && basePrice <= 1070) basePrice = Math.round(basePrice * 1.2);
  } else if (ENABLE_NEW_SPECIAL_PRICING && isSpecialVehicleType(vehicleType)) {
    basePrice = calculateSpecialPricing(distance);
  } else {
    basePrice = Math.max(basePrice, 695);
  }

  let openTransportPrice = basePrice;

  if (!(ENABLE_NEW_SPECIAL_PRICING && isSpecialVehicleType(vehicleType))) {
    const vehicleMultiplier = VEHICLE_MULTIPLIERS[vehicleType] ?? 1.0;
    openTransportPrice = basePrice * vehicleMultiplier;
  }

  let enclosedTransportPrice = openTransportPrice * ENCLOSED_MULTIPLIER;

  openTransportPrice = Math.max(openTransportPrice, 695);
  enclosedTransportPrice = Math.max(enclosedTransportPrice, 695);

  const result: PricingResult = {
    openTransport: Math.round(openTransportPrice),
    enclosedTransport: Math.round(enclosedTransportPrice),
    transitTime,
  };

  if (isVeryShort) {
    result.message = "Local route estimate — short-haul minimum applied";
  }

  return result;
}
