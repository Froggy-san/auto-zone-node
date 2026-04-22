import { Card } from "@components/ui/card";
import { CartItem, Order } from "@lib/types";
import React, { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCurrency, getInitials } from "@lib/client-helpers";
import { formatDate, formatDistanceToNow } from "date-fns";
import PaymentStatus from "./payment-status-badge";
import OrderStatus from "./order-order-status";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { CheckCircle2, Download, XCircle } from "lucide-react";
import OrderReceiptPDF from "@components/success/OrderReceiptPDF";
import { pdf } from "@react-pdf/renderer";
type OrderDialogType = "cancel" | "refund" | "complete" | "details";
type SelectedOrderType = { order: Order; dialogType: OrderDialogType } | null;
interface TodayOrder {
  order: Order;
  selectedOrder: SelectedOrderType;
  setSelectedOrder: (open: SelectedOrderType) => void;
  isLoading: boolean;
  setIsLoadingArr: React.Dispatch<React.SetStateAction<number[]>>;
}

const TodayOrder = ({
  order,
  selectedOrder,
  setSelectedOrder,
  isLoading,
}: TodayOrder) => {
  const client = order.client;
  const inputedClientData = order.customer_details;
  const clientName = client?.name || inputedClientData.name;
  const timeAgo = formatDistanceToNow(new Date(order.created_at), {
    addSuffix: true,
  });
  const fullDate = formatDate(
    new Date(order.created_at),
    "MMM d, yyyy 'at' h:mm a",
  );

  const totalDiscount = useMemo(() => {
    if (!order.items) return 0;

    return order.items.items.reduce((acc: number, curr: CartItem) => {
      const diffInPrice = curr.listPrice - curr.salePrice;

      return (acc += curr.quantity * diffInPrice);
    }, 0);
  }, [order]);
  return (
    <Card
      onClick={() => {
        setSelectedOrder({ order, dialogType: "details" });
      }}
      className=" p-3  flex flex-col gap-5 !rounded-2xl"
    >
      <div className=" w-full flex   items-start gap-5 justify-between">
        <div className=" flex items-center gap-3">
          <Avatar className="h-8 w-8 ring-2 ring-background">
            <AvatarImage
              src={client?.picture || undefined}
              alt={`${clientName}`}
            />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
              {getInitials(clientName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className=" text-xs xs:text-sm font-semibold text-foreground">
              {clientName || `User #${client?.id}`}
            </span>
            <span
              className="text-xs text-muted-foreground cursor-help"
              title={fullDate}
            >
              {timeAgo}
            </span>
          </div>
        </div>
        <Badge
          variant={order.client ? "secondary" : "outline"}
          className="  font-thin"
        >
          {order.client ? "Registered" : "Guest"}
        </Badge>
      </div>

      {/* <div className=" flex items-center gap-2"> */}
      <section className=" space-y-2">
        <div className=" text-xs">
          <span className="  text-muted-foreground">ID</span>
          <span className="  text-xs"> #{order.id}</span>
        </div>
        <div className="  flex items-center gap-2">
          <span className=" text-xs text-muted-foreground">Payment Status</span>{" "}
          <PaymentStatus status={order.payment_status} />
        </div>
        <div className="  flex items-center gap-2">
          <span className=" text-xs text-muted-foreground">Order Status</span>{" "}
          <OrderStatus status={order.order_status} />
        </div>

        <div className="   text-xs flex items-center gap-2">
          <span className=" text-muted-foreground">Method</span>{" "}
          {order.payment_method.toUpperCase()}
        </div>

        {order.stripe_payment_id && (
          <div className="  flex items-center gap-2">
            <span className=" text-xs text-muted-foreground">Stripe Id</span>{" "}
            {order.stripe_payment_id}
          </div>
        )}

        {order.order_fulfilled_at && (
          <div className="  flex items-center gap-2">
            <span className=" text-xs text-muted-foreground">Stripe Id</span>{" "}
            {formatDate(
              new Date(order.order_fulfilled_at),
              "MMM d, yyyy 'at' h:mm a",
            )}
          </div>
        )}
      </section>

      <div className="  border-t pt-2">
        <div className="  flex text-sm items-center gap-2 justify-between">
          <span className=" ">Total Discount</span>{" "}
          <span className=" text-sm text-muted-foreground">
            {formatCurrency(totalDiscount)}
          </span>
        </div>
        <div className="  flex text-sm items-center gap-2 justify-between">
          <span className=" ">Total Price</span>{" "}
          <span className=" text-sm mt-2">
            {formatCurrency(order.total_amount)}
          </span>
        </div>
      </div>

      <div
        onClick={(e) => e.stopPropagation()}
        className="  border-t pt-2 flex flex-col-reverse mt-auto  gap-2 "
      >
        <Button
          disabled={isLoading}
          onClick={() => setSelectedOrder({ order, dialogType: "cancel" })}
          variant="destructive"
          size="sm"
          className=" w-full !py-1 h-fit"
        >
          <XCircle className="mr-2 h-4 w-4" /> Cancel & Restock
        </Button>
        <Button
          disabled={isLoading}
          variant="secondary"
          onClick={async () => {
            if (!order) return;
            const blob = await pdf(<OrderReceiptPDF order={order} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `order-${order?.id}-receipt.pdf`;
            link.click();
            URL.revokeObjectURL(url);
          }}
          size="sm"
          className=" w-full !py-1 h-fit"
        >
          {" "}
          <Download className="mr-2 h-4 w-4" /> Download
        </Button>
        {order.payment_status !== "paid" ||
        order.order_status !== "completed" ? (
          <Button
            disabled={isLoading}
            onClick={() => setSelectedOrder({ order, dialogType: "complete" })}
            size="sm"
            className=" w-full !py-1 h-fit"
          >
            {" "}
            <CheckCircle2 className="mr-2 h-4 w-4" /> Complete Pickup
          </Button>
        ) : null}
      </div>
      {/* </div> */}
    </Card>
  );
};

export default TodayOrder;
