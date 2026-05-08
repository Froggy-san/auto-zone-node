import {
  Message,
  TicektHistoryDetials,
  TicketHistoryAction,
  TicketHistory as TicketHistoryType,
  TicketPriority,
  TicketStatus as TicketStatusType,
} from "@lib/types"
import { cn } from "@lib/utils"
import { formatDate, formatDistanceToNow } from "date-fns"
import React from "react"
import { ActionBadge } from "./action-badge"
import { ArrowRight, ChevronDown, ChevronUp, MoveRight } from "lucide-react"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar"
import { z } from "zod"
import TicketStatus from "@components/ticket-status"
import { Button } from "@components/ui/button"

interface Props {
  ticketHistory: TicketHistoryType
  ticketStatuses: TicketStatusType[]
  ticketPriorities: TicketPriority[]
  selectedMessage: Message | undefined
  internalActivity?: boolean
  isHistorySelected?: boolean
  handleFocusMessage?: (messageId: number | null) => void
  handleSelectMessage?: (id: number | null) => void
  handleViewDetails?: (ticketId: number, messageId?: number) => void
  selectHistory?: (ticketId: number, hisotryId: number) => void
  className?: string
}

const TicketHistory = React.forwardRef<HTMLLIElement, Props>(
  (
    {
      ticketHistory,
      ticketStatuses,
      ticketPriorities,
      selectedMessage,
      internalActivity,
      handleFocusMessage,
      handleSelectMessage,
      handleViewDetails,
      selectHistory,
      isHistorySelected,
      className,
      ...props
    },
    ref
  ) => {
    const isSelected = selectedMessage?.id === ticketHistory?.message_id
    const ticketId = ticketHistory.ticket?.id as number
    const initials = ticketHistory.actor?.name
      ? ticketHistory.actor?.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "U"

    const timeAgo = formatDistanceToNow(new Date(ticketHistory.created_at), {
      addSuffix: true,
    })
    const fullDate = formatDate(
      new Date(ticketHistory.created_at),
      "MMM d, yyyy 'at' h:mm a"
    )
    const actorPic =
      !ticketHistory.actor || !ticketHistory.actor.picture
        ? undefined
        : ticketHistory.actor.picture
    return (
      <li
        ref={ref}
        onMouseDown={() => {
          if (internalActivity)
            selectHistory?.(ticketHistory.ticket_id, ticketHistory.id)
          // if (!ticketHistory.message_id) return;
          // if (isSelected) {
          //   handleSelectMessage?.(null);
          // } else handleSelectMessage?.(ticketHistory.message_id);
        }}
        onTouchStart={(e) => {
          e.stopPropagation()

          if (ticketHistory.message_id)
            handleFocusMessage?.(ticketHistory.message_id)
        }}
        onTouchEnd={(e) => {
          e.stopPropagation()

          if (ticketHistory.message_id) handleFocusMessage?.(null)
        }}
        onMouseEnter={() => {
          if (ticketHistory.message_id)
            handleFocusMessage?.(ticketHistory.message_id)
        }}
        onMouseLeave={() => {
          if (ticketHistory.message_id) handleFocusMessage?.(null)
        }}
        className={cn(
          "card-hover rounded-lg border border-border bg-card p-4 shadow-md",
          { "bg-secondary": isHistorySelected },
          className
        )}
        {...props}
      >
        {/* Header */}
        <div className="mb-2 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 ring-2 ring-background">
              <AvatarImage
                src={actorPic}
                alt={`${ticketHistory.actor?.name}`}
              />
              <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-foreground xs:text-sm">
                {ticketHistory.actor?.name || `User #${ticketHistory.actor_id}`}
              </span>
              <span
                className="cursor-help text-xs text-muted-foreground"
                title={fullDate}
              >
                {timeAgo}
              </span>
            </div>
          </div>
          <ActionBadge action={ticketHistory.action} />
        </div>

        {/* Message preview if available */}
        {ticketHistory.message_id && (
          <p className="mt-2 text-xs text-muted-foreground xs:text-sm">
            Message{" "}
            <span
              className="cursor-pointer transition-colors hover:text-primary"
              onClick={() => {
                if (!ticketHistory.message_id) return
                handleViewDetails?.(ticketId, ticketHistory.message_id)
              }}
            >
              #{ticketHistory.message_id}
            </span>{" "}
            attached
          </p>
        )}

        {/* Details */}
        <HistoryDetails
          ticketStatuses={ticketStatuses}
          ticketPriority={ticketPriorities}
          action={ticketHistory.action}
          details={ticketHistory.details}
        />

        {/* Ticket reference */}
        {ticketHistory.ticket_id && !internalActivity && (
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <p
              className="group text-xs text-muted-foreground hover:cursor-pointer"
              onClick={() => {
                handleViewDetails?.(ticketId)
              }}
            >
              Ticket{" "}
              <span className="transition-all group-hover:text-primary">
                #{ticketHistory.ticket_id}
              </span>
            </p>

            <button
              onClick={() => {
                selectHistory?.(ticketHistory.ticket_id, ticketHistory.id)
              }}
              className="group relative text-xs text-muted-foreground transition-all duration-300 focus-within:pr-5 focus-within:text-foreground hover:pr-5 hover:text-foreground"
            >
              Show History
              <MoveRight className="absolute top-1/2 right-3 h-3 w-3 -translate-y-1/2 opacity-0 transition-all delay-75 duration-300 group-focus-within:right-0 group-focus-within:opacity-100 group-hover:right-0 group-hover:opacity-100 group-hover:delay-0 3xl:h-4 3xl:w-4" />
            </button>
          </div>
        )}
      </li>
    )
  }
)

TicketHistory.displayName = "TicketHistory"
export default TicketHistory

interface HistoryDetailsProps {
  ticketStatuses: TicketStatusType[]
  ticketPriority: TicketPriority[]
  details: z.infer<typeof TicektHistoryDetials>
  action: z.infer<typeof TicketHistoryAction>
}

export function HistoryDetails({
  details,
  action,
  ticketPriority,
  ticketStatuses,
}: HistoryDetailsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!details || Object.keys(details).length === 0) {
    return null
  }

  const entries = Object.entries(details)
  const previewEntries = entries.slice(0, 2)
  const hasMore = entries.length > 2

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return "—"
    if (typeof value === "object") return JSON.stringify(value, null, 2)
    return String(value)
  }

  const formatKey = (key: string): string => {
    return key
      .replace(/_/g, " ")
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim()
  }

  const displayEntries = isExpanded ? entries : previewEntries

  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
      }}
      className="mt-3 space-y-2"
    >
      <div className="space-y-2 rounded-lg bg-muted/50 p-3">
        {displayEntries.map(([key, value]) => {
          const isStatusChange =
            key.toLowerCase() === "new_status" ||
            key.toLowerCase() === "old_status"
          // key.toLowerCase() === "ticket_status";
          return (
            <div
              key={key}
              className="flex items-start gap-2 text-xs xs:text-sm"
            >
              <span className="min-w-[50px] font-medium text-muted-foreground">
                {formatKey(key)}:
              </span>
              {isStatusChange ? (
                <TicketStatus ticketStatus={value} className="text-wrap" />
              ) : (
                <span className="break-all text-foreground">
                  {formatValue(value)}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {hasMore && (
        <button
          onMouseDown={(e) => {
            e.stopPropagation()
            setIsExpanded(!isExpanded)
          }}
          className="flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-3 w-3" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" />
              Show {entries.length - 2} more fields
            </>
          )}
        </button>
      )}
    </div>
  )
}
