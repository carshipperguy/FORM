import * as React from "react";
import { Check, ChevronsUpDown, MapPin } from "lucide-react";
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
import { type LocationOption, searchCitiesByQuery } from "@/lib/location-data";

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

  const debouncedSearch = React.useCallback(
    (query: string) => {
      const results = searchCitiesByQuery(query);
      setLocations(results);
    },
    []
  );

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.length >= 2) {
        debouncedSearch(searchQuery);
      } else {
        setLocations([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, debouncedSearch]);

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
          <CommandEmpty className="py-6 text-center text-sm">
            {searchQuery.length < 2 
              ? "Type at least 2 characters to search..."
              : "No locations found."}
          </CommandEmpty>
          {locations.length > 0 && (
            <CommandGroup>
              {locations.map((location) => (
                <CommandItem
                  key={location.value}
                  value={location.value}
                  onSelect={(currentValue) => {
                    // Get the ZIP code if available
                    const zip = location.zips && location.zips.length > 0 ? location.zips[0] : "";
                    // Format location display value (City, STATE) - don't include ZIP in display
                    const displayValue = `${location.city}, ${location.state}`;
                    
                    console.log("LocationSelector selected with ZIP:", { 
                      city: location.city, 
                      state: location.state, 
                      zip: zip,
                      zips: location.zips 
                    });
                    
                    // Pass both the display value and the ZIP code to parent
                    onChange(displayValue, zip);
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
                      ZIP: {location.zips && location.zips.length > 0 ? location.zips[0] : "N/A"}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}