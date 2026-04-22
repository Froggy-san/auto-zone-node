"use client";
import { Button } from "@components/ui/button";
import { TableCell, TableRow } from "@components/ui/table";
import { formatCurrency } from "@lib/client-helpers";
import useServicesStats from "@lib/queries/dashboard/home/useServicesStats";
import { cn } from "@lib/utils";
import { RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
type Params = {
  dateFrom?: string;
  dateTo?: string;
  clientId?: string;
  carId?: string;
  serviceStatusId?: string;
  minPrice?: string;
  maxPrice?: string;
};

const StatsRow = (filters: Params) => {
  const router = useRouter();
  const { data, isLoading, error } = useServicesStats(filters);

  const RefreshButton = (
    <Button size="sm" onClick={() => router.refresh()}>
      <span>Refresh</span> <RefreshCcw className=" w-4 h-4" />
    </Button>
  );

  if (error)
    return (
      <p className=" text-center text-xs ">
        {`${error}`} {RefreshButton}
      </p>
    );
  //   if (!data)
  //     return (
  //       <div className="flex items-center justify-center gap-2 flex-col ">
  //         <p className=" text-center text-xs "> Something went wrong</p>,{" "}
  //         {RefreshButton}
  //       </div>
  //     );

  //   const { totalProductsSold, totalServicesPerformed } = data;
  return (
    <TableRow
      className={cn(" bg-secondary hover:bg-secondary/50", {
        "animate-pulse": isLoading,
      })}
    >
      <TableCell colSpan={5}>Total:</TableCell>

      <TableCell className="   min-w-[100px] max-w-[120px]  break-all">
        {data
          ? formatCurrency(
              data.totalServicesPerformed.totalPrice -
                data.totalServicesPerformed.totalDiscount
            )
          : null}
      </TableCell>

      <TableCell className="   min-w-[100px] max-w-[120px]  break-all">
        {data
          ? formatCurrency(
              data.totalProductsSold.totalPrice -
                data.totalProductsSold.totalDiscount
            )
          : null}
      </TableCell>

      <TableCell
        colSpan={3}
        className=" text-right   min-w-[100px] max-w-[120px]  break-all"
      >
        {data
          ? formatCurrency(
              data.totalServicesPerformed.totalPrice -
                data.totalServicesPerformed.totalDiscount +
                data.totalProductsSold.totalPrice -
                data.totalProductsSold.totalDiscount
            )
          : null}
      </TableCell>
    </TableRow>
  );
};

export default StatsRow;
