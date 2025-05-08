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

// Years (1940 to current year)
export const years = Array.from(
  { length: new Date().getFullYear() - 1940 + 1 },
  (_, i) => (1940 + i).toString()
).reverse();

// New makes to be added that should use free-text input for models
export const newMakesWithFreeTextModels = [
  "Acura", "Alfa Romeo", "Aston Martin", "Bentley", "Bugatti", "Buick",
  "Cadillac", "Chrysler", "Citroën", "Dacia", "Daewoo", "Daihatsu", "Eagle",
  "Ferrari", "Fiat", "Fisker", "Genesis", "Geo", "Hummer", "Infiniti",
  "International", "Isuzu", "Jaguar", "Karma", "Koenigsegg", "Lamborghini",
  "Lancia", "Land Rover", "Lincoln", "Lotus", "Lucid", "Maserati", "Maybach",
  "Mazda", "McLaren", "Mercedes-Benz", "Mercury", "Mini", "Mitsubishi", "Oldsmobile",
  "Opel", "Peugeot", "Plymouth", "Polestar", "Pontiac", "Porsche", "Renault",
  "Rivian", "Rolls-Royce", "Saab", "Saleen", "Saturn", "Scion", "Seat", "Skoda",
  "Smart", "Spyker", "Suzuki", "Tata", "VinFast", "Volvo", "Yugo"
];

// Combine all makes and sort alphabetically
export const makes = [
  "Toyota", "Honda", "Ford", "Chevrolet", "BMW", "Mercedes", 
  "Audi", "Tesla", "RAM", "GMC", "Nissan", "Jeep", "Hyundai", 
  "Kia", "Volkswagen", "Subaru", "Lexus", "Dodge",
  ...newMakesWithFreeTextModels
].sort();

export const modelsByMake: Record<string, string[]> = {
  Toyota: ["Camry", "Corolla", "RAV4", "Highlander", "4Runner", "Tundra", "Tacoma", "Sienna"],
  Honda: ["Civic", "Accord", "CR-V", "Pilot", "Odyssey", "Ridgeline", "HR-V"],
  Ford: ["F-150", "Ranger", "Explorer", "Escape", "Bronco", "Mustang", "Edge", "Expedition"],
  Chevrolet: ["Silverado", "Colorado", "Tahoe", "Suburban", "Equinox", "Traverse", "Malibu"],
  BMW: ["3 Series", "5 Series", "7 Series", "X3", "X5", "X7", "M3", "M5"],
  Mercedes: ["C-Class", "E-Class", "S-Class", "GLE", "GLC", "G-Class", "A-Class"],
  Audi: ["A3", "A4", "A6", "Q5", "Q7", "e-tron", "RS5", "RS7"],
  Tesla: ["Model 3", "Model Y", "Model S", "Model X", "Cybertruck"],
  RAM: ["1500", "2500", "3500", "ProMaster"],
  GMC: ["Sierra", "Canyon", "Yukon", "Acadia", "Terrain"],
  Nissan: ["Altima", "Maxima", "Rogue", "Pathfinder", "Frontier", "Titan", "Kicks"],
  Jeep: ["Wrangler", "Grand Cherokee", "Cherokee", "Compass", "Gladiator", "Renegade"],
  Hyundai: ["Elantra", "Sonata", "Tucson", "Santa Fe", "Palisade", "Kona"],
  Kia: ["Telluride", "Sorento", "Sportage", "K5", "Forte", "Soul"],
  Volkswagen: ["Jetta", "Passat", "Tiguan", "Atlas", "Golf", "ID.4", "Taos"],
  Subaru: ["Outback", "Forester", "Crosstrek", "Impreza", "Legacy", "Ascent"],
  Lexus: ["RX", "NX", "ES", "IS", "GX", "LX", "UX"],
  Dodge: ["Charger", "Challenger", "Durango", "Ram", "Journey"]
};