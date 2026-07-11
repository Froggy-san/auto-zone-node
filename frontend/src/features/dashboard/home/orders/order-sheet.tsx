import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"

import { format } from "date-fns"
import { Package, User, Calendar, CreditCard } from "lucide-react"
import {
  formatCurrency,
  getDiscountAmount,
  getInitials,
} from "@lib/client-helpers"
import { CartItem, Order } from "@lib/types"
import { cn } from "@lib/utils"
import PaymentStatus from "./payment-status-badge"
import OrderStatus from "./order-order-status"
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar"
import Link from "next/link"
import { useMemo } from "react"

export function OrderDetailsSheet({
  order,
  open,
  onOpenChange,
}: {
  order?: Order
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  //   if (!order) return null;
  const formatNumber = (value: number) =>
    new Intl.NumberFormat("en", { style: "decimal" }).format(value)
  const client = order?.client
  const phoneNumbers = client?.phoneNumbers
  const clientInputedData = order?.customer_details
  const totalDiscount = useMemo(() => {
    if (!order || !order.items) return 0
    const totalDiscount = order.items.items.reduce(
      (acc: number, curr: CartItem) => {
        const savingsPerItem = curr.listPrice - curr.salePrice
        return acc + curr.quantity * savingsPerItem
      },
      0
    )

    return totalDiscount
  }, [order])

  function MetadataDisplay({ data }: { data: any }) {
    if (!data || typeof data !== "object") return null

    // Filter out internal fields you don't want to show the customer
    const entries = Object.entries(data).filter(([key]) => !key.startsWith("_"))

    if (entries.length === 0) return null

    return (
      <div className="mt-1 space-y-1">
        {entries.map(([key, value]) => (
          <p
            key={key}
            className="text-[10px] tracking-wider text-muted-foreground uppercase"
          >
            <span className="font-semibold">{key.replace("_", " ")}:</span>{" "}
            {String(value)}
          </p>
        ))}
      </div>
    )
  }
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            Order #{order?.id.toString().slice(-5)}
          </SheetTitle>
          <SheetDescription>
            Placed on {order && format(new Date(order?.created_at), "PPP p")}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Status Badges */}
          <div className="flex gap-2">
            {order && (
              <>
                {" "}
                <PaymentStatus status={order?.payment_status} />{" "}
                <OrderStatus status={order?.order_status} />
              </>
            )}
          </div>

          {/* Customer Info */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-medium">
              <User className="h-4 w-4" /> Customer Details
            </h4>
            <div className="pl-6 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">
                {client ? "Registered" : "Guest"}
              </p>

              {client?.picture && (
                <Avatar className="h-7 w-7">
                  <AvatarImage src={client.picture} />
                  <AvatarFallback>
                    {getInitials(client.name)}
                  </AvatarFallback>{" "}
                </Avatar>
              )}
              <p>{client ? client.name : clientInputedData?.full_name}</p>
              <p className={cn("", { "text-green-700": phoneNumbers?.length })}>
                {clientInputedData?.phone}
              </p>

              {phoneNumbers?.length ? (
                <ul className="rounded-lg bg-accent/50 p-3">
                  <h3 className="text-md font-serif">Other Phone Numbers</h3>
                  {phoneNumbers.map((phone, i) => (
                    <li key={i}>{phone}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>

          {/* <Separator /> */}

          {/* Items List */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-medium">
              <Package className="h-4 w-4" /> Items
            </h4>
            <div className="space-y-4 pl-6">
              {order?.items?.items.map((item: CartItem, idx: number) => (
                <div key={idx} className="flex justify-between text-sm">
                  <div>
                    <Link
                      href={`products/${item.id}`}
                      className="font-medium hover:underline"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      Qty: {item.quantity} ({formatNumber(item.listPrice)} -{" "}
                      {formatNumber(
                        getDiscountAmount(item.listPrice, item.salePrice)
                      )}
                      )
                    </p>
                  </div>
                  <p>{formatCurrency(item.salePrice * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* <Separator /> */}

          {/* Pickup/Payment Info */}
          <div className="space-y-2 rounded-lg bg-muted/50 p-4 text-sm shadow-md">
            <div className="flex justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-3 w-3" /> Pickup Date:
              </span>
              <span>
                {order?.pickupDate
                  ? format(new Date(order?.pickupDate), "PP")
                  : "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <CreditCard className="h-3 w-3" /> Method:
              </span>
              <span className="uppercase">{order?.payment_method}</span>
            </div>
            {order?.stripe_payment_id && (
              <div className="flex justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <CreditCard className="h-3 w-3" /> Stripe Id:
                </span>
                <span className="uppercase">{order?.stripe_payment_id}</span>
              </div>
            )}
            <div className="space-y-1 border-t pt-2 text-base font-bold">
              <div className="flex items-center justify-between text-sm">
                {" "}
                <span>Total Discount</span>
                <span>{formatCurrency(totalDiscount)}</span>
              </div>
              <div className="flex items-center justify-between">
                {" "}
                <span>Total Amount</span>
                <span>
                  {order?.total_amount && formatCurrency(order.total_amount)}
                </span>
              </div>
            </div>
          </div>
          {order?.metadata && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Order Notes / Metadata</h4>
              <div className="rounded-md border p-3 text-sm">
                <MetadataDisplay data={order.metadata} />
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
