// PRICING FEATURE FLAGS - CONTROLLED ROLLBACK SYSTEM
// PHASE 0: Safety setup for car/truck/suv pricing adjustments

export type MultiplierMode = 'OFF' | 'UNIVERSAL_40_PLUS_SHORTHAUL_40';

// DEFAULT: OFF (no changes to pricing behavior)
// UNIVERSAL_40_PLUS_SHORTHAUL_40: +40% universal for car/truck/suv, +40% additional for <1500 miles
export const MULTIPLIER_MODE: MultiplierMode = 'UNIVERSAL_40_PLUS_SHORTHAUL_40';