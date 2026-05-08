import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import DialogComponent from "@components/dialog-component"
import { Input } from "@/components/ui/input"
import { RotateCcw } from "lucide-react"
import { CalendarIcon } from "@radix-ui/react-icons"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import Box from "@mui/joy/Box"
import Slider from "@mui/joy/Slider"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@hooks/use-toast"
import { CarItem, ClientWithPhoneNumbers, ServiceStatus } from "@lib/types"
import { ServiceStatusCombobox } from "@components/service-status-combobox"
import { CarsComboBox } from "@components/car-combo-box"
import { ClientsComboBox } from "@components/clients-combobox"
import { formatCurrency } from "@lib/client-helpers"

function valueText(value: any) {
  return `price range ${value}`
}

interface SearchProps {
  isAdmin: boolean
  isClient?: boolean
  currPage: string
  carId: string
  clientId: string
  dateFrom: string
  dateTo: string
  minPrice: string
  maxPrice: string
  serviceStatusId: string
  status: ServiceStatus[]
  cars: CarItem[]
  clients: ClientWithPhoneNumbers[]
  className?: string
}

const SearchDialog = ({
  isAdmin,
  cars,
  clients,
  currPage,
  carId,
  clientId,
  dateTo,
  dateFrom,
  status,
  serviceStatusId,
  minPrice,
  maxPrice,
  className,
}: SearchProps) => {
  const initalValus = {
    minPrice: Number(minPrice) || 0,
    maxPrice: Number(maxPrice) || 0,
    dateFrom: dateFrom ? new Date(dateFrom) : undefined,
    dateTo: dateTo ? new Date(dateTo) : undefined,
    carId: Number(carId) || 0,
    clientId: Number(clientId) || 0,
    statusId: Number(serviceStatusId) || 0,
  }

  const rangeValues = [initalValus.minPrice, initalValus.maxPrice]
  const { toast } = useToast()
  const [open, setOpen] = React.useState(false)
  const [car, setCar] = useState<number>(initalValus.carId)
  const [client, setClient] = useState<number>(initalValus.clientId)
  const [statusId, setStatusId] = useState<number>(initalValus.statusId)
  const [step, setStep] = useState(50)
  const [date, setDate] = React.useState<DateRange | undefined>({
    to: initalValus.dateTo,
    from: initalValus.dateFrom,
  })

  const [value, setValue] = React.useState(rangeValues)
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const page = Number(currPage)

  function handleReset() {
    setCar(0)
    setClient(0)
    setStatusId(0)
    setDate(undefined)
    setValue([0, 0])
  }

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    if (/^\d*$/.test(inputValue)) {
      const newMinPrice = Number(inputValue)
      setValue([newMinPrice, value[1]])
      // if (newMinPrice <= value[1]) {
      //   setValue([newMinPrice, value[1]]);
      // } else {
      //   toast({
      //     variant: "destructive",
      //     title: "Invalid value",
      //     description: `Min total price must be lower than ${value[1]}`,
      //   });
      // }
    }
  }

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    if (/^\d*$/.test(inputValue)) {
      const newMaxPrice = Number(inputValue)
      setValue([value[0], newMaxPrice])
      // if (newMaxPrice >= value[0]) {
      //   setValue([value[0], newMaxPrice]);
      // } else {
      //   toast({
      //     variant: "destructive",
      //     title: "Invalid value",
      //     description: `Max total price must be higher than ${value[0]}`,
      //   });
      // }
    }
  }

  async function handleSub() {
    // const name = nameValue.trim();
    const dateFrom = date?.from
    const dateTo = date?.to
    const minTotal = value[0]
    const maxPrice = value[1]

    const params = new URLSearchParams(searchParams)

    if (page > 1) params.set("page", String(page - 1))

    if (!car) {
      params.delete("carId")
    } else {
      params.set("carId", String(car))
    }

    if (!client) {
      params.delete("clientId")
    } else {
      params.set("clientId", String(client))
    }

    if (!statusId) {
      params.delete("serviceStatusId")
    } else {
      params.set("serviceStatusId", String(statusId))
    }

    if (!dateFrom) {
      params.delete("dateFrom")
    } else {
      params.set("dateFrom", format(dateFrom, "yyyy-MM-dd"))
    }

    if (!dateTo) {
      params.delete("dateTo")
    } else {
      params.set("dateTo", format(dateTo, "yyyy-MM-dd"))
    }

    if (!minTotal) {
      params.delete("minPrice")
    } else {
      params.set("minPrice", minTotal.toString())
    }
    if (!maxPrice) {
      params.delete("maxPrice")
    } else {
      params.set("maxPrice", maxPrice.toString())
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false })
    setOpen(false)
  }

  const handleChange = (event: Event, newValue: number | number[]) => {
    setValue(newValue as number[])
  }

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <DialogComponent open={open} onOpenChange={setOpen}>
      <DialogComponent.Trigger
        className={cn("ml-auto block w-full sm:w-[250px]", className)}
      >
        <div className="flex items-center justify-between gap-2 rounded-sm border px-2 py-1 text-sm text-muted-foreground">
          Search...{" "}
          <kbd className="pointer-events-none inline-flex h-5 items-center gap-1 rounded-md border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 select-none">
            <span className="text-xs">⌘</span>k
          </kbd>
        </div>
      </DialogComponent.Trigger>
      <DialogComponent.Content className="max-h-[75vh] overflow-y-auto border-none sm:max-w-[425px]">
        <DialogComponent.Header>
          <DialogComponent.Title>Search for recipts</DialogComponent.Title>
          <DialogComponent.Description>
            Filter through all the sales you made.
          </DialogComponent.Description>
        </DialogComponent.Header>
        <form action={handleSub}>
          <div className="flex flex-wrap justify-between gap-2 gap-y-3">
            <div className="mb-auto w-full space-y-2 sm:w-[48%]">
              <ServiceStatusCombobox
                value={statusId}
                setValue={setStatusId}
                options={status}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Search by service status.
              </p>
            </div>

            <div className={cn("grid w-full space-y-2 sm:w-[48%]")}>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    type="button"
                    className={cn(
                      "justify-start gap-3 text-left text-xs font-normal break-all whitespace-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon />
                    {date?.from ? (
                      date.to ? (
                        <>
                          {format(date.from, "LLL dd, y")} -{" "}
                          {format(date.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(date.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground">Search by Date.</p>
            </div>
            <div className="w-full space-y-2">
              <CarsComboBox value={car} setValue={setCar} options={cars} />
              <p className="text-xs text-muted-foreground">Search by car.</p>
            </div>
            <div className="w-full space-y-2">
              <ClientsComboBox
                disabled={!isAdmin}
                value={client}
                setValue={setClient}
                options={clients}
              />

              <p className="text-xs text-muted-foreground">
                Search by clients.
              </p>
            </div>

            <div className="w-full space-y-2 sm:w-[48%]">
              <Input
                type="text"
                value={value[0]}
                onChange={handleMinPriceChange}
                placeholder="Min price"
                className=""
              />
              <p className="text-xs text-muted-foreground">Min total price.</p>
            </div>
            <div className="w-full space-y-2 sm:w-[48%]">
              <Input
                type="text"
                value={value[1]}
                onChange={handleMaxPriceChange}
                placeholder="Max price"
              />
              <p className="text-xs text-muted-foreground">Max total price.</p>
            </div>
            <Box sx={{ width: "100%" }}>
              <Slider
                sx={{
                  "& .MuiSlider-rail": {
                    border: "none",
                    height: "2px",
                  },
                  "& .MuiSlider-track": {
                    backgroundColor: "hsl(var(--primary))", // Style the track
                    height: "2px",
                  },
                  "& .MuiSlider-thumb": {
                    backgroundColor: "hsl(var(--accent))",
                    border: "solid 1px  hsl(var(--border))",
                    "&:hover, &.Mui-active, &.Mui-focusVisible": {
                      boxShadow: "none", // Remove the box shadow on hover, focus, or active state
                      border: "none",
                      outline: "none",
                    },
                  },
                  "& .css-hayzob-JoySlider-thumb::before ": {
                    backgroundColor: "hsl(var(--accent))",
                    //   borderColor: "hsl(var(--border))",
                    border: "solid 1px  hsl(var(--border))",
                  },

                  "& .css-sl4hj6-JoySlider-valueLabel": {
                    background: "hsl(var(--background))",
                    color: "hsl(var(--muted-foreground))",

                    outline: "none",
                  },

                  "& .css-sl4hj6-JoySlider-valueLabel::before": {
                    color: "hsl(var(--background))",
                  },
                }}
                getAriaLabel={() => "Temperature range"}
                value={value}
                max={300000}
                step={step}
                onChange={handleChange}
                valueLabelDisplay="auto"
                getAriaValueText={valueText}
              />
              <Input
                type="text"
                value={step}
                onChange={(e) => {
                  const inputValue = e.target.value
                  if (/^\d*$/.test(inputValue)) {
                    const value = Number(inputValue)

                    setStep(value)
                  }
                }}
                placeholder="Max price"
                className="ml-auto h-7 w-10 p-1 pl-[.4rem]"
              />
            </Box>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div>
                Min price:{" "}
                <span className="text-xs text-muted-foreground">
                  {formatCurrency(value[0])}
                </span>
              </div>
              <div>
                Max price:{" "}
                <span className="text-xs text-muted-foreground">
                  {formatCurrency(value[1])}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-col-reverse gap-2">
            <DialogComponent.Close className="inline-flex h-8 items-center justify-center rounded-md bg-secondary px-3 text-xs font-medium whitespace-nowrap text-secondary-foreground shadow-sm transition-colors hover:bg-secondary/80 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50">
              Cancel
              {/* <Button
                variant="secondary"
                size="sm"
                type="button"
                className=" w-full"
              >
                Cancel */}
              {/* </Button> */}
            </DialogComponent.Close>
            <Button type="submit" size="sm">
              Search...
            </Button>
            <Button
              onClick={handleReset}
              type="button"
              className="bottom-2 left-1 ml-auto hidden h-6 w-6 p-0 sm:flex"
              variant="outline"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </DialogComponent.Content>
    </DialogComponent>
  )
}

export default SearchDialog
