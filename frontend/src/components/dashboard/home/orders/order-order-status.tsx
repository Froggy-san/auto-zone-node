"use client";
import { OrderStatusSchema, PaymentStatusSchema } from "@lib/types";
import { cn } from "@lib/utils";
import { BsExclamationDiamond } from "react-icons/bs";
import {
  TbCreditCardOff,
  TbCreditCardPay,
  TbCreditCardRefund,
} from "react-icons/tb";
import { z } from "zod";

const orderStatusConfig: Record<
  z.infer<typeof OrderStatusSchema>,
  {
    label: string;
    icon?: React.ElementType;
    bgClass: string;
    textClass: string;
  }
> = {
  completed: {
    label: "Completed",
    // icon: TbCreditCardPay,
    bgClass: "bg-dashboard-green",
    textClass: "text-dashboard-text-green",
  },
  cancelled: {
    label: "Cancelled",
    // icon: TbCreditCardOff,
    bgClass: " bg-destructive/70",
    textClass: "text-red-800  dark:text-red-200 ",
    // bgClass: "bg-action-updated/15",
    // textClass: "text-action-updated",
  },

  pending_arrival: {
    label: "Pending Arrival",
    bgClass: "bg-dashboard-orange",
    textClass: "text-dashboard-text-orange",
    // icon: TbCreditCardRefund,
    // bgClass: "bg-action-resolved/15",
    // textClass: "text-action-resolved",
  },
  returned: {
    label: "Returned",
    bgClass: "bg-dashboard-indigo",
    textClass: "text-dashboard-text-indigo",
    // icon: TbCreditCardRefund,
    // bgClass: "bg-action-resolved/15",
    // textClass: "text-action-resolved",
  },
  partially_completed: {
    label: "Partially Completed",
    bgClass: "bg-dashboard-green",
    textClass: "text-dashboard-text-green",
    // icon: TbCreditCardRefund,
    // bgClass: "bg-action-resolved/15",
    // textClass: "text-action-resolved",
  },
  //   cancelled: {
  //     label: "Cancelled",
  //     // icon: XCircle,
  //     bgClass: "bg-action-closed/15",
  //     textClass: "text-action-closed",
  //   },
  ready_for_pickup: {
    label: "Ready for Pickup",
    // icon: BsExclamationDiamond,
    bgClass: "bg-dashboard-blue",
    textClass: "text-dashboard-text-blue",
  },
  processing: {
    label: "Processing",
    // icon: BsExclamationDiamond,
    bgClass: "bg-action-reopened/15",
    textClass: "text-action-reopened",
  },

  //   pending_arrival: {
  //     label: "Pending Arrival",
  //     // icon: AlertTriangle,
  //     bgClass: "bg-action-escalated/15",
  //     textClass: "text-action-escalated",
  //   },
  // "message deleted": {
  //   label: "Message Deleted",
  //   icon: MessageSquareOff,
  //   bgClass: "bg-action-escalated/15",
  //   textClass: "text-action-escalated",
  // },
  // assigned: {
  //   label: "Assigned",
  //   icon: UserPlus,
  //   bgClass: "bg-action-assigned/15",
  //   textClass: "text-action-assigned",
  // },
  // reassigned: {
  //   label: "Re-Assigned",
  //   icon: UserRoundPen,
  //   bgClass: "bg-action-assigned/15",
  //   textClass: "text-action-assigned",
  // },
  // message: {
  //   label: "Message",
  //   icon: MessageSquare,
  //   bgClass: "bg-action-message/15",
  //   textClass: "text-action-message",
  //   // "bg-dashboard-indigo",
  //   //  "text-dashboard-text-indigo",
  // },
  // "message edited": {
  //   label: "Message Edited",
  //   icon: MessageSquareDashed,
  //   bgClass: "bg-action-message/15",
  //   // "bg-dashboard-indigo",
  //   textClass: "text-action-message",
  //   //  "text-dashboard-text-indigo",
  // },

  // comment: {
  //   label: "Comment",
  //   icon: MessageSquare,
  //   bgClass: "bg-secondary",
  //   // "bg-action-message/15",
  //   textClass: "",
  //   // "text-action-message",
  // },
  // "Internal Note": {
  //   label: "Internal Note",
  //   icon: MessageSquare,
  //   bgClass: "bg-secondary",
  //   // "bg-action-message/15",
  //   textClass: "",
  //   // "text-action-message",
  // },
  // "Internal Note Edited": {
  //   label: "Internal Note Edited",
  //   icon: MessageSquare,
  //   bgClass: "bg-secondary",
  //   // "bg-action-message/15",
  //   textClass: "",
  //   // "text-action-message",
  // },
  // "Status Changed": {
  //   label: "Status Changed",
  //   icon: Replace,
  //   bgClass: "bg-action-reopened/15",
  //   textClass: "text-action-reopened",
  //   // bgClass: "bg-action-message/15",
  //   // textClass: "text-action-message",
  // },
  // "Priority Changed": {
  //   label: "Comment",
  //   icon: MessageSquare,
  //   bgClass: "bg-action-message/15",
  //   textClass: "text-action-message",
  // },
  // "System Auto-Closed": {
  //   label: "Comment",
  //   icon: MessageSquare,
  //   bgClass: "bg-action-message/15",
  //   textClass: "text-action-message",
  // },
};

function OrderStatus({
  status,
  className,
}: {
  status: z.infer<typeof OrderStatusSchema>;
  className?: string;
}) {
  const config = orderStatusConfig[status] || orderStatusConfig.pending_arrival;
  const Icon = config?.icon;

  return (
    <span
      className={cn(
        " inline-flex items-center px-2.5 py-0.5 capitalize rounded-full text-xs font-medium gap-1.5",
        config.bgClass,
        config.textClass,
        className,
      )}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {config.label.replace("_", " ")}
    </span>
  );
}
export default OrderStatus;
