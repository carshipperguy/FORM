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
  "Toyota", "Honda", "Ford", "Chevrolet", "BMW", "Mercedes", "Mercedes-Benz",
  "Audi", "Tesla", "RAM", "Ram", "GMC", "Nissan", "Jeep", "Hyundai", 
  "Kia", "Volkswagen", "Subaru", "Lexus", "Dodge",
  ...newMakesWithFreeTextModels
].sort();

export const modelsByMake: Record<string, string[]> = {
  Toyota: ["Camry", "Corolla", "RAV4", "Highlander", "4Runner", "Tundra", "Tacoma", "Sienna"],
  Honda: ["Civic", "Accord", "CR-V", "Pilot", "Odyssey", "Ridgeline", "HR-V"],
  Ford: [
    // Original models
    "F-150", "Ranger", "Explorer", "Escape", "Bronco", "Mustang", "Edge", "Expedition",
    // New models from CSV
    "Fusion", "Focus", "Taurus", "Fiesta", "Crown Victoria", "Escort", "Tempo", "Contour", 
    "Probe", "LTD", "Five Hundred", "Granada", "Fairmont", "Galaxie", "Falcon", "Pinto", 
    "Maverick 1970s", "Aspire", "Thunderbird", "Bronco Sport", "EcoSport", "Excursion", 
    "Flex", "Freestyle", "Transit", "Transit Connect", "E-Series", "Windstar", "Aerostar", 
    "Club Wagon", "Chateau", "Custom Van", "F-250", "F-350", "F-450 F-550", "Maverick 2022", 
    "Super Duty Series", "Courier", "Explorer Sport Trac", "Mustang Mach-E", "F-150 Lightning", 
    "C-Max", "E-350 Cutaway", "E-450 Cutaway", "Transit Cutaway", "F-450 Cutaway", "F-550 Cutaway",
    "Transit Cargo Van"
  ],
  Chevrolet: [
    // Original models
    "Silverado", "Colorado", "Tahoe", "Suburban", "Equinox", "Traverse", "Malibu",
    // New models from CSV
    "Impala", "Cruze", "Cavalier", "Cobalt", "Sonic", "Aveo", "Caprice", "Bel Air", 
    "Lumina", "Celebrity", "Nova", "Corsica", "Monza", "Citation", "SS", "Chevelle", 
    "Biscayne", "Vega", "Metro", "Trailblazer", "Blazer", "Captiva Sport", "Tracker", 
    "HHR", "Uplander", "Express", "Astro", "Venture", "Lumina APV", "City Express", 
    "G-Series Van", "Silverado 1500", "Silverado 2500HD", "Silverado 3500HD", "S-10", 
    "C K Series", "El Camino", "LUV", "SSR", "Avalanche", "Camaro", "Corvette", "Volt", 
    "Bolt EV EUV", "Express 3500 Cutaway", "Express 4500 Cutaway", "Express Cargo Van"
  ],
  BMW: ["3 Series", "5 Series", "7 Series", "X3", "X5", "X7", "M3", "M5"],
  Mercedes: ["C-Class", "E-Class", "S-Class", "GLE", "GLC", "G-Class", "A-Class"],
  "Mercedes-Benz": [
    // New models from CSV
    "Sprinter Cargo Van", "Sprinter Crew Van", "Sprinter Passenger Van", "Sprinter Cab Chassis",
    "Sprinter 1500", "Sprinter 2500", "Sprinter 3500", "Sprinter 4500", "Metris Cargo Van"
  ],
  Audi: ["A3", "A4", "A6", "Q5", "Q7", "e-tron", "RS5", "RS7"],
  Tesla: ["Model 3", "Model Y", "Model S", "Model X", "Cybertruck"],
  RAM: ["1500", "2500", "3500", "ProMaster"],
  Ram: [
    // New models from CSV
    "ProMaster Cutaway", "4500 Cutaway", "5500 Cutaway", "ProMaster 1500 Cargo Van",
    "ProMaster 2500 Cargo Van", "ProMaster 3500 Cargo Van"
  ],
  GMC: [
    // Original models
    "Sierra", "Canyon", "Yukon", "Acadia", "Terrain",
    // New models from CSV
    "Savana 3500 Cutaway", "Savana 4500 Cutaway", "Savana Cargo Van"
  ],
  Nissan: [
    // Original models
    "Altima", "Maxima", "Rogue", "Pathfinder", "Frontier", "Titan", "Kicks",
    // New models from CSV
    "NV1500 Cargo Van", "NV2500 HD Cargo Van", "NV3500 HD Cargo Van"
  ],
  Jeep: ["Wrangler", "Grand Cherokee", "Cherokee", "Compass", "Gladiator", "Renegade"],
  Hyundai: ["Elantra", "Sonata", "Tucson", "Santa Fe", "Palisade", "Kona"],
  Kia: ["Telluride", "Sorento", "Sportage", "K5", "Forte", "Soul"],
  Volkswagen: ["Jetta", "Passat", "Tiguan", "Atlas", "Golf", "ID.4", "Taos"],
  Subaru: ["Outback", "Forester", "Crosstrek", "Impreza", "Legacy", "Ascent"],
  Lexus: ["RX", "NX", "ES", "IS", "GX", "LX", "UX"],
  Dodge: [
    // Original models
    "Charger", "Challenger", "Durango", "Ram", "Journey",
    // New models from CSV
    "Dart", "Neon", "Avenger", "Intrepid", "Stratus", "Monaco", "Spirit", "Dynasty", 
    "Aries K-car", "Lancer 1980s", "Mirada", "400", "600", "Aspen", "Coronet", "Polara", 
    "Diplomat", "Omni", "Nitro", "Ramcharger", "Raider", "Wagoneer", "Grand Caravan", 
    "Caravan", "Ram Van", "Tradesman", "B-Series Van", "Sprinter", "Mini Ram Van", 
    "Sportsman", "Ram 1500", "Ram 2500", "Ram 3500", "Dakota", "D100 D150", "D200 D250", 
    "D300 D350", "Power Wagon", "Rampage", "Warlock", "Lil Red Express Truck", "Viper", 
    "Stealth", "Daytona", "Super Bee", "Demon"
  ]
};