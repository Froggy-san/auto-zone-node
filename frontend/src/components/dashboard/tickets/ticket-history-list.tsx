import useInfiniteTicketHistory from "@lib/queries/tickets/useInfiniteTicketHistory"
import React, { useCallback, useEffect, useMemo, useRef } from "react"
import { useInView } from "react-intersection-observer"
import TicketHistory from "./ticket-history"
import ErrorMessage from "@components/error-message"
import {
  Client,
  Message,
  TicketCategory,
  TicketHistory as TicketHistoryType,
  TicketPriority,
  TicketStatus,
} from "@lib/types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import Spinner from "@components/Spinner"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Input } from "@components/ui/input"
import {
  ArrowDownNarrowWide,
  ArrowUpWideNarrow,
  CalendarClock,
  CalendarDays,
  CalendarIcon,
  ListTree,
  PersonStanding,
} from "lucide-react"
import { Button } from "@components/ui/button"
import { PiPerson } from "react-icons/pi"
import useDebounce from "@hooks/use-debounce"
import InfiniteClientsList from "@components/infinite-clients-list"
import { cn } from "@lib/utils"
import { formatDate } from "date-fns"
import { Calendar } from "@components/ui/calendar"
import { DateRange } from "react-day-picker"
import TicketCategoryList from "@components/ticket-category-list"
import HoverPopCard from "@components/hover-pop-card"

interface Props {
  selectedMessage?: Message | undefined
  ticketStatuses: TicketStatus[]
  ticketCategory: TicketCategory[]
  ticketPriorities: TicketPriority[]
}
type SearchType =
  | "default"
  | "actor_id"
  | "ticket_id.client_id"
  | "id"
  | "ticket_id"
  | "actor_id"
const SELECT_ITEMS: { label: string; value: SearchType }[] = [
  { label: "Default", value: "default" },
  { label: "Actor", value: "actor_id" },
  { label: "Ticket", value: "ticket_id.client_id" },
  // { label: "Id", value: "id" },
  { label: "Ticket Id", value: "ticket_id" },
  // { label: "Actor Id", value: "actor_id" },
]
const TicketHistoryList = ({
  ticketPriorities,
  ticketStatuses,
  selectedMessage,
  ticketCategory,
}: Props) => {
  const [searchterm, setSearchTerm] = React.useState("")
  const [type, setType] = React.useState<SearchType>("default")
  const [selectedClient, setSelectedClient] = React.useState<null | Client>(
    null
  )
  const [category, setCategory] = React.useState<TicketCategory | null>(null)
  const [date, setDate] = React.useState<DateRange | undefined>(undefined)
  const [sortBy, setSortBy] = React.useState<"asc" | "desc" | string>("desc")
  const debouncedValue = useDebounce(searchterm, 500)

  const {
    data,
    error,
    fetchNextPage,
    isFetchingNextPage,
    isFetching,
    hasNextPage,
  } = useInfiniteTicketHistory({
    searchterm:
      type !== "ticket_id" ? { term: debouncedValue, type } : undefined,
    clientId: selectedClient?.id,
    dateFrom: date?.from,
    dateTo: date?.to,
    ticketCategory_id: category?.id,
    ticketId: type === "ticket_id" ? Number(debouncedValue) : undefined,
    sort: sortBy,
  })
  // dashboard/tickets?ticket=41
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { ref, inView } = useInView({
    // 👈 This is the key setting to isolate the observer instance
    // root: null,
    // You might also want to combine this with:
    // triggerOnce: true,
    // threshold: 0,
  })

  const handleViewDetails = useCallback(
    (ticketId: number, messageId?: number) => {
      const newSearchParams = new URLSearchParams(searchParams)
      newSearchParams.set("ticket", String(ticketId))
      if (messageId) newSearchParams.set("messageId", `${messageId}`)
      router.push(`${pathname}?${newSearchParams.toString()}`, {
        scroll: false,
      })
    },
    [router, searchParams, pathname]
  )
  const selectHistory = useCallback(
    (ticketId: number, historyId: number) => {
      console.log("WWWWW")
      const params = new URLSearchParams(searchParams)

      params.set("ticket", String(ticketId))
      params.set("historyId", `${historyId}`)
      router.push(`${pathname}?${params.toString()}`, {
        scroll: false,
      })
    },
    [router, searchParams, pathname]
  )

  useEffect(() => {
    if (!isFetchingNextPage && hasNextPage) fetchNextPage()
  }, [inView])

  const ticketHistories: TicketHistoryType[] = useMemo(() => {
    return data ? data?.pages.flatMap((item) => item.items) : []
  }, [data])

  if (error) return <ErrorMessage>{`${error}`}</ErrorMessage>

  return (
    <>
      <Filters
        searhchterm={searchterm}
        setSearchterm={setSearchTerm}
        ticketStatuses={ticketStatuses}
        ticketPriorities={ticketPriorities}
        ticketCategories={ticketCategory}
        setCategory={setCategory}
        selectedCategory={category}
        setSortBy={setSortBy}
        sortBy={sortBy}
        selectItems={SELECT_ITEMS}
        type={type}
        setType={setType}
        selectedClient={selectedClient}
        setSelectedClient={setSelectedClient}
        date={date}
        setDate={setDate}
      />
      {isFetching && ticketHistories.length === 0 ? (
        <div className="flex h-[1px] justify-center pt-20">
          <Spinner size={40} />
        </div>
      ) : (
        <ul className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4">
          {ticketHistories.map((ticketHistory) => (
            <TicketHistory
              key={ticketHistory.id}
              selectHistory={selectHistory}
              selectedMessage={selectedMessage}
              handleViewDetails={handleViewDetails}
              ticketStatuses={ticketStatuses}
              ticketPriorities={ticketPriorities}
              ticketHistory={ticketHistory}
            />
          ))}
        </ul>
      )}

      <div ref={ref} className="mt-20 overflow-hidden">
        {isFetchingNextPage ? (
          <Spinner size={30} className="static" />
        ) : !isFetchingNextPage &&
          !isFetching &&
          ticketHistories.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No ticket history found.
          </p>
        ) : null}
      </div>
    </>
  )
}

export default React.memo(TicketHistoryList)

interface FiltersProps {
  searhchterm: string
  selectItems?: { label: string; value: SearchType }[]
  type: SearchType
  selectedClient?: Client | null
  date?: DateRange
  ticketStatuses: TicketStatus[]
  ticketPriorities: TicketPriority[]
  ticketCategories: TicketCategory[]
  selectedCategory?: TicketCategory | null
  sortBy: "asc" | "desc" | string
  setSortBy: (sort: "asc" | "desc" | string) => void
  setCategory: (category: TicketCategory | null) => void
  setSearchterm: (term: string) => void
  setType: (type: SearchType) => void
  setSelectedClient?: (client: Client | null) => void
  setDate?: (date: DateRange | undefined) => void
}

function Filters({
  searhchterm,
  setSearchterm,
  selectItems,
  type,
  setType,
  selectedClient,
  ticketCategories,
  setCategory,
  selectedCategory,
  ticketPriorities,
  ticketStatuses,
  sortBy,
  setSortBy,
  setSelectedClient,
  date,
  setDate,
}: FiltersProps) {
  const [isClientOpen, setClientOpen] = React.useState(false)
  const [isDateOpen, setDateOpen] = React.useState(false)
  const [isCategoryOpen, setCategoryOpen] = React.useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const categoryInputRef = useRef<HTMLInputElement>(null)
  const clientInputRef = useRef<HTMLInputElement>(null)
  const isThereSelectedClient = selectedClient !== null
  const isId = type === "ticket_id"
  useEffect(() => {
    if (isClientOpen) {
      if (clientInputRef) {
        setTimeout(() => {
          clientInputRef.current?.focus()
        }, 100)
      }
    }
    if (isCategoryOpen) {
      if (categoryInputRef) {
        setTimeout(() => {
          categoryInputRef.current?.focus()
        }, 100)
      }
    }
  }, [isClientOpen, isCategoryOpen])

  return (
    <div className="mx-auto flex w-full items-center justify-between gap-1 rounded-full border border-border/70 px-1.5 py-1.5 shadow-md sm:w-[95%] sm:px-4">
      {" "}
      <div className="flex items-center gap-1">
        <HoverPopCard
          open={isClientOpen}
          onOpenChange={setClientOpen}
          className="sm:w-80"
          trigger={
            <Button
              variant="outline"
              className={cn(
                "h-7 w-7 p-1",
                isThereSelectedClient && "bg-accent"
              )}
            >
              <PiPerson className="h-5 w-5" />
            </Button>
          }
          content={
            <InfiniteClientsList
              ref={clientInputRef}
              setOpen={setClientOpen}
              selectedClient={selectedClient}
              onVlaueChange={setSelectedClient}
            />
          }
        />

        <HoverPopCard
          open={isDateOpen}
          onOpenChange={setDateOpen}
          className="max-h-[50vh] w-auto overflow-y-auto p-0"
          trigger={
            <Button variant="outline" className="h-7 w-7 p-1">
              <CalendarDays className="h-5 w-5" />
            </Button>
          }
          content={
            <>
              <Calendar
                className="!text-xs"
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
              <div className="px-4 py-2 text-center">
                {date?.from ? (
                  date.to ? (
                    <>
                      {formatDate(date.from, "LLL dd, y")} -{" "}
                      {formatDate(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    formatDate(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </div>
            </>
          }
        />

        <HoverPopCard
          open={isCategoryOpen}
          onOpenChange={setCategoryOpen}
          className="sm:w-80"
          trigger={
            <Button
              variant="outline"
              className={cn(
                "h-7 w-7 p-1",
                isThereSelectedClient && "bg-accent"
              )}
            >
              <ListTree className="h-5 w-5" />
            </Button>
          }
          content={
            <TicketCategoryList
              onSelect={setCategory}
              setOpen={setCategoryOpen}
              value={selectedCategory}
              ticketCategories={ticketCategories}
              ref={categoryInputRef}
            />
          }
        />
      </div>
      <div className="relative flex h-7 flex-1 items-center rounded-full border border-input ring-ring transition-all focus-within:ring-1">
        {isId && (
          <span className="absolute top-1/2 left-2 -translate-y-1/2 text-xs text-muted-foreground">
            #
          </span>
        )}
        <Input
          ref={inputRef}
          value={searhchterm}
          onChange={(e) => setSearchterm(e.target.value)}
          placeholder={isId ? "21" : "Search history...."}
          className={cn("h-full w-full border-none pr-0 focus:!ring-0", {
            "ml-2": isId,
          })}
        />
        <Select
          value={type}
          onValueChange={(type) => {
            setType(type as SearchType)
            if (inputRef.current)
              setTimeout(() => {
                if (inputRef.current) inputRef.current.focus()
              }, 100)
          }}
        >
          <SelectTrigger className="mr-1 h-[80%] w-fit gap-1 border-none p-0 pl-1 text-[10px] xs:text-xs sm:px-2 sm:py-1.5">
            <SelectValue placeholder="Seach by" />
          </SelectTrigger>
          <SelectContent>
            {selectItems?.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="h-7 w-fit gap-1 px-1.5 !py-0.5 text-[9px] xs:text-xs"
        onClick={() => {
          setSortBy(sortBy === "asc" ? "desc" : "asc")
        }}
      >
        {" "}
        {sortBy === "desc" || !sortBy ? (
          <>
            <span>Desc</span>
            <ArrowDownNarrowWide className="h-3 w-3 sm:h-4 sm:w-4" />
          </>
        ) : (
          <>
            <span>Asc</span>{" "}
            <ArrowUpWideNarrow className="h-3 w-3 sm:h-4 sm:w-4" />
          </>
        )}{" "}
      </Button>
    </div>
  )
}
