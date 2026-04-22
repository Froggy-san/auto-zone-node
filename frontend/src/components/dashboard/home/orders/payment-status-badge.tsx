"use client";
import { PaymentStatusSchema } from "@lib/types";
import { cn } from "@lib/utils";
import { BsExclamationDiamond } from "react-icons/bs";
import {
  TbCreditCardOff,
  TbCreditCardPay,
  TbCreditCardRefund,
} from "react-icons/tb";
import { z } from "zod";

const paymentStatusConfig: Record<
  z.infer<typeof PaymentStatusSchema>,
  {
    label: string;
    icon?: React.ElementType;
    bgClass: string;
    textClass: string;
  }
> = {
  paid: {
    label: "Paid",
    icon: TbCreditCardPay,
    bgClass: "bg-action-created/15",
    textClass: "text-action-created",
  },
  unpaid: {
    label: "Unpaid",
    icon: TbCreditCardOff,
    bgClass: "bg-action-escalated/15",
    textClass: "text-action-escalated",
    // bgClass: "bg-action-updated/15",
    // textClass: "text-action-updated",
  },
  refunded: {
    label: "Refunded",
    bgClass: "bg-action-reopened/15",
    textClass: "text-action-reopened",
    icon: TbCreditCardRefund,
    // bgClass: "bg-action-resolved/15",
    // textClass: "text-action-resolved",
  },
  canceled: {
    label: "Canceled",
    // icon: XCircle,
    bgClass: "bg-action-closed/15",
    textClass: "text-action-closed",
  },
  disputed: {
    label: "Disputed",
    icon: BsExclamationDiamond,
    bgClass: "bg-action-reopened/15",
    textClass: "text-action-reopened",
  },
  pending_arrival: {
    label: "Pending Arrival",
    // icon: AlertTriangle,
    bgClass: "bg-action-escalated/15",
    textClass: "text-action-escalated",
  },
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

function PaymentStatus({
  status,
  className,
}: {
  status: z.infer<typeof PaymentStatusSchema>;
  className?: string;
}) {
  const config = paymentStatusConfig[status] || paymentStatusConfig.unpaid;
  const Icon = config?.icon;

  return (
    <span
      className={cn(
        " inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium gap-1.5",
        config.bgClass,
        config.textClass,
        className,
      )}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {config.label}
    </span>
  );
}
export default PaymentStatus;
