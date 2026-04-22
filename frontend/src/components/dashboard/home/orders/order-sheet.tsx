"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

import { format } from "date-fns";
import { Package, User, Calendar, CreditCard } from "lucide-react";
import {
  formatCurrency,
  getDiscountAmount,
  getInitials,
} from "@lib/client-helpers";
import { CartItem, Order } from "@lib/types";
import { cn } from "@lib/utils";
import PaymentStatus from "./payment-status-badge";
import OrderStatus from "./order-order-status";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import Link from "next/link";
import { useMemo } from "react";

export function OrderDetailsSheet({
  order,
  open,
  onOpenChange,
}: {
  order?: Order;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  //   if (!order) return null;
  const formatNumber = (value: number) =>
    new Intl.NumberFormat("en", { style: "decimal" }).format(value);
  const client = order?.client;
  const phoneNumbers = client?.phoneNumbers;
  const clientInputedData = order?.customer_details;
  const totalDiscount = useMemo(() => {
    if (!order || !order.items) return 0;
    const totalDiscount = order.items.items.reduce(
      (acc: number, curr: CartItem) => {
        const savingsPerItem = curr.listPrice - curr.salePrice;
        return acc + curr.quantity * savingsPerItem;
      },
      0,
    );

    return totalDiscount;
  }, [order]);

  function MetadataDisplay({ data }: { data: any }) {
    if (!data || typeof data !== "object") return null;

    // Filter out internal fields you don't want to show the customer
    const entries = Object.entries(data).filter(
      ([key]) => !key.startsWith("_"),
    );

    if (entries.length === 0) return null;

    return (
      <div className="mt-1 space-y-1">
        {entries.map(([key, value]) => (
          <p
            key={key}
            className="text-[10px] uppercase tracking-wider text-muted-foreground"
          >
            <span className="font-semibold">{key.replace("_", " ")}:</span>{" "}
            {String(value)}
          </p>
        ))}
      </div>
    );
  }
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            Order #{order?.id.toString().slice(-5)}
          </SheetTitle>
          <SheetDescription>
            Placed on {order && format(new Date(order?.created_at), "PPP p")}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
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
            <h4 className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4" /> Customer Details
            </h4>
            <div className="text-sm pl-6 text-muted-foreground">
              <p className="font-medium text-foreground">
                {client ? "Registered" : "Guest"}
              </p>

              {client?.picture && (
                <Avatar className=" w-7 h-7">
                  <AvatarImage src={client.picture} />
                  <AvatarFallback>
                    {getInitials(client.name)}
                  </AvatarFallback>{" "}
                </Avatar>
              )}
              <p>{client ? client.name : clientInputedData?.full_name}</p>
              <p
                className={cn("", { " text-green-700": phoneNumbers?.length })}
              >
                {clientInputedData?.phone}
              </p>

              {phoneNumbers?.length ? (
                <ul className=" p-3 rounded-lg bg-accent/50">
                  <h3 className=" text-md font-serif">Other Phone Numbers</h3>
                  {phoneNumbers.map((phone, i) => (
                    <li key={i}>{phone}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>

          {/* <Separator /> */}

          {/* Items List */}
          <div className="space-y-3 ">
            <h4 className="text-sm font-medium flex items-center gap-2">
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
                        getDiscountAmount(item.listPrice, item.salePrice),
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
          <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm shadow-md">
            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-3 w-3" /> Pickup Date:
              </span>
              <span>
                {order?.pickupDate
                  ? format(new Date(order?.pickupDate), "PP")
                  : "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center gap-2">
                <CreditCard className="h-3 w-3" /> Method:
              </span>
              <span className="uppercase">{order?.payment_method}</span>
            </div>
            {order?.stripe_payment_id && (
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <CreditCard className="h-3 w-3" /> Stripe Id:
                </span>
                <span className="uppercase">{order?.stripe_payment_id}</span>
              </div>
            )}
            <div className=" font-bold text-base pt-2 border-t space-y-1">
              <div className=" flex items-center justify-between text-sm">
                {" "}
                <span>Total Discount</span>
                <span>{formatCurrency(totalDiscount)}</span>
              </div>
              <div className=" flex items-center justify-between">
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
              <div className="border  p-3 rounded-md text-sm ">
                <MetadataDisplay data={order.metadata} />
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
