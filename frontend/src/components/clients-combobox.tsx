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

import { DEFAULT_CAR_LOGO } from "@/lib/constants"
import type { User } from "@/types"
import useInfiniteUsers from "@/features/users/useInfiniteUsers"
import useDebounce from "@/hooks/useDebounce"
import Spinner from "./Spinner"
import { useInView } from "react-intersection-observer"

// const frameworks = [
//   {
//     value: "next.js",
//     label: "Next.js",
//   },
//   {
//     value: "sveltekit",
//     label: "SvelteKit",
//   },
//   {
//     value: "nuxt.js",
//     label: "Nuxt.js",
//   },
//   {
//     value: "remix",
//     label: "Remix",
//   },
//   {
//     value: "astro",
//     label: "Astro",
//   },
// ];

interface ClientsComboBoxProps {
  setValue: React.Dispatch<React.SetStateAction<string | null>>
  value: string | null
  // options: User[]
  disabled?: boolean
}

export const ClientsComboBox: React.FC<ClientsComboBoxProps> = ({
  setValue,
  value,
  // options,
  disabled,
}) => {
  const [open, setOpen] = React.useState(false)

  const [searchTerm, setSearchTerm] = React.useState("")
  const { ref, inView } = useInView()

  const debouncedValue = useDebounce(searchTerm, 500)
  const { data, fetchNextPage, isFetchingNextPage, error, isFetching } =
    useInfiniteUsers(debouncedValue)

  const options = data?.pages.flatMap((item) => item.data) || []
  // const [value, setValue] = React.useState(0);
  const selected = options.find((option) => option._id === value)

  React.useEffect(() => {
    if (!inView || isFetching) return

    fetchNextPage()
  }, [inView, isFetching])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          disabled={disabled}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-fit min-h-9 w-full justify-between select-none"
        >
          {selected ? (
            <p className="text-left text-wrap">Name: {selected.username}</p>
          ) : (
            "Select client..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command shouldFilter={false} className="max-h-[30vh] sm:max-h-[500px]">
          <CommandInput
            value={searchTerm}
            onValueChange={(value) => setSearchTerm(value)}
            placeholder="Search client..."
          />
          <CommandList>
            <CommandEmpty>No option found.</CommandEmpty>
            <CommandGroup>
              {options?.map((option) => {
                const phones = option.phones || []
                const phoneStirng = phones.length ? phones.join(" ") : ""

                return (
                  <CommandItem
                    key={option.id}
                    value={option.username + phoneStirng + String(option.id)} // to avoid selecting two or more items that has the same name proprty.
                    onSelect={() => {
                      setValue(option.id === value ? "" : option.id)
                      setOpen(false)
                    }}
                    className="gap-2"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <p className="flex-1 break-all">Name: {option.username}</p>
                  </CommandItem>
                )
              })}
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
