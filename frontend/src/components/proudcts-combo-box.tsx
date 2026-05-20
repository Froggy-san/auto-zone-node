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
import type { Product } from "@/types"
import useInfiniteProducts from "@/features/products/useInfiniteProducts"
import useDebounce from "@/hooks/useDebounce"
import { useEffect } from "react"
import { useInView } from "react-intersection-observer"
import Spinner from "./Spinner"
import { BASE_URL } from "@/lib/constants"

// import { DEFAULT_PRODUCT_PIC } from "@lib/constants"

interface ComboBoxProps {
  setValue: (product: Product | null) => void
  value: Product | null
  // options: Product[]
  disabled?: boolean
  setProductArr?: React.Dispatch<React.SetStateAction<Product[]>>
  productArr?: Product[]
  productToSell: {
    product: string
    pricePerUnit: number
    discountPerUnit: number
    count: number
    isReturned: boolean
    note: string
  }[]
}

export const ProductsComboBox: React.FC<ComboBoxProps> = ({
  setValue,
  value,
  setProductArr,
  productArr,

  // options,
  disabled,
  productToSell,
}) => {
  const [open, setOpen] = React.useState(false)

  const [searchTerm, setSearchTerm] = React.useState("")

  const { ref, inView } = useInView()
  const debouncedValue = useDebounce(searchTerm, 500)
  const { data, fetchNextPage, isFetching, isFetchingNextPage, error } =
    useInfiniteProducts(debouncedValue)

  const options = React.useMemo(() => {
    if (!data) return []
    return data.pages.flatMap((page) => page.products) as Product[]
  }, [data])

  useEffect(() => {
    if (isFetchingNextPage) return

    fetchNextPage()
  }, [inView, isFetchingNextPage])

  const isIntialLoading = !data && isFetching
  const DEFAULT_PRODUCT_PIC =
    "https://res.cloudinary.com/dxfq3iotg/image/upload/v1560908776/no-image.png"
  // const [value, setValue] = React.useState(0);
  const selected = value
  //  options.find((option) => option._id === value)
  const seletedImg = selected?.productImages.length
    ? selected.productImages.find((img) => img.isMain)?.imageUrl ||
      selected.productImages[0].imageUrl
    : DEFAULT_PRODUCT_PIC
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
            <div className="flex flex-1 items-center justify-center gap-5 break-all">
              <p className="text-left text-wrap">
                Name: {selected.name} / Category : {selected.category.name}{" "}
                <span className="text-xs text-nowrap text-muted-foreground">
                  Stock: {selected.stock}
                </span>
              </p>
              <img
                src={`${BASE_URL}${seletedImg}`}
                alt="Car logo"
                className="h-9 w-9 max-w-[100%] rounded-sm object-cover"
              />
            </div>
          ) : (
            "Select option..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="h-[30vh] w-[300px] p-0 sm:h-[unset] sm:w-[400px]">
        <Command shouldFilter={false}>
          <CommandInput
            onValueChange={(value) => setSearchTerm(value)}
            placeholder="Search option..."
          />
          <CommandList>
            <CommandEmpty>No option found.</CommandEmpty>
            {isIntialLoading ? null : (
              <CommandGroup>
                {options?.map((option) => {
                  const img = option.productImages?.length
                    ? option.productImages.find((image) => image.isMain)
                        ?.imageUrl || option.productImages[0].imageUrl
                    : DEFAULT_PRODUCT_PIC

                  const isSelected = productToSell?.some(
                    (item) =>
                      item.product === option._id &&
                      selected?._id !== option._id
                  )

                  return (
                    <CommandItem
                      key={option._id}
                      value={option._id} // to avoid selecting two or more items that has the same name proprty.
                      disabled={
                        !option.isAvailable || !option.stock || isSelected
                      }
                      onSelect={() => {
                        if (isSelected) return
                        const isSameAsCurrent = option._id === value?._id

                        setValue(isSameAsCurrent ? null : option)
                        console.log("Selected Product ID:", option)
                        setOpen(false)
                      }}
                      className="justify-between gap-2"
                    >
                      <div className="flex items-center gap-2">
                        {!isSelected && (
                          <Check
                            className={cn(
                              "h-4 w-4 shrink-0",
                              value?._id === option._id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        )}

                        {isSelected && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-green-500" />
                        )}
                        <p className="text-left text-wrap">
                          Name: {option.name} / Category :{" "}
                          {option.category.name}{" "}
                          <span className="text-xs text-nowrap text-muted-foreground">
                            Stock: {option.stock}
                          </span>
                        </p>
                      </div>
                      <img
                        src={`${BASE_URL}${img}`}
                        alt="Car logo"
                        className="h-9 w-9 max-w-[100%] rounded-sm object-cover"
                      />
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            )}
            <div ref={ref} className="flex items-center justify-center p-2">
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
