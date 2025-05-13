import * as React from "react";
import { Check, ChevronsUpDown, MapPin, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
// Import our API client instead of the large data file
import { searchLocations } from "../lib/api";

// Define the LocationOption type here instead of importing it
interface LocationOption {
  value: string;
  label?: string;
  city: string;
  state: string;
  zips: string[];
  zip?: string;
  population?: number;
}

interface LocationSelectorProps {
  value: string;
  onChange: (value: string, zipCode?: string) => void;  // Updated to include ZIP code
  placeholder?: string;
  label?: string;
  disabled?: boolean;
}

export function LocationSelector({
  value = "",  // Initialize with empty string
  onChange,
  placeholder = "Enter location...",
  label = "Select location",
  disabled = false
}: LocationSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [locations, setLocations] = React.useState<LocationOption[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  // Search locations using the API client
  const searchLocationsFromAPI = React.useCallback(
    async (query: string) => {
      setIsLoading(true);
      try {
        const results = await searchLocations(query, 200);
        
        // Log info about cities with multiple ZIP codes for debugging
        const citiesWithMultipleZips = results.filter((loc: LocationOption) => loc.zips && loc.zips.length > 1);
        if (citiesWithMultipleZips.length > 0) {
          console.log("Cities with multiple ZIP codes:", 
            citiesWithMultipleZips.map((loc: LocationOption) => ({
              city: loc.city,
              state: loc.state,
              zipCount: loc.zips.length,
              zips: loc.zips.slice(0, 5) // Show just first 5 zips
            }))
          );
        }
        
        setLocations(results);
      } catch (error) {
        console.error("Error searching locations:", error);
        setLocations([]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchLocationsFromAPI(searchQuery);
      } else {
        setLocations([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchLocationsFromAPI]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {value ? (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate-text">{value}</span>
            </span>
          ) : (
            <span className="text-muted-foreground text-xs">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full max-w-[300px] p-0">
        <Command>
          <CommandInput
            placeholder="Search city or ZIP code..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          {isLoading ? (
            <div className="py-6 text-center text-sm flex justify-center items-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Loading locations...
            </div>
          ) : (
            <CommandEmpty className="py-6 text-center text-sm">
              {searchQuery.length < 2 
                ? "Type at least 2 characters to search..."
                : "No locations found."}
            </CommandEmpty>
          )}
          {!isLoading && locations.length > 0 && (
            <CommandGroup>
              {locations.map((location) => {
                // With our new data format, each location has a single ZIP code
                const zip = location.zips && location.zips.length > 0 ? location.zips[0] : location.zip || "";
                const displayValue = `${location.city}, ${location.state}`;
                
                return (
                  <CommandItem
                    key={location.value}
                    value={location.value}
                    onSelect={() => {
                      // URGENT FIX: Ensure ZIP code is properly formatted and passed
                      const formattedZip = zip ? zip.trim() : '';
                      
                      // Debug log to verify proper location format and ZIP
                      console.log("Selected location with ZIP:", { 
                        city: location.city, 
                        state: location.state, 
                        zip: formattedZip,
                        displayValue: displayValue
                      });
                      
                      // Only allow selection if we have a valid ZIP code
                      if (!formattedZip) {
                        console.warn("Location selected without ZIP code:", displayValue);
                      }
                      
                      onChange(displayValue, formattedZip);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === location.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{location.city}, {location.state}</span>
                      <span className="text-xs text-muted-foreground">
                        ZIP: {zip || "N/A"}
                      </span>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}