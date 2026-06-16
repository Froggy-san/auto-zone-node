import { Button } from "@/components/ui/button"
import { TableCell, TableRow } from "@/components/ui/table"
import useServicesStats from "@/features/services/useServicesStats"
import { formatCurrency } from "@/lib/client-helpers"

import { cn } from "@/lib/utils"
import { RefreshCcw } from "lucide-react"

import React from "react"
import { useNavigate } from "react-router"
type Params = {
  dateFrom?: string
  dateTo?: string
  clientId?: string
  carId?: string
  serviceStatusId?: string
  minPrice?: string
  maxPrice?: string
}

const StatsRow = (filters: Params) => {
  const navigate = useNavigate()
  const { data, isLoading, error } = useServicesStats()
  console.log(data)
  const RefreshButton = (
    <Button size="sm" onClick={() => navigate(0)}>
      <span>Refresh</span> <RefreshCcw className="h-4 w-4" />
    </Button>
  )

  if (error)
    return (
      <p className="text-center text-xs">
        {`${error}`} {RefreshButton}
      </p>
    )
  //   if (!data)
  //     return (
  //       <div className="flex items-center justify-center gap-2 flex-col ">
  //         <p className=" text-center text-xs "> Something went wrong</p>,{" "}
  //         {RefreshButton}
  //       </div>
  //     );

  //   const { totalProductsSold, totalServicesPerformed } = data;
  return (
    <>
      <TableRow
        className={cn("bg-secondary hover:bg-secondary/50", {
          "animate-pulse": isLoading,
        })}
      >
        <TableCell colSpan={8}>Total:</TableCell>

        <TableCell className="max-w-[120px] min-w-[100px] break-all">
          {data ? formatCurrency(data.grandFees) : null}
        </TableCell>

        <TableCell className="max-w-[120px] min-w-[100px] break-all">
          {data ? formatCurrency(data.grandProductsSold) : null}
        </TableCell>

        <TableCell
          colSpan={3}
          className="max-w-[120px] min-w-[100px] text-right break-all"
        >
          {data ? formatCurrency(data.totalGrand) : null}
        </TableCell>
      </TableRow>

      <TableRow
        className={cn("bg-destructive text-white hover:bg-destructive/85", {
          "animate-pulse": isLoading,
        })}
      >
        <TableCell colSpan={8}>Losses:</TableCell>

        <TableCell className="max-w-[120px] min-w-[100px] break-all">
          {data
            ? formatCurrency(data.grandLossFromFeesReturnedOrCancelled)
            : null}
        </TableCell>

        <TableCell className="max-w-[120px] min-w-[100px] break-all">
          {data
            ? formatCurrency(data.grandLossFromProductsReturnedOrCancelled)
            : null}
        </TableCell>

        <TableCell
          colSpan={3}
          className="max-w-[120px] min-w-[100px] text-right break-all"
        >
          {data
            ? formatCurrency(
                data.grandLossFromProductsReturnedOrCancelled +
                  data.grandLossFromFeesReturnedOrCancelled
              )
            : null}
        </TableCell>
      </TableRow>
    </>
  )
}

export default StatsRow
