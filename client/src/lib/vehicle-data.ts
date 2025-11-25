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
  "Mazda", "McLaren", "Mercedes", "Mercedes-Benz", "Mercury", "Mini", "Mitsubishi", "Oldsmobile",
  "Opel", "Peugeot", "Plymouth", "Polestar", "Pontiac", "Porsche", "Renault",
  "Rivian", "Rolls-Royce", "Saab", "Saleen", "Saturn", "Scion", "Seat", "Skoda",
  "Smart", "Spyker", "Suzuki", "Tata", "VinFast", "Volvo", "Yugo"
];

// Combine all makes and sort alphabetically
export const makes = [
  "Toyota", "Honda", "Ford", "Chevrolet", "BMW", 
  "Audi", "Tesla", "RAM", "Ram", "GMC", "Nissan", "Jeep", "Hyundai", 
  "Kia", "Volkswagen", "Subaru", "Lexus", "Dodge",
  ...newMakesWithFreeTextModels
].sort();

export const modelsByMake: Record<string, string[]> = {
  Toyota: ["4Runner", "Avalon", "Camry", "Corolla", "Highlander", "Land Cruiser", "Prius", "RAV4", "Sequoia", "Sienna", "Tacoma", "Tundra"].sort(),
  Honda: [
    "Accord", "Accord Hybrid", "Civic", "Civic Hybrid", "Clarity", "Clarity EV", "CR-V", "CR-Z",
    "Crosstour", "Element", "Fit", "HR-V", "Insight", "Insight Hybrid", "Legend", "NSX",
    "Odyssey", "Passport", "Pilot", "Prelude", "Prologue", "Ridgeline", "S2000", "ZR-V"
  ].sort(),
  Ford: [
    "Aerostar", "Aspire", "Bronco", "Bronco Sport", "C-Max", "Chateau", "Club Wagon", 
    "Contour", "Courier", "Crown Victoria", "Custom Van", "E-350 Cutaway", "E-450 Cutaway", 
    "E-Series", "EcoSport", "Edge", "Escape", "Escort", "Expedition", "Explorer", 
    "Explorer Sport Trac", "F-150", "F-150 Lightning", "F-250", "F-350", "F-450 Cutaway", 
    "F-450 F-550", "F-550 Cutaway", "Fairmont", "Falcon", "Fiesta", "Five Hundred", 
    "Flex", "Focus", "Freestyle", "Fusion", "Galaxie", "Granada", "LTD", "Maverick 1970s", 
    "Maverick 2022", "Mustang", "Mustang Mach-E", "Pinto", "Probe", "Ranger", "Super Duty Series", 
    "Taurus", "Tempo", "Thunderbird", "Transit", "Transit Cargo Van", "Transit Connect", 
    "Transit Cutaway", "Windstar"
  ].sort(),
  Chevrolet: [
    "Astro", "Avalanche", "Aveo", "Bel Air", "Biscayne", "Blazer", "Bolt EV EUV", 
    "C K Series", "Camaro", "Caprice", "Captiva Sport", "Cavalier", "Celebrity", "Chevelle", 
    "Citation", "City Express", "Cobalt", "Colorado", "Corsica", "Corvette", "Cruze", 
    "El Camino", "Equinox", "Express", "Express 3500 Cutaway", "Express 4500 Cutaway", 
    "Express Cargo Van", "G-Series Van", "HHR", "Impala", "Lumina", "Lumina APV", "LUV", 
    "Malibu", "Metro", "Monza", "Nova", "S-10", "Silverado", "Silverado 1500", "Silverado 2500HD", 
    "Silverado 3500HD", "Sonic", "SS", "SSR", "Suburban", "Tahoe", "Tracker", "Trailblazer", 
    "Traverse", "Uplander", "Vega", "Venture", "Volt"
  ].sort(),
  BMW: [
    "1 Series", "2 Series", "3 Series", "4 Series", "5 Series", "6 Series", "7 Series", "8 Series",
    "Z3", "Z4", "Z8", "X1", "X2", "X3", "X4", "X5", "X6", "X7", "XM",
    "i3", "i4", "i5", "i7", "i8", "iX", "iX1", "iX3",
    "M1", "M2", "M3", "M4", "M5", "M6", "M8", "X3M", "X4M", "X5M", "X6M"
  ].sort(),
  Audi: ["A3", "A4", "A5", "A6", "A8", "e-tron", "Q3", "Q5", "Q7", "RS5", "RS7"].sort(),
  Tesla: ["Cybertruck", "Model 3", "Model S", "Model X", "Model Y"].sort(),
  RAM: ["1500", "2500", "3500", "ProMaster"].sort(),
  Ram: [
    "4500 Cutaway", "5500 Cutaway", "ProMaster 1500 Cargo Van", "ProMaster 2500 Cargo Van",
    "ProMaster 3500 Cargo Van", "ProMaster Cutaway"
  ].sort(),
  GMC: [
    "Acadia", "Canyon", "Envoy", "Hummer EV", "Savana 3500 Cutaway", "Savana 4500 Cutaway", "Savana Cargo Van",
    "Sierra", "Terrain", "Yukon"
  ].sort(),
  Nissan: [
    "Altima", "Altima Coupe", "Armada", "Cube", "Frontier", "GT-R", "Juke", "Kicks",
    "Leaf", "Maxima", "Murano", "Murano CrossCabriolet", "NV200", "NV1500 Cargo Van",
    "NV2500 HD Cargo Van", "NV3500 HD Cargo Van", "Pathfinder", "Quest", "Rogue",
    "Rogue Sport", "Sentra", "Titan", "Titan XD", "Versa", "Xterra",
    "Z (350Z, 370Z, 400Z)", "240SX", "300ZX"
  ].sort(),
  Jeep: ["Cherokee", "Comanche", "Commander", "Compass", "Gladiator", "Grand Cherokee", "Grand Cherokee L", "Grand Wagoneer", "Liberty", "Patriot", "Renegade", "Wagoneer", "Wrangler"].sort(),
  Hyundai: [
    "Accent", "Azera", "Elantra", "Entourage", "Genesis", "Genesis Coupe",
    "Ioniq", "Ioniq 5", "Ioniq 6", "Kona", "Kona Electric", "Kona N",
    "Nexo", "Palisade", "Santa Fe", "Santa Fe Hybrid", "Santa Fe Plug-In Hybrid",
    "Sonata", "Tiburon", "Tucson", "Tucson Hybrid", "Tucson Plug-In Hybrid",
    "Veloster", "Veloster N", "Venue"
  ].sort(),
  Kia: [
    "Rio", "Forte", "K5", "Optima", "Cadenza", "K900", "Stinger",
    "Soul", "Seltos", "Sportage", "Sorento", "Telluride", "Borrego",
    "Niro", "Sedona", "Carnival", "EV6", "EV9", "EV5",
    "Optima Hybrid", "Optima PHEV", "Niro Hybrid", "Niro EV", "Niro PHEV",
    "Sorento Hybrid", "Sorento PHEV", "Sportage Hybrid", "Mohave", "Bongo"
  ].sort(),
  Volkswagen: ["Arteon", "Atlas", "Beetle", "CC", "Eos", "Golf", "ID.4", "ID.Buzz", "Jetta", "Passat", "Routan", "Taos", "Tiguan", "Touareg"].sort(),
  Subaru: ["Ascent", "Crosstrek", "Forester", "Impreza", "Legacy", "Outback"].sort(),
  Lexus: ["ES", "GX", "IS", "LX", "NX", "RX", "UX"].sort(),
  Dodge: [
    "400", "600", "Aries K-car", "Aspen", "Avenger", "B-Series Van", "Caravan", "Challenger",
    "Charger", "Coronet", "D100 D150", "D200 D250", "D300 D350", "Dakota", "Dart", "Daytona",
    "Demon", "Diplomat", "Durango", "Dynasty", "Grand Caravan", "Intrepid", "Journey",
    "Lancer 1980s", "Lil Red Express Truck", "Mini Ram Van", "Mirada", "Monaco", "Neon",
    "Nitro", "Omni", "Polara", "Power Wagon", "Raider", "Ram", "Ram 1500", "Ram 2500",
    "Ram 3500", "Ram Van", "Ramcharger", "Rampage", "Spirit", "Sportsman", "Sprinter",
    "Stealth", "Stratus", "Super Bee", "Tradesman", "Viper", "Wagoneer", "Warlock"
  ].sort()
};