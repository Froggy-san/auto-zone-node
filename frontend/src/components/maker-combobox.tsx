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
import type { CarMaker, CarModel } from "@/types"
import useDebounce from "@/hooks/useDebounce"
import { useInView } from "react-intersection-observer"
import useInfiniteCarMakers from "@/features/carMakers/useInfiniteCarMaker"
import Spinner from "./Spinner"

interface CarModelComboBoxProps {
  setValue: (carMaker: string | null) => void
  value: string | null
  setModels?: (models: CarModel[]) => void
  // options: CarMaker[]
  disabled?: boolean
}

export const MakerCombobox: React.FC<CarModelComboBoxProps> = ({
  setValue,
  value,
  setModels,
  // options,
  disabled,
}) => {
  const [open, setOpen] = React.useState(false)
  // const [value, setValue] = React.useState(0);
  const [search, setSearch] = React.useState("")
  const debouncedSearch = useDebounce(search, 500)

  const { ref, inView } = useInView()

  const { data, fetchNextPage, isFetchingNextPage, isFetching, error } =
    useInfiniteCarMakers(debouncedSearch)

  const options = React.useMemo(() => {
    return data?.pages.flatMap((item) => item.data)
  }, [data?.pages])

  React.useEffect(() => {
    if (!inView || isFetching) return
    fetchNextPage()
  }, [inView, isFetching])

  React.useEffect(() => {
    const selectedModel = options?.find((maker) => maker._id === value)

    setModels?.(selectedModel?.carModels || [])
  }, [value, options])

  const selectedItem = options?.find((option) => option._id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          disabled={disabled}
          variant="outline"
          role="CarModelComboBox"
          aria-expanded={open}
          className="h-fit min-h-9 w-full justify-between select-none"
        >
          {selectedItem ? (
            <>
              <p className="pr-2 text-left text-wrap break-all">
                {" "}
                {selectedItem.name}
              </p>
              <span className="ml-auto">
                {selectedItem.logo ? (
                  <img
                    src={selectedItem.logo}
                    alt="logo"
                    className="h-6 object-contain"
                  />
                ) : null}
              </span>
            </>
          ) : (
            "Select option..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command className="max-h-[30vh] sm:max-h-[500px]">
          <CommandInput placeholder="Search option..." />
          <CommandList>
            <CommandEmpty>No option found.</CommandEmpty>
            <CommandGroup>
              {options?.map((option) => (
                <CommandItem
                  key={option._id}
                  value={option.name + String(option._id)} // to avoid selecting two or more items that has the same name proprty.
                  onSelect={() => {
                    const isSame = option._id === value
                    setValue(isSame ? null : option._id)
                    // setModels?.(isSame ? [] : option.carModels || [])
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option._id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="font-semibold">{option.name}</span>{" "}
                  <span className="ml-auto">
                    {option.logo ? (
                      <img
                        src={option.logo}
                        alt="logo"
                        className="h-9 max-w-10 object-contain"
                      />
                    ) : null}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
            <div ref={ref} className="flex items-center justify-center">
              {isFetching && <Spinner className="size-3.5" />}
            </div>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
