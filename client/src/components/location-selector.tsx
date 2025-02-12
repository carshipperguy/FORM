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
}

export function LocationSelector({
  value,
  onChange,
  placeholder = "Enter location...",
  label = "Select location"
}: LocationSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [options, setOptions] = React.useState<LocationOption[]>([]);

  // Debug logs
  React.useEffect(() => {
    console.log('Current value:', value);
    console.log('Current options:', options);
  }, [value, options]);

  // Update options when search query changes
  React.useEffect(() => {
    if (searchQuery) {
      console.log('Searching with query:', searchQuery);
      const results = searchLocations(searchQuery);
      console.log('Search results:', results);
      setOptions(results);
    } else {
      setOptions([]);
    }
  }, [searchQuery]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
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
            placeholder="Enter ZIP code or city name..."
            value={searchQuery}
            onValueChange={(value) => {
              console.log('Input value changed:', value);
              setSearchQuery(value);
            }}
          />
          <CommandEmpty className="py-6 text-center text-sm">
            {searchQuery ? "No locations found." : "Start typing to search..."}
          </CommandEmpty>
          {options.length > 0 && (
            <CommandGroup heading={label}>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    console.log('Selected option:', option);
                    onChange(option.value);
                    setOpen(false);
                    setSearchQuery("");
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{option.city}, {option.state}</span>
                    <span className="text-xs text-muted-foreground">
                      ZIP: {option.zip}
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