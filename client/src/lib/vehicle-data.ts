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

export const makes = {
  "car/truck/suv": ["Toyota", "Honda", "Ford", "Chevrolet", "BMW", "Mercedes", "Audi", "Tesla", "RAM", "GMC", "Nissan"],
};

export const models = {
  "car/truck/suv": {
    Toyota: ["Camry", "Corolla", "Prius", "RAV4", "Highlander", "4Runner", "Tundra", "Tacoma"],
    Honda: ["Civic", "Accord", "CR-V", "Pilot"],
    Ford: ["Mustang", "Fusion", "Explorer", "Escape", "F-150", "Ranger"],
    Chevrolet: ["Malibu", "Impala", "Tahoe", "Equinox", "Silverado", "Colorado"],
    RAM: ["1500", "2500", "3500"],
    GMC: ["Sierra", "Canyon", "Yukon", "Terrain"],
    Nissan: ["Altima", "Maxima", "Rogue", "Pathfinder", "Frontier", "Titan"],
  },
};