"use client";
import React, { useRef } from "react";

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
import TodayOrder from "./today-order";
import CancelOrderDialog from "./cancel-order-dia";
import CompleteOrderDialog from "./complete-order-dia";
interface OrdersTableProps {
  clientId?: number;
}
const PAYMENT_MTHOD: z.infer<typeof PaymentMethod>[] = ["card", "cod"];
type OrderDialogType = "cancel" | "refund" | "complete" | "details";
type SelectedOrderType = { order: Order; dialogType: OrderDialogType } | null;
const TodayOrders = () => {
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<SelectedOrderType>(null);
  const [selectedClient, setSelectedClient] = useState<null | Client>(null);
  const [isLoadingArr, setisLoadingArr] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [createdAtDate, setCreatedAtDate] = useState<DateRange | undefined>(
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
  const toDayDate = useRef<Date>(new Date());
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    error,
    status,
  } = useInfiniteOrders({
    isToday: true,
    sort: sortBy,
    searchTerm: debouncedValue,
    paymentMethod:
      selectedMethodInx !== null ? PAYMENT_MTHOD[selectedMethodInx] : undefined,

    createdAt: { from: createdFrom, to: createdTo },
    pickupDate: {
      from: String(toDayDate.current),
      to: String(toDayDate.current),
    },
    clientId: selectedClient?.id,
  });

  const orders = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) || [];
  }, [data?.pages]);

  const revlaidteOrders = (newOrder: Order) => {
    revalidateOrdersCache(newOrder, queryClient, true);
  };
  const isInitialLoading = !orders.length && isFetching;

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [inView, hasNextPage, isFetchingNextPage]);

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
    <div className="   my-20  ">
      <h3 className="   text-lg sm:text-3xl font-semibold  my-10">
        Today&apos;s Orders
      </h3>

      <OrderFilters
        isToday
        selectedMethodIndx={selectedMethodInx}
        setSelectedMethodIndx={setSelectedMethodInx}
        searchTerm={searchTerm}
        setSearchterm={setSearchTerm}
        sortBy={sortBy}
        setSortBy={setSortBy}
        createdAtDate={createdAtDate}
        setCreatedAtDate={setCreatedAtDate}
        selectedClient={selectedClient}
        setSelectedClient={setSelectedClient}
      />
      <div className="  max-h-[75vh] py-4 px-2 sm:px-3 overflow-y-auto">
        {!isInitialLoading && !orders.length ? (
          <h4 className=" font-semibold text-center py-4  ">No Activities</h4>
        ) : (
          <>
            <ul className=" grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {orders.map((order) => (
                <TodayOrder
                  key={order.id}
                  order={order}
                  selectedOrder={selectedOrder}
                  setSelectedOrder={setSelectedOrder}
                  isLoading={isLoadingArr.includes(order.id)}
                  setIsLoadingArr={setisLoadingArr}
                />
              ))}
            </ul>
            <div ref={ref} className="text-center py-4 text-muted-foreground">
              {isFetchingNextPage || isInitialLoading ? (
                <div className=" flex  gap-3 items-center justify-center">
                  <Spinner className=" static w-4 h-4" /> Loading...
                </div>
              ) : (
                "No more orders"
              )}
            </div>
          </>
        )}
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
          selectedOrder ? isLoadingArr.includes(selectedOrder.order.id) : false
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
          selectedOrder ? isLoadingArr.includes(selectedOrder.order.id) : false
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
  );
};

export default TodayOrders;
