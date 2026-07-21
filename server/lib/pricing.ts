/**
 * Server-side pricing engine.
 *
 * Ported verbatim from client/src/lib/pricing.ts so the SERVER is the single
 * source of truth for prices — the client never sends a price we trust. Keep the
 * rules here in sync with the client copy (or, later, import one from the other).
 */

const BASE_RATE_PER_MILE = 0.614;
const ENCLOSED_MULTIPLIER = 1.4;

const VEHICLE_MULTIPLIERS: Record<string, number> = {
  "car/truck/suv": 1.0,
  boat: 1.4,
  "golf cart": 0.8,
  motorcycle: 0.7,
  "rv/5th wheel": 1.8,
  "travel trailer": 1.6,
  "atv/utv": 0.75,
  "heavy equipment": 2.0,
  other: 1.3,
};

const NORTHEAST_STATES = ["ME", "NH", "VT", "MA", "RI", "CT", "NY", "NJ", "PA"];

export interface PricingResult {
  openTransport: number;
  enclosedTransport: number;
  transitTime: number;
  message?: string;
}

export function extractState(location?: string | null): string | null {
  if (!location) return null;
  const m = location.match(/\b([A-Z]{2})\b/);
  return m && m[1] ? m[1] : null;
}

export function calculatePrice(
  distance: number | null | undefined,
  vehicleType: string,
  _date: Date = new Date(),
  pickupLocation?: string,
  dropoffLocation?: string,
): PricingResult {
  if (!distance) {
    return {
      openTransport: 0,
      enclosedTransport: 0,
      transitTime: 0,
      message: "Unable to calculate distance. Please try again.",
    };
  }

  const transitTime = Math.ceil(distance / 400) + 1;

  if (distance <= 100) {
    return {
      openTransport: 0,
      enclosedTransport: 0,
      transitTime,
      message: "For short distances under 100 miles, please contact us directly for a custom quote.",
    };
  }

  let isSnowbirdRoute = false;
  let isNCGAtoNYRoute = false;

  if (vehicleType === "car/truck/suv" && pickupLocation && dropoffLocation) {
    const pickupState = extractState(pickupLocation);
    const dropoffState = extractState(dropoffLocation);
    if (pickupState === "FL" && dropoffState && NORTHEAST_STATES.includes(dropoffState)) {
      isSnowbirdRoute = true;
    }
    if ((pickupState === "NC" || pickupState === "GA") && dropoffState === "NY") {
      isNCGAtoNYRoute = true;
    }
  }

  let basePrice =
    distance <= 800 ? distance * BASE_RATE_PER_MILE * 1.1 : distance * BASE_RATE_PER_MILE;

  if (distance < 1500 && vehicleType === "car/truck/suv") {
    basePrice = basePrice * 1.4;
  }

  if (isSnowbirdRoute) basePrice = Math.max(basePrice, 1150);
  if (isNCGAtoNYRoute) basePrice = Math.max(basePrice, 1050);

  const isCarTruckSUV =
    ["car", "truck", "suv"].includes(vehicleType.toLowerCase()) ||
    vehicleType.toLowerCase() === "car/truck/suv";

  if (isCarTruckSUV) {
    if (basePrice < 695) basePrice = 695;
    if (basePrice >= 696 && basePrice <= 1070) basePrice = Math.round(basePrice * 1.2);
  } else if (vehicleType.toLowerCase().includes("rv")) {
    if (basePrice < 750) basePrice = 750;
    else if (distance < 1500) basePrice = Math.round(basePrice * 1.3);
  } else {
    basePrice = Math.max(basePrice, 695);
  }

  const vehicleMultiplier = vehicleType in VEHICLE_MULTIPLIERS ? VEHICLE_MULTIPLIERS[vehicleType] : 1.0;

  let openTransportPrice = basePrice * vehicleMultiplier;
  let enclosedTransportPrice = openTransportPrice * ENCLOSED_MULTIPLIER;

  openTransportPrice = Math.max(openTransportPrice, 695);
  enclosedTransportPrice = Math.max(enclosedTransportPrice, 695);

  return {
    openTransport: Math.round(openTransportPrice),
    enclosedTransport: Math.round(enclosedTransportPrice),
    transitTime,
  };
}
