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
  Toyota: [
    "4Runner", "Avalon", "bZ3X", "bZ4X", "Camry", "Camry Hybrid", "Celica", "C-HR", "Corolla",
    "Corolla Cross", "Corolla Cross Hybrid", "Corolla Hatchback", "Crown", "Crown Signia",
    "Echo", "FJ Cruiser", "GR Corolla", "GR86", "GR Supra", "Grand Highlander",
    "Grand Highlander Hybrid", "Highlander", "Highlander Hybrid", "Land Cruiser", "Matrix",
    "Mirai", "MR2", "Pickup (Pre-Tacoma)", "Previa", "Prius", "Prius Prime", "RAV4",
    "RAV4 Hybrid", "RAV4 Prime", "Sequoia", "Sienna", "Supra", "Tacoma", "Tercel",
    "Tundra", "Venza", "Yaris"
  ].sort(),
  Honda: [
    "Accord", "Accord Hybrid", "Accord Plug-In Hybrid", "Civic", "Civic Hybrid", "Clarity",
    "Clarity EV", "CR-V", "CR-Z", "Crosstour", "del Sol", "Element", "Fit", "HR-V",
    "Insight", "Insight Hybrid", "Legend", "NSX", "Odyssey", "Passport", "Pilot",
    "Prelude", "Prologue", "Ridgeline", "S2000", "ZR-V"
  ].sort(),
  Ford: [
    "Aerostar", "Aspire", "Bronco", "Bronco Sport", "C-Max", "Chateau", "Club Wagon",
    "Contour", "Courier", "Crown Victoria", "Custom Van", "E-350 Cutaway", "E-450 Cutaway",
    "E-Series", "EcoSport", "Edge", "E-Transit", "Escape", "Escort", "Expedition",
    "Expedition Max", "Explorer", "Explorer Sport Trac", "F-150", "F-150 Lightning",
    "F-250", "F-350", "F-450 Cutaway", "F-450 F-550", "F-550 Cutaway", "F-600",
    "Fairmont", "Falcon", "Fiesta", "Five Hundred", "Flex", "Focus", "Freestyle",
    "Fusion", "Galaxie", "Granada", "LTD", "Maverick 1970s", "Maverick 2022",
    "Mustang", "Mustang Mach-E", "Pinto", "Probe", "Ranger", "Super Duty Series",
    "Taurus", "Tempo", "Thunderbird", "Transit", "Transit Cargo Van", "Transit Connect",
    "Transit Cutaway", "Windstar"
  ].sort(),
  Chevrolet: [
    "Astro", "Avalanche", "Aveo", "Bel Air", "Biscayne", "Blazer", "Blazer EV", "Bolt EV EUV",
    "C K Series", "Camaro", "Caprice", "Captiva Sport", "Cavalier", "Celebrity", "Chevelle",
    "Citation", "City Express", "Cobalt", "Colorado", "Corsica", "Corvette", "Cruze",
    "El Camino", "Equinox", "Equinox EV", "Express", "Express 3500 Cutaway", "Express 4500 Cutaway",
    "Express Cargo Van", "G-Series Van", "HHR", "Impala", "Lumina", "Lumina APV", "LUV",
    "Malibu", "Metro", "Montana", "Monza", "Nova", "S-10", "Silverado", "Silverado 1500",
    "Silverado 2500HD", "Silverado 3500HD", "Silverado EV", "Sonic", "Spark", "SS", "SSR",
    "Suburban", "Tahoe", "Tracker", "Trailblazer", "Traverse", "Trax", "Uplander",
    "Vega", "Venture", "Volt"
  ].sort(),
  BMW: [
    "1 Series", "2 Series", "3 Series", "4 Series", "5 Series", "6 Series", "7 Series", "8 Series",
    "Z3", "Z4", "Z8", "X1", "X2", "X3", "X4", "X5", "X6", "X7", "XM",
    "i3", "i4", "i5", "i7", "i8", "iX", "iX1", "iX3",
    "M1", "M2", "M235i", "M3", "M340i", "M4", "M5", "M550i", "M6", "M8",
    "X3M", "X4M", "X5M", "X6M"
  ].sort(),
  Audi: [
    "A1", "A3", "A4", "A4 allroad", "A5", "A5 Cabriolet", "A6", "A7", "A8",
    "e-tron", "e-tron GT", "Q2", "Q3", "Q4 e-tron", "Q5", "Q5 Sportback", "Q7", "Q8", "Q8 e-tron",
    "R8", "RS3", "RS4", "RS5", "RS6 Avant", "RS7", "RS e-tron GT", "RS Q3", "RS Q8",
    "S3", "S4", "S5", "S5 Cabriolet", "S6", "S7", "S8", "SQ5", "SQ7", "SQ8",
    "TT", "TTS", "TT RS"
  ].sort(),
  Tesla: ["Cybertruck", "Model 3", "Model S", "Model X", "Model Y", "Roadster", "Semi"].sort(),
  RAM: ["1500", "1500 TRX", "2500", "3500", "ProMaster"].sort(),
  Ram: [
    "4500 Cutaway", "5500 Cutaway", "ProMaster 1500 Cargo Van", "ProMaster 2500 Cargo Van",
    "ProMaster 3500 Cargo Van", "ProMaster City", "ProMaster Cutaway"
  ].sort(),
  GMC: [
    "Acadia", "Canyon", "Canyon AT4X", "Envista", "Envoy", "Hummer EV", "Hummer EV SUV",
    "Jimmy", "Safari", "Savana 3500 Cutaway", "Savana 4500 Cutaway", "Savana Cargo Van",
    "Savana Passenger Van", "Sierra", "Sierra 1500", "Sierra 2500 HD", "Sierra 3500 HD",
    "Sierra EV", "Sonoma", "Syclone", "Terrain", "Typhoon", "Yukon", "Yukon XL"
  ].sort(),
  Nissan: [
    "Altima", "Altima Coupe", "Ariya", "Armada", "Cube", "Frontier", "GT-R", "Juke", "Kicks",
    "Leaf", "Maxima", "Murano", "Murano CrossCabriolet", "NV200", "NV1500 Cargo Van",
    "NV2500 HD Cargo Van", "NV3500 HD Cargo Van", "Pathfinder", "Quest", "Rogue",
    "Rogue Sport", "Sentra", "Terra", "Titan", "Titan XD", "Versa", "Xterra",
    "Z (350Z, 370Z, 400Z)", "240SX", "300ZX"
  ].sort(),
  Jeep: [
    "Avenger", "Cherokee", "CJ-5", "CJ-7", "Comanche", "Commander", "Compass", "Gladiator",
    "Grand Cherokee", "Grand Cherokee 4xe", "Grand Cherokee L", "Grand Cherokee SRT",
    "Grand Wagoneer", "Grand Wagoneer L", "Liberty", "Patriot", "Recon", "Renegade",
    "Scrambler", "Trackhawk", "Wagoneer", "Wagoneer L", "Wrangler", "Wrangler 4xe", "Wrangler Unlimited"
  ].sort(),
  Hyundai: [
    "Accent", "Azera", "Elantra", "Elantra N", "Entourage", "Genesis", "Genesis Coupe",
    "Ioniq", "Ioniq 5", "Ioniq 5 N", "Ioniq 6", "Ioniq 9", "Kona", "Kona Electric", "Kona N",
    "Nexo", "Palisade", "Santa Cruz", "Santa Fe", "Santa Fe Hybrid", "Santa Fe Plug-In Hybrid",
    "Sonata", "Tiburon", "Tucson", "Tucson Hybrid", "Tucson Plug-In Hybrid",
    "Veloster", "Veloster N", "Venue"
  ].sort(),
  Kia: [
    "Amanti", "Bongo", "Borrego", "Cadenza", "Carnival", "EV3", "EV5", "EV6", "EV9",
    "Forte", "K4", "K5", "K900", "Mohave", "Niro", "Niro EV", "Niro Hybrid", "Niro PHEV",
    "Optima", "Optima Hybrid", "Optima PHEV", "Rio", "Rondo", "Sedona", "Seltos",
    "Sorento", "Sorento Hybrid", "Sorento PHEV", "Soul", "Soul EV", "Spectra",
    "Sportage", "Sportage Hybrid", "Stinger", "Telluride"
  ].sort(),
  Volkswagen: [
    "Arteon", "Atlas", "Atlas Cross Sport", "Beetle", "CC", "Corrado", "Eos", "Golf",
    "Golf Alltrack", "Golf GTI", "Golf R", "ID.3", "ID.4", "ID.5", "ID.Buzz", "Jetta",
    "Jetta GLI", "Karmann Ghia", "Passat", "Phaeton", "Rabbit", "Routan", "Taos",
    "Tiguan", "Touareg"
  ].sort(),
  Subaru: [
    "Ascent", "Baja", "BRZ", "Crosstrek", "Crosstrek Wilderness", "Forester", "Impreza",
    "Impreza WRX", "Legacy", "Outback", "Outback Wilderness", "Solterra", "SVX",
    "Tribeca", "WRX", "WRX STI", "XT"
  ].sort(),
  Lexus: [
    "CT", "ES", "GS", "GX", "GX 550", "HS", "IS", "IS F", "LC", "LFA", "LS", "LX",
    "NX", "NX 450h+", "RC", "RC F", "RX", "RX 500h", "RZ", "SC", "TX", "UX"
  ].sort(),
  Dodge: [
    "400", "600", "Aries K-car", "Aspen", "Avenger", "B-Series Van", "Caravan", "Challenger",
    "Charger", "Coronet", "D100 D150", "D200 D250", "D300 D350", "Dakota", "Dart", "Daytona",
    "Demon", "Diplomat", "Durango", "Dynasty", "Grand Caravan", "Hornet", "Intrepid", "Journey",
    "Lancer 1980s", "Lil Red Express Truck", "Mini Ram Van", "Mirada", "Monaco", "Neon",
    "Nitro", "Omni", "Polara", "Power Wagon", "Raider", "Ram", "Ram 1500", "Ram 2500",
    "Ram 3500", "Ram Van", "Ramcharger", "Rampage", "Spirit", "Sportsman", "Sprinter",
    "Stealth", "Stratus", "Super Bee", "Tradesman", "Viper", "Wagoneer", "Warlock"
  ].sort()
};