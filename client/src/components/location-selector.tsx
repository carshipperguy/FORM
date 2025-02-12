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

  // Handle search query changes
  React.useEffect(() => {
    if (searchQuery.length >= 2) {
      const results = searchLocations(searchQuery);
      console.log('Search results for:', searchQuery, results);
      setOptions(results);
    } else {
      setOptions([]);
    }
  }, [searchQuery]);

  const handleSelect = (currentValue: string) => {
    onChange(currentValue);
    setOpen(false);
    setSearchQuery("");
  };

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
            placeholder="Search by city, state, or ZIP..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandEmpty className="py-6 text-center text-sm">
            {searchQuery.length < 2 
              ? "Type at least 2 characters to search..."
              : "No locations found."}
          </CommandEmpty>
          {options.length > 0 && (
            <CommandGroup heading={label}>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleSelect(option.value)}
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