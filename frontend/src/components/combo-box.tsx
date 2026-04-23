import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface ComboBoxProps {
  setValue?: (value: string) => void

  value: string | undefined
  options: { _id: string; name: string; image?: string | null }[]
  disabled?: boolean
  placeholder?: string
  searchTerm?: string
  setSearchTerm?: React.Dispatch<React.SetStateAction<string>>
  shouldFilter?: boolean
  className?: string
}

export const ComboBox: React.FC<ComboBoxProps> = ({
  setValue,
  value,
  options,
  disabled,
  placeholder,
  searchTerm,
  setSearchTerm,
  shouldFilter,
  className,
}) => {
  const [open, setOpen] = React.useState(false)
  const text = placeholder ? placeholder : "Select option..."
  const selectedValue = options.find((option) => option._id === value)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          disabled={disabled}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full h-fit min-h-9 justify-between select-none", className)}
        >
          <p className="flex items-center gap-2 text-left text-wrap break-all">
            {" "}
            {selectedValue?.image && (
              <img
                loading="lazy"
                className="3xl:max-w-16 3xl:h-11 h-7 max-w-12 object-contain"
                src={selectedValue?.image}
              />
            )}
            <span className="3xl:text-lg">
              {" "}
              {selectedValue ? selectedValue.name : text}
            </span>
          </p>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command shouldFilter={shouldFilter}>
          <CommandInput
            className="3xl:h-16"
            placeholder="Search option..."
            value={searchTerm}
            onValueChange={(value) => setSearchTerm?.(value)}
          />
          <CommandList>
            <CommandEmpty>No option found.</CommandEmpty>
            <CommandGroup>
              {options?.map((option) => (
                <CommandItem
                  key={option._id}
                  className="gap-2"
                  value={option.name + String(option._id)} // to avoid selecting two or more items that has the same name proprty.
                  onSelect={() => {
                    setValue?.(option._id === value ? "" : option._id)

                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-1 h-4 w-4",
                      value === option._id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.image && (
                    <img
                      loading="lazy"
                      className="3xl:max-w-16 3xl:h-11 h-7 max-w-12 object-contain"
                      src={option.image}
                    />
                  )}
                  {option.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
