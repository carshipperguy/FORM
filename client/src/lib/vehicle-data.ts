export const vehicleTypes = ["car", "suv", "pickup", "other"] as const;

export const makes = {
  car: ["Toyota", "Honda", "Ford", "Chevrolet", "BMW", "Mercedes", "Audi", "Tesla"],
  suv: ["Toyota", "Honda", "Ford", "Chevrolet", "BMW", "Mercedes", "Audi", "Tesla"],
  pickup: ["Ford", "Chevrolet", "RAM", "Toyota", "GMC", "Nissan"],
};

export const models = {
  car: {
    Toyota: ["Camry", "Corolla", "Prius"],
    Honda: ["Civic", "Accord"],
    Ford: ["Mustang", "Fusion"],
    Chevrolet: ["Malibu", "Impala"],
  },
  suv: {
    Toyota: ["RAV4", "Highlander", "4Runner"],
    Honda: ["CR-V", "Pilot"],
    Ford: ["Explorer", "Escape"],
    Chevrolet: ["Tahoe", "Equinox"],
  },
  pickup: {
    Ford: ["F-150", "Ranger"],
    Chevrolet: ["Silverado", "Colorado"],
    RAM: ["1500", "2500"],
    Toyota: ["Tundra", "Tacoma"],
  },
};

export const otherVehicleTypes = [
  "Boat",
  "Golf Cart",
  "Motorcycle",
  "RV",
  "5th Wheel",
  "Travel Trailer",
  "ATV/UTV",
] as const;
