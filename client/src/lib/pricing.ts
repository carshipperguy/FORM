// UNIFIED PRICING SYSTEM - SINGLE PATHWAY FOR ALL VEHICLES
const BASE_RATE_PER_MILE = 0.614;  // Base rate per mile for all vehicles
const ENCLOSED_MULTIPLIER = 1.40;   // Enclosed transport is 40% more expensive

// Vehicle type multipliers
const VEHICLE_MULTIPLIERS: Record<string, number> = {
  "car/truck/suv": 1.0,
  "boat": 1.4,
  "golf cart": 0.8,
  "motorcycle": 0.7,
  "rv/5th wheel": 1.8,
  "travel trailer": 1.6,
  "atv/utv": 0.75,
  "heavy equipment": 2.0,
  "other": 1.3
};

export type VehicleType = string;

interface PricingResult {
  openTransport: number;
  enclosedTransport: number;
  transitTime: number;
  message?: string;
}

// Extract state from location string (e.g., "Miami, FL 33101" => "FL")
function extractState(location: string): string | null {
  if (!location) return null;
  const stateMatch = location.match(/\b([A-Z]{2})\b/);
  if (stateMatch && stateMatch[1]) {
    return stateMatch[1];
  }
  return null;
}

// Northeast states for Snowbird route detection
const NORTHEAST_STATES = ['ME', 'NH', 'VT', 'MA', 'RI', 'CT', 'NY', 'NJ', 'PA'];

export function calculatePrice(
  distance: number,
  vehicleType: VehicleType,
  date: Date = new Date(),
  pickupLocation?: string,
  dropoffLocation?: string
): PricingResult {
  console.log('--------------------------------');
  console.log('UNIFIED PRICING CALCULATION STARTED');
  console.log('Input parameters:', { distance, vehicleType, date });

  // Handle undefined distance
  if (!distance) {
    console.warn('Distance is undefined, returning error message');
    return {
      openTransport: 0,
      enclosedTransport: 0,
      transitTime: 0,
      message: "Unable to calculate distance. Please try again."
    };
  }

  // Calculate transit time based on distance
  const transitTime = Math.ceil(distance / 400) + 1;
  console.log('Calculated transit time:', transitTime);

  // For short distances, return message only
  if (distance <= 100) {
    console.log('Distance <= 100 miles, returning custom quote message');
    return {
      openTransport: 0,
      enclosedTransport: 0,
      transitTime,
      message: "For short distances under 100 miles, please contact us directly for a custom quote."
    };
  }

  // Check for special routes (only for car/truck/suv)
  let isSnowbirdRoute = false;
  let isNCGAtoNYRoute = false;
  
  if (vehicleType === 'car/truck/suv' && pickupLocation && dropoffLocation) {
    const pickupState = extractState(pickupLocation);
    const dropoffState = extractState(dropoffLocation);
    
    if (pickupState === 'FL' && dropoffState && NORTHEAST_STATES.includes(dropoffState)) {
      isSnowbirdRoute = true;
      console.log(`*** SNOWBIRD ROUTE DETECTED: FL to ${dropoffState} ***`);
    }
    
    if ((pickupState === 'NC' || pickupState === 'GA') && dropoffState === 'NY') {
      isNCGAtoNYRoute = true;
      console.log(`*** NC/GA TO NY ROUTE DETECTED: ${pickupState} to NY ***`);
    }
  }

  // Calculate initial base price
  let basePrice = distance <= 800
    ? distance * BASE_RATE_PER_MILE * 1.10  // 10% higher for mid-range trips
    : distance * BASE_RATE_PER_MILE;

  // Apply 40% markup for car/truck/suv routes under 1,500 miles
  if (distance < 1500 && vehicleType === 'car/truck/suv') {
    const priceBeforeMarkup = basePrice;
    basePrice = basePrice * 1.40;
    console.log(`Applied 40% markup for car/truck/suv route under 1,500 miles: $${priceBeforeMarkup.toFixed(2)} → $${basePrice.toFixed(2)}`);
  }

  // Apply special route minimums if applicable
  if (isSnowbirdRoute) {
    const priceBeforeSnowbird = basePrice;
    basePrice = Math.max(basePrice, 1150);
    if (basePrice > priceBeforeSnowbird) {
      console.log(`Snowbird route minimum applied: $${priceBeforeSnowbird.toFixed(2)} → $1,150`);
    }
  }

  if (isNCGAtoNYRoute) {
    const priceBeforeAdjustment = basePrice;
    basePrice = Math.max(basePrice, 1050);
    if (basePrice > priceBeforeAdjustment) {
      console.log(`NC/GA to NY route minimum applied: $${priceBeforeAdjustment.toFixed(2)} → $1,050`);
    }
  }

  console.log('Base price calculation:', {
    distance,
    ratePerMile: BASE_RATE_PER_MILE,
    midRangeMultiplier: distance <= 800 ? 1.10 : 1,
    under1500MileMarkup: (distance < 1500 && vehicleType === 'car/truck/suv') ? 1.40 : 1,
    formula: `${distance} miles × $${BASE_RATE_PER_MILE}/mile = $${basePrice.toFixed(2)}`
  });

  // MASTER PRICING RULES - Apply vehicle-specific minimums and uplifts
  console.log('*** APPLYING MASTER PRICING RULES ***');
  const priceBeforeRules = basePrice;

  // Check if this is a car/truck/suv type
  const isCarTruckSUV = ['car', 'truck', 'suv'].includes(vehicleType.toLowerCase()) || 
                       vehicleType.toLowerCase() === 'car/truck/suv';

  if (isCarTruckSUV) {
    // RULE 1: Car/Truck/SUV Minimum Floor - $695
    if (basePrice < 695) {
      basePrice = 695;
      console.log(`Car/Truck/SUV minimum floor applied: $${priceBeforeRules.toFixed(2)} → $695`);
    }

    // RULE 2: Car/Truck/SUV Middle-Range Uplift - 20% for $696-$1070 range
    if (basePrice >= 696 && basePrice <= 1070) {
      const priceBeforeUplift = basePrice;
      basePrice = Math.round(basePrice * 1.2);
      console.log(`Car/Truck/SUV middle-range uplift applied: $${priceBeforeUplift.toFixed(2)} → $${basePrice} (+20%)`);
    }
  } else if (vehicleType.toLowerCase() === 'rv' || vehicleType.toLowerCase() === 'rv/5th wheel' || vehicleType.toLowerCase().includes('rv')) {
    // RULE 3 & 4: RV-specific logic
    if (basePrice < 750) {
      // RULE 3: RV Minimum Floor - $750
      basePrice = 750;
      console.log(`RV minimum floor applied: $${priceBeforeRules.toFixed(2)} → $750`);
    } else if (distance < 1500) {
      // RULE 4: RV Short-Distance Uplift - 30% for routes under 1500 miles (only if already ≥$750)
      const priceBeforeUplift = basePrice;
      basePrice = Math.round(basePrice * 1.3);
      console.log(`RV short-distance uplift applied: $${priceBeforeUplift.toFixed(2)} → $${basePrice} (+30% for route under 1500 miles)`);
    }
  } else {
    // For other vehicle types, apply $695 minimum as fallback
    const priceBeforeOtherMinimum = basePrice;
    basePrice = Math.max(basePrice, 695);
    if (basePrice > priceBeforeOtherMinimum) {
      console.log(`Other vehicle type minimum applied: $${priceBeforeOtherMinimum.toFixed(2)} → $695`);
    }
  }

  console.log('Master pricing rules applied:', {
    vehicleType,
    isCarTruckSUV,
    distance,
    priceBeforeRules: priceBeforeRules.toFixed(2),
    priceAfterRules: basePrice.toFixed(2)
  });

  // Apply vehicle type multiplier
  let vehicleMultiplier = 1.0;
  if (vehicleType in VEHICLE_MULTIPLIERS) {
    vehicleMultiplier = VEHICLE_MULTIPLIERS[vehicleType];
  } else {
    console.warn(`Vehicle type "${vehicleType}" not found in multipliers, using default multiplier: 1.0`);
  }

  let openTransportPrice = basePrice * vehicleMultiplier;

  console.log('Open transport calculation:', {
    basePrice,
    vehicleMultiplier,
    formula: `$${basePrice.toFixed(2)} × ${vehicleMultiplier} = $${openTransportPrice.toFixed(2)}`
  });

  let enclosedTransportPrice = openTransportPrice * ENCLOSED_MULTIPLIER;

  console.log('Enclosed transport calculation:', {
    openTransportPrice,
    enclosedMultiplier: ENCLOSED_MULTIPLIER,
    formula: `$${openTransportPrice.toFixed(2)} × ${ENCLOSED_MULTIPLIER} = $${enclosedTransportPrice.toFixed(2)}`
  });

  // ABSOLUTE MINIMUM ENFORCEMENT - NO QUOTE BELOW $695 EVER
  const openTransportBeforeMin = openTransportPrice;
  const enclosedTransportBeforeMin = enclosedTransportPrice;

  openTransportPrice = Math.max(openTransportPrice, 695);
  enclosedTransportPrice = Math.max(enclosedTransportPrice, 695);

  if (openTransportPrice > openTransportBeforeMin) {
    console.log(`🚨 ABSOLUTE MINIMUM ENFORCED: Open transport $${openTransportBeforeMin.toFixed(2)} → $695`);
  }
  if (enclosedTransportPrice > enclosedTransportBeforeMin) {
    console.log(`🚨 ABSOLUTE MINIMUM ENFORCED: Enclosed transport $${enclosedTransportBeforeMin.toFixed(2)} → $695`);
  }

  // Round prices to nearest whole dollar
  const result = {
    openTransport: Math.round(openTransportPrice),
    enclosedTransport: Math.round(enclosedTransportPrice),
    transitTime
  };

  console.log('FINAL PRICING RESULT:', result);
  console.log('--------------------------------');

  return result;
}