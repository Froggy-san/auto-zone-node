import { cn } from "@/lib/utils"
import type { FulfillmentStatus } from "@/types/supplierInvoiceTypes"
import { CircleCheck, Clock4, ShelvingUnit } from "lucide-react"
import { HiMiniReceiptRefund } from "react-icons/hi2"
import { RiCircleLine, RiProgress4Line } from "react-icons/ri"

const SupplierStatusBadge = ({
  supplierStatus,
  className,
}: {
  supplierStatus: FulfillmentStatus
  className?: string
}) => {
  return (
    <div
      className={cn(
        "flex w-fit items-center justify-center gap-1 rounded-full bg-primary px-2.5 py-[0.15rem] text-center text-xs font-semibold text-wrap whitespace-nowrap text-primary-foreground transition-all select-none",

        {
          "bg-dashboard-blue text-dashboard-text-blue":
            supplierStatus.toLowerCase() === "pending",
          "bg-dashboard-orange text-dashboard-text-orange":
            supplierStatus.toLowerCase() === "partially-received",
          "bg-destructive/70 text-red-800 dark:text-red-200":
            supplierStatus.toLowerCase() === "canceled",
          "bg-dashboard-green text-dashboard-text-green":
            supplierStatus.toLowerCase() === "received",
          "bg-dashboard-indigo text-dashboard-text-indigo":
            supplierStatus.toLowerCase() === "returned",
        },
        className
      )}
    >
      {supplierStatus.toLocaleLowerCase() == "in progress" && (
        <RiProgress4Line className="h-4 w-4" />
      )}
      {supplierStatus.toLocaleLowerCase() == "pending" && (
        <Clock4 className="h-4 w-4" />
      )}
      {supplierStatus.toLocaleLowerCase() == "partially-received" && (
        <ShelvingUnit className="h-4 w-4" />
      )}
      {supplierStatus.toLocaleLowerCase() == "received" && (
        // <CircleCheckBig className=" w-4 h-4" />
        <CircleCheck className="h-4 w-4" />
      )}

      {supplierStatus.toLowerCase() === "returned" && (
        <HiMiniReceiptRefund className="h-4 w-4" />
      )}
      {supplierStatus.split("-").join(" ")}
    </div>
  )
}

export default SupplierStatusBadge
