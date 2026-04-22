"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

import { useInView } from "react-intersection-observer";
import { useCallback, useEffect, useMemo, useState } from "react";
import { format, isThisYear } from "date-fns";
import useInfiniteOrders from "@lib/queries/useInfiniteOrders";

import PaymentStatus from "./payment-status-badge";
import OrderStatus from "./order-order-status";
import Spinner from "@components/Spinner";
import { formatCurrency, getInitials, sleep } from "@lib/client-helpers";
import { Client, Order, PaymentMethod } from "@lib/types";
import { Button } from "@components/ui/button";
import {
  Banknote,
  CheckCircle2,
  Download,
  Ellipsis,
  PackageCheck,
  XCircle,
} from "lucide-react";
import {
  refundOrderAction,
  updateOrderAction,
} from "@lib/actions/orderActions";
import { adjustProductsStockAction } from "@lib/actions/productsActions";
import { Label } from "@components/ui/label";
import { Checkbox } from "@components/ui/checkbox";
import { ErorrToastDescription } from "@components/toast-items";
import { useToast } from "@hooks/use-toast";
import { OrderDetailsSheet } from "./order-sheet";
import useUpdateOrderStatus from "@lib/queries/useUpdateOrder";
import { revalidateOrdersCache } from "@lib/services/orders";
import { useQueryClient } from "@tanstack/react-query";
import OrderFilters from "./order-filters";
import useDebounce from "@hooks/use-debounce";
import { DateRange } from "react-day-picker";
import { z } from "zod";
import CompleteOrderDialog from "./complete-order-dia";
import CancelOrderDialog from "./cancel-order-dia";
import { pdf } from "@react-pdf/renderer";
import OrderReceiptPDF from "@components/success/OrderReceiptPDF";

interface OrdersTableProps {
  clientId?: number;
}
const PAYMENT_MTHOD: z.infer<typeof PaymentMethod>[] = ["card", "cod"];
type OrderDialogType = "cancel" | "refund" | "complete" | "details";
type SelectedOrderType = { order: Order; dialogType: OrderDialogType } | null;
export default function OrdersTable({ clientId }: OrdersTableProps) {
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<SelectedOrderType>(null);
  const [selectedClient, setSelectedClient] = useState<null | Client>(null);
  const [isLoadingArr, setisLoadingArr] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [createdAtDate, setCreatedAtDate] = useState<DateRange | undefined>(
    undefined,
  );
  const [pickupDate, setPickupDate] = useState<DateRange | undefined>(
    undefined,
  );
  const [selectedMethodInx, setSelectedMethodInx] = useState<number | null>(
    null,
  );
  const [sortBy, setSortBy] = useState<"asc" | "desc" | string>("desc");

  const debouncedValue = useDebounce(searchTerm, 500);
  const { ref, inView } = useInView();

  // We need to do this because sending Date objects might be casuing error.
  const createdFrom = createdAtDate?.from ? String(createdAtDate.from) : "";
  const createdTo = createdAtDate?.to ? String(createdAtDate.to) : "";
  const pickupFrom = pickupDate?.from ? String(pickupDate.from) : "";
  const pickupTo = pickupDate?.to ? String(pickupDate.to) : "";
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteOrders({
      sort: sortBy,
      searchTerm: debouncedValue,
      paymentMethod:
        selectedMethodInx !== null
          ? PAYMENT_MTHOD[selectedMethodInx]
          : undefined,
      createdAt: { from: createdFrom, to: createdTo },

      pickupDate: { from: pickupFrom, to: pickupTo },
      clientId: clientId || selectedClient?.id,
    });

  const orders = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) || [];
  }, [data]);

  const revlaidteOrders = (newOrder: Order) => {
    revalidateOrdersCache(newOrder, queryClient);
  };

  useEffect(() => {
    if (inView && hasNextPage) fetchNextPage();
  }, [inView, hasNextPage]);

  useEffect(() => {
    const body = document.querySelector("body");

    if (body) {
      body.style.pointerEvents = "auto";
    }
    return () => {
      if (body) body.style.pointerEvents = "auto";
    };
  }, [selectedOrder]);

  return (
    <div className=" space-y-6 mt-11">
      <h3 className="   text-lg sm:text-3xl font-semibold  my-10">Orders</h3>
      <OrderFilters
        selectedMethodIndx={selectedMethodInx}
        setSelectedMethodIndx={setSelectedMethodInx}
        searchTerm={searchTerm}
        setSearchterm={setSearchTerm}
        sortBy={sortBy}
        setSortBy={setSortBy}
        createdAtDate={createdAtDate}
        pickupDate={pickupDate}
        setPickupDate={setPickupDate}
        setCreatedAtDate={setCreatedAtDate}
        selectedClient={selectedClient}
        setSelectedClient={setSelectedClient}
      />
      {!orders.length && status === "loading" ? (
        <div className=" flex  items-center text-muted-foreground justify-center gap-2">
          <Spinner className=" static w-10 h-10" />{" "}
          <span className="text-sm">Loading orders...</span>
        </div>
      ) : (
        <div className="rounded-md shadow-md my-20 border max-h-[600px] overflow-y-auto relative p-4">
          {/* 2. Inner Wrapper: Handles the Width (Horizontal Scroll) */}
          <div className="min-w-full inline-block ">
            <Table className=" text-nowrap  min-w-[800px] ">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ORDER ID</TableHead>
                  <TableHead>DATE</TableHead>
                  <TableHead>CLIENT</TableHead>
                  <TableHead>IS REGISTERED</TableHead>
                  <TableHead>PAYMENT</TableHead>
                  <TableHead>ORDER STATUS</TableHead>
                  <TableHead>METHOD</TableHead>
                  <TableHead>STRIPE ID</TableHead>
                  <TableHead>PICK-UP DATE</TableHead>
                  <TableHead>FULFILLED AT</TableHead>

                  <TableHead className="text-right">TOTAL</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {orders.map((order: Order) => (
                  <Row
                    key={order.id}
                    order={order}
                    selectedOrder={selectedOrder}
                    setSelected={setSelectedOrder}
                    isLoading={isLoadingArr.includes(order.id)}
                    setIsLoadingArr={setisLoadingArr}
                  />
                ))}

                {/* Intersection Observer Trigger */}
                <TableRow ref={ref}>
                  <TableCell
                    colSpan={11}
                    className="text-center py-4 text-muted-foreground"
                  >
                    {isFetchingNextPage ? (
                      <div className=" flex  gap-3 items-center justify-center">
                        <Spinner className=" static w-4 h-4" /> Loading...
                      </div>
                    ) : (
                      "No more orders"
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <OrderDetailsSheet
            order={selectedOrder?.order}
            open={selectedOrder?.dialogType === "details"}
            onOpenChange={() => setSelectedOrder(null)}
          />
          <CancelOrderDialog
            revalidateOrders={revlaidteOrders}
            open={selectedOrder?.dialogType === "cancel"}
            isLoading={
              selectedOrder
                ? isLoadingArr.includes(selectedOrder.order.id)
                : false
            }
            setIsLoadingArr={setisLoadingArr}
            setOpen={() =>
              setSelectedOrder((prevSelected) => {
                const isToClose =
                  prevSelected?.order.id === selectedOrder?.order.id &&
                  prevSelected?.dialogType === selectedOrder?.dialogType;

                return isToClose ? null : prevSelected;
              })
            }
            order={selectedOrder?.order}
          />

          <CompleteOrderDialog
            open={selectedOrder?.dialogType === "complete"}
            revalidateOrders={revlaidteOrders}
            isLoading={
              selectedOrder
                ? isLoadingArr.includes(selectedOrder.order.id)
                : false
            }
            setIsLoadingArr={setisLoadingArr}
            setOpen={() =>
              setSelectedOrder((prevSelected) => {
                const isToClose =
                  prevSelected?.order.id === selectedOrder?.order.id &&
                  prevSelected?.dialogType === selectedOrder?.dialogType;

                return isToClose ? null : prevSelected;
              })
            }
            order={selectedOrder?.order}
          />
        </div>
      )}
    </div>
  );
}

interface RowProps {
  order: Order;
  selectedOrder?: SelectedOrderType;
  setSelected: React.Dispatch<React.SetStateAction<SelectedOrderType>>;
  isLoading: boolean;
  setIsLoadingArr: React.Dispatch<React.SetStateAction<number[]>>;
}

function Row({
  order,
  isLoading,
  selectedOrder,
  setSelected,
  setIsLoadingArr,
}: RowProps) {
  const { isPending, updateOrder } = useUpdateOrderStatus();
  const noShowComplete = [
    "completed",
    "refunded",
    "cancelled",
    "disputed",
    "returned",
  ];
  const noShowCompleteBtn =
    !noShowComplete.includes(order.order_status) &&
    !noShowComplete.includes(order.payment_status);

  const showCancelBtn =
    order.order_status !== "cancelled" && order.order_status !== "returned";

  const disabledActions =
    isLoading ||
    isPending ||
    (order.order_status !== "pending_arrival" &&
      order.order_status !== "ready_for_pickup" &&
      noShowCompleteBtn == false &&
      !showCancelBtn);
  return (
    <TableRow
      key={order.id}
      onClick={() => setSelected({ order, dialogType: "details" })}
    >
      <TableCell className="font-medium">
        #{order.id.toString().slice(-5)}
      </TableCell>
      <TableCell>{format(new Date(order.created_at), "dd MMM yyyy")}</TableCell>
      <TableCell>
        <div className=" flex items-center gap-2">
          {" "}
          {order.client ? (
            <>
              {order.client.picture && (
                <Avatar className=" w-7 h-7">
                  <AvatarImage src={order.client.picture} />
                  <AvatarFallback>
                    {getInitials(order.client.name)}
                  </AvatarFallback>{" "}
                </Avatar>
              )}
              <span>{order.client.name}</span>
            </>
          ) : (
            order.customer_details.name
          )}
        </div>
      </TableCell>
      <TableCell>
        <Badge
          variant={order.client ? "secondary" : "outline"}
          className="  font-thin"
        >
          {order.client ? "Registered" : "Guest"}
        </Badge>
      </TableCell>
      <TableCell>
        <PaymentStatus status={order.payment_status} />
      </TableCell>
      <TableCell>
        <OrderStatus status={order.order_status} />
        {/* <Badge variant="outline" className="capitalize">
                    {order.order_status.replace("_", " ")}
                  </Badge> */}
      </TableCell>
      <TableCell className="uppercase text-xs font-semibold">
        {order.payment_method}
      </TableCell>
      <TableCell>
        <span> {order.stripe_payment_id ? order.stripe_payment_id : "—"}</span>
      </TableCell>
      <TableCell>
        {order.pickupDate
          ? format(
              new Date(order.pickupDate),
              isThisYear(new Date(order.pickupDate))
                ? "dd MMM p"
                : "dd MMM yyyy",
            )
          : "—"}
      </TableCell>
      <TableCell>
        {order.order_fulfilled_at
          ? format(
              new Date(order.order_fulfilled_at),
              isThisYear(new Date(order.order_fulfilled_at))
                ? "dd MMM p"
                : "dd MMM yyyy",
            )
          : "—"}
      </TableCell>
      <TableCell className="text-right font-bold">
        <div className=" flex   items-center justify-end gap-3">
          <span> {formatCurrency(order.total_amount)}</span>
          {isLoading ? (
            <Spinner className=" static w-4 h-4" />
          ) : (
            <div onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    disabled={disabledActions}
                    variant="outline"
                    size="icon"
                    className="     p-0 h-6 w-6"
                  >
                    <Ellipsis className=" w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Manage Order</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={async () => {
                      if (!order) return;
                      const blob = await pdf(
                        <OrderReceiptPDF order={order} />,
                      ).toBlob();
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = `order-${order?.id}-receipt.pdf`;
                      link.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download as pdf
                  </DropdownMenuItem>
                  {/* PRIMARY ACTIONS */}
                  {order.order_status === "pending_arrival" && (
                    <DropdownMenuItem
                      onClick={async () => {
                        await updateOrder({
                          id: order.id,
                          updates: "ready_for_pickup",
                        });
                      }}
                      // onClick={() => handleUpdate({ order_status: "ready_for_pickup" })}
                    >
                      <PackageCheck className="mr-2 h-4 w-4" />
                      Mark as Ready for Pickup
                    </DropdownMenuItem>
                  )}

                  {noShowCompleteBtn && (
                    <DropdownMenuItem
                      onClick={() =>
                        setSelected({ order, dialogType: "complete" })
                      }
                      // onClick={() => handleUpdate({
                      //   order_status: "completed",
                      //   payment_status: "paid" // Force paid if they are taking it
                      // })}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />{" "}
                      Complete Pickup
                    </DropdownMenuItem>
                  )}

                  {/* PAYMENT ACTIONS */}
                  {/* {order.payment_status === "unpaid" && (
                    <DropdownMenuItem
                    //  onClick={() => handleUpdate({ payment_status: "paid" })}
                    >
                      <Banknote className="mr-2 h-4 w-4" /> Receive Cash (Paid)
                    </DropdownMenuItem>
                  )} */}

                  <DropdownMenuSeparator />

                  {/* DANGER ZONE */}
                  {showCancelBtn && (
                    <DropdownMenuItem
                      className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                      onClick={() =>
                        setSelected({ order, dialogType: "cancel" })
                      }
                    >
                      <XCircle className="mr-2 h-4 w-4" /> Cancel & Restock
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

interface CancelOrderDialogProps {
  open: boolean;
  setOpen: () => void;
  setIsLoading?: (id: number | null) => void;
  isLoading: boolean;
  order: Order;
}
