import { cn } from "@/lib/utils";
import { TicketHistoryAction } from "@lib/types";
import {
  Plus,
  Pencil,
  CheckCircle2,
  XCircle,
  RotateCcw,
  AlertTriangle,
  UserPlus,
  MessageSquare,
  UserRoundPen,
  MessageSquareOff,
  MessageSquareDashed,
  Replace,
} from "lucide-react";
import { TbStatusChange } from "react-icons/tb";
import { z } from "zod";

type ActionType = z.infer<typeof TicketHistoryAction>;

interface ActionBadgeProps {
  action: ActionType;
  className?: string;
}

const actionConfig: Record<
  ActionType,
  {
    label: string;
    icon: React.ElementType;
    bgClass: string;
    textClass: string;
  }
> = {
  created: {
    label: "Created",
    icon: Plus,
    bgClass: "bg-action-created/15",
    textClass: "text-action-created",
  },
  updated: {
    label: "Updated",
    icon: Pencil,
    bgClass: "bg-action-updated/15",
    textClass: "text-action-updated",
  },
  solved: {
    label: "Solved",
    icon: CheckCircle2,
    bgClass: "bg-action-resolved/15",
    textClass: "text-action-resolved",
  },
  closed: {
    label: "Closed",
    icon: XCircle,
    bgClass: "bg-action-closed/15",
    textClass: "text-action-closed",
  },
  reopened: {
    label: "Reopened",
    icon: RotateCcw,
    bgClass: "bg-action-reopened/15",
    textClass: "text-action-reopened",
  },
  escalated: {
    label: "Escalated",
    icon: AlertTriangle,
    bgClass: "bg-action-escalated/15",
    textClass: "text-action-escalated",
  },
  "message deleted": {
    label: "Message Deleted",
    icon: MessageSquareOff,
    bgClass: "bg-action-escalated/15",
    textClass: "text-action-escalated",
  },
  assigned: {
    label: "Assigned",
    icon: UserPlus,
    bgClass: "bg-action-assigned/15",
    textClass: "text-action-assigned",
  },
  reassigned: {
    label: "Re-Assigned",
    icon: UserRoundPen,
    bgClass: "bg-action-assigned/15",
    textClass: "text-action-assigned",
  },
  message: {
    label: "Message",
    icon: MessageSquare,
    bgClass: "bg-action-message/15",
    // "bg-dashboard-indigo",
    textClass: "text-action-message",
    //  "text-dashboard-text-indigo",
  },
  "message edited": {
    label: "Message Edited",
    icon: MessageSquareDashed,
    bgClass: "bg-action-message/15",
    // "bg-dashboard-indigo",
    textClass: "text-action-message",
    //  "text-dashboard-text-indigo",
  },

  comment: {
    label: "Comment",
    icon: MessageSquare,
    bgClass: "bg-secondary",
    // "bg-action-message/15",
    textClass: "",
    // "text-action-message",
  },
  "Internal Note": {
    label: "Internal Note",
    icon: MessageSquare,
    bgClass: "bg-secondary",
    // "bg-action-message/15",
    textClass: "",
    // "text-action-message",
  },
  "Internal Note Edited": {
    label: "Internal Note Edited",
    icon: MessageSquare,
    bgClass: "bg-secondary",
    // "bg-action-message/15",
    textClass: "",
    // "text-action-message",
  },
  "Status Changed": {
    label: "Status Changed",
    icon: Replace,
    bgClass: "bg-action-reopened/15",
    textClass: "text-action-reopened",
    // bgClass: "bg-action-message/15",
    // textClass: "text-action-message",
  },
  "Priority Changed": {
    label: "Comment",
    icon: MessageSquare,
    bgClass: "bg-action-message/15",
    textClass: "text-action-message",
  },
  "System Auto-Closed": {
    label: "Comment",
    icon: MessageSquare,
    bgClass: "bg-action-message/15",
    textClass: "text-action-message",
  },
};

export function ActionBadge({ action, className }: ActionBadgeProps) {
  const config = actionConfig[action] || actionConfig.updated;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        " inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium gap-1.5",
        config.bgClass,
        config.textClass,
        className
      )}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}
