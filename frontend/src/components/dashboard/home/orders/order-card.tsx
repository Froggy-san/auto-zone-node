import { format } from "date-fns"; // Recommended for easy date formatting
import { Badge } from "@/components/ui/badge"; // Or your custom Badge component
import { Order } from "@lib/types";

export function OrderCard({ order }: { order: Order }) {
  // Logic for color coding statuses

  return (
    <div className=" flex items-center gap-5 text-sm">
      <span>#{order.id}</span>{" "}
      <div>{format(new Date(order.created_at), "MMM dd, yyyy • p")}</div>{" "}
      <div>{order.payment_method.toUpperCase()}</div>
    </div>
  );
}
