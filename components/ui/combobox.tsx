"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxDemoProps {
  options: ComboboxOption[];
  onSelect: (value: string) => void;
  placeholder: string;
  selectedValue?: string;
}

export function ComboboxDemo({
  options,
  onSelect,
  placeholder,
  selectedValue,
}: ComboboxDemoProps) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(selectedValue || "");
  const [filteredOptions, setFilteredOptions] = React.useState<ComboboxOption[]>(options);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [displayedOptions, setDisplayedOptions] = React.useState<ComboboxOption[]>([]);
  const [page, setPage] = React.useState(1);
  const itemsPerPage = 300;

  React.useEffect(() => {
    setValue(selectedValue || "");
  }, [selectedValue]);

  React.useEffect(() => {
    const filtered = options.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      option.value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOptions(filtered);
    setPage(1);
  }, [options, searchTerm]);

  React.useEffect(() => {
    setDisplayedOptions(filteredOptions.slice(0, page * itemsPerPage));
  }, [filteredOptions, page]);

  if (!options || options.length === 0) {
    return <div>Loading options...</div>;
  }

  const handleInputChange = (input: string) => {
    setSearchTerm(input);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const bottom = e.currentTarget.scrollHeight - e.currentTarget.scrollTop === e.currentTarget.clientHeight;
    if (bottom && displayedOptions.length < filteredOptions.length) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[350px] justify-between text-black"
        >
          {value
            ? options.find((option) => option.value === value)?.label || ""
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0">
        <Command className="w-full">
          <CommandInput
            placeholder={`Search ${placeholder.toLowerCase()}...`}
            onValueChange={handleInputChange}
            className="w-full"
          />
          <CommandList className="max-h-[300px] overflow-y-auto" onScroll={handleScroll}>
            <CommandEmpty>No {placeholder.toLowerCase()} found.</CommandEmpty>
            <CommandGroup>
              {displayedOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue);
                    setOpen(false);
                    onSelect(currentValue);
                  }}
                  className="text-xs"
                >
                  <Check
                    className={cn(
                      "mr-2 h-3 w-3",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
