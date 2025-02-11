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

export const makes = {
  "car/truck/suv": ["Toyota", "Honda", "Ford", "Chevrolet", "BMW", "Mercedes", "Audi", "Tesla", "RAM", "GMC", "Nissan"],
};

export const models = {
  "car/truck/suv": {
    Toyota: ["Camry", "Corolla", "Prius", "RAV4", "Highlander", "4Runner", "Tundra", "Tacoma"],
    Honda: ["Civic", "Accord", "CR-V", "Pilot", "Odyssey", "Ridgeline"],
    Ford: ["Mustang", "F-150", "Explorer", "Escape", "Bronco", "Ranger", "Edge"],
    Chevrolet: ["Silverado", "Tahoe", "Suburban", "Equinox", "Traverse", "Colorado", "Malibu"],
    BMW: ["3 Series", "5 Series", "7 Series", "X3", "X5", "M3", "M5"],
    Mercedes: ["C-Class", "E-Class", "S-Class", "GLE", "GLC", "G-Wagon"],
    Audi: ["A3", "A4", "A6", "Q5", "Q7", "RS5", "RS7"],
    Tesla: ["Model 3", "Model Y", "Model S", "Model X", "Cybertruck"],
    RAM: ["1500", "2500", "3500", "ProMaster"],
    GMC: ["Sierra", "Yukon", "Acadia", "Terrain", "Canyon"],
    Nissan: ["Altima", "Maxima", "Rogue", "Pathfinder", "Frontier", "Titan"],
  },
};