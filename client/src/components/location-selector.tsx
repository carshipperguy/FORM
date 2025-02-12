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
import { type LocationOption, searchLocations } from "@/lib/location-data";

interface LocationSelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
}

export function LocationSelector({
  value,
  onChange,
  placeholder = "Enter location...",
  label = "Select location",
  disabled = false
}: LocationSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [locations, setLocations] = React.useState<LocationOption[]>([]);

  // Debounced search implementation
  const debouncedSearch = React.useCallback(
    React.useMemo(
      () => {
        let timeoutId: NodeJS.Timeout;
        return (query: string) => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            const results = searchLocations(query);
            setLocations(results);
          }, 300); // 300ms debounce delay
        };
      },
      []
    ),
    []
  );

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
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {value}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput
            placeholder="Search city or ZIP code..."
            value={searchQuery}
            onValueChange={(query) => {
              setSearchQuery(query);
              debouncedSearch(query);
            }}
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
                    onChange(currentValue);
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
                      ZIP: {location.zip}
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