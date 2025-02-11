export const vehicleTypes = [
  "car/truck/suv",
  "boat",
  "golf cart",
  "motorcycle",
  "rv/5th wheel",
  "travel trailer",
  "atv/utv",
  "heavy equipment",
  "other"
] as const;

// Sample years (1990 to current year)
export const years = Array.from(
  { length: new Date().getFullYear() - 1990 + 1 },
  (_, i) => (1990 + i).toString()
).reverse();