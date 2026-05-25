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
import useInfiniteCars from "@/features/cars/useInfiniteCars"
import { BASE_URL } from "@/lib/constants"
import useDebounce from "@/hooks/useDebounce"
import { useInView } from "react-intersection-observer"
import Spinner from "./Spinner"

interface Props {
  setValue: React.Dispatch<React.SetStateAction<string>>
  value: string
  // options: CarItem[]
  disabled?: boolean
}

export const CarsComboBox: React.FC<Props> = ({
  setValue,
  value,
  // options,
  disabled,
}) => {
  const [searchTerm, setSearchTerm] = React.useState("")

  const debouncedValue = useDebounce(searchTerm, 500)
  const [open, setOpen] = React.useState(false)

  const {
    data,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isFetching,
    error,
  } = useInfiniteCars(searchTerm)
  const { ref, inView } = useInView()
  const options = React.useMemo(() => {
    return data ? data.pages.flatMap((d) => d.data) : []
  }, [data])

  React.useEffect(() => {
    if (isFetching || !hasNextPage) return
    fetchNextPage()
  }, [inView, isFetching, hasNextPage])
  // const [value, setValue] = React.useState(0);
  const selected = options.find((option) => option.id === value)
  const image =
    selected?.carImages.length &&
    (selected?.carImages.find((image) => image.isMain)?.imagePath ||
      selected?.carImages[0].imagePath)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          disabled={disabled}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selected ? (
            <div className="flex flex-wrap items-center gap-2">
              Plate: {selected.plateNumber} /{" "}
              <div className="flex items-center gap-2">
                {" "}
                Image:{" "}
                {image ? (
                  <img
                    src={`${BASE_URL}${image}`}
                    className="max-h-[1.4rem] max-w-7 object-contain"
                    alt="Car image"
                  />
                ) : (
                  "-"
                )}
              </div>
            </div>
          ) : (
            "Select car..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="h-[30vh] w-[300px] p-0 sm:h-[unset] sm:w-[400px]">
        <Command shouldFilter={false}>
          <CommandInput
            value={searchTerm}
            onValueChange={(value) => setSearchTerm(value)}
            placeholder="Search Car Plate..."
          />
          <CommandList>
            <CommandEmpty>No option found.</CommandEmpty>
            <CommandGroup>
              {options?.map((option) => {
                // const phones = option.phoneNumbers.length
                //   ? option.phoneNumbers.map((phone) => phone.number)
                // //   : [];
                // const phoneStirng = phones.length ? phones.join(" ") : "";

                const optionImage =
                  option.carImages.length &&
                  (option?.carImages.find((image) => image.isMain)?.imagePath ||
                    option.carImages[0].imagePath)

                return (
                  <CommandItem
                    key={option.id}
                    value={option.plateNumber + String(option.id)}
                    onSelect={() => {
                      setValue(option._id === value ? "" : option._id)
                      setOpen(false)
                    }}
                    className="gap-2"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option._id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      Plate: {option.plateNumber} /{" "}
                      <div className="flex flex-1 items-center justify-between gap-2">
                        {" "}
                        Image:{" "}
                        {optionImage ? (
                          <img
                            src={`${BASE_URL}${optionImage}`}
                            className="max-h-7 max-w-7 object-contain"
                            alt="Car image"
                          />
                        ) : (
                          "-"
                        )}
                      </div>
                    </div>
                  </CommandItem>
                )
              })}
            </CommandGroup>
            <div ref={ref} className="flex items-center justify-center">
              {isFetching ? (
                <Spinner className="size-3.5" />
              ) : error ? (
                <p className="text-sm text-red-500">
                  Something went wrong while fetching data.
                </p>
              ) : null}
            </div>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
