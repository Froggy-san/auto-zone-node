import { Order } from "@lib/types";
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
import { Button } from "@components/ui/button";
import Spinner from "@components/Spinner";
import { formatCurrency } from "@lib/client-helpers";
import { Checkbox } from "@components/ui/checkbox";
import { Label } from "@components/ui/label";
import { ErorrToastDescription } from "@components/toast-items";
import {
  refundOrderAction,
  updateOrderAction,
} from "@lib/actions/orderActions";
import { useToast } from "@hooks/use-toast";
import { useCallback, useEffect, useState } from "react";

interface CancelOrderDialogProps {
  open: boolean;
  setOpen: () => void;
  isLoading: boolean;
  setIsLoadingArr: React.Dispatch<React.SetStateAction<number[]>>;
  order?: Order;
  revalidateOrders: (newOrder: Order) => void;
}
function CompleteOrderDialog({
  order,
  setOpen,
  open,
  setIsLoadingArr,
  isLoading,
  revalidateOrders,
}: CancelOrderDialogProps) {
  const { toast } = useToast();
  const [isChecked, setIsChecked] = useState(false);
  const handleCancelOrder = useCallback(async () => {
    try {
      if (!order) throw new Error("No order selected");
      setIsLoadingArr((prevArr) => [...prevArr, order.id]);
      const { data, error } = await updateOrderAction({
        id: order.id,
        order_fulfilled_at: new Date().toISOString(),
        payment_status: "paid",
        order_status: "completed",
      });

      if (error) throw new Error(error);
      if (data) revalidateOrders(data!);
    } catch (error: any) {
      console.error("Error cancelling order:", error.message);
      toast({
        variant: "destructive",
        title: "Faild to delete Service data",
        description: <ErorrToastDescription error={error.message} />,
      });
    } finally {
      if (order)
        setIsLoadingArr((prevArr) => prevArr.filter((id) => id !== order.id));
      setOpen();
    }
  }, [order, setIsLoadingArr, setOpen, toast, isChecked]);

  useEffect(() => {
    setIsChecked(false);
  }, [open]);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className=" max-w-screen-md p-0">
        <DialogHeader className="  pb-2 pt-4  px-5 border-b">
          <DialogTitle>
            You are about to mark order #{order?.id} as completed
          </DialogTitle>
          <DialogDescription className=" text-primary">
            You are about to mark this order as{" "}
            <em className=" font-semibold">completed</em>. Please make sure that
            all the items are received before continuting.
          </DialogDescription>
        </DialogHeader>
        <section className=" px-5 overflow-y-auto max-h-[60vh]">
          <div className=" space-y-6 ">
            <h3 className=" font-semibold sm:text-lg text-md">
              Ordered items:
            </h3>
            {order?.items?.items.map((item: any, index: number) => {
              const originalTotal = item.listPrice * item.quantity;
              const discountTotal = item.salePrice * item.quantity;
              const finalTotal = originalTotal - discountTotal;

              return (
                <div
                  key={index}
                  className="flex justify-between gap-2 items-start  "
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full shrink-0 bg-muted flex items-center justify-center text-xs font-medium mt-0.5">
                      {item.quantity}
                    </span>
                    <div>
                      <span className="text-foreground text-sm sm:text-base">
                        {item.name}
                      </span>
                      <div className="text-xs  text-muted-foreground">
                        {formatCurrency(item.listPrice)} each
                        {item.salePrice > 0 && (
                          <span className="ml-2 text-green-500">
                            (-
                            {formatCurrency(
                              item.listPrice - item.salePrice,
                            )}{" "}
                            discount)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex flex-col sm:flex-row items-center ">
                    {item.salePrice > 0 ? (
                      <>
                        {/* <span className="text-muted-foreground line-through text-xs sm:text-sm">
                        {formatCurrency(originalTotal)}
                      </span> */}
                        <span className="ml-2 text-foreground text-sm font-medium">
                          {formatCurrency(discountTotal)}
                        </span>
                      </>
                    ) : (
                      <span className="text-foreground text-sm">
                        {formatCurrency(finalTotal)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className=" mt-10">
            <Label className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950">
              <Checkbox
                id="toggle-2"
                // defaultChecked
                onClick={() => setIsChecked((is) => !is)}
                className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
              />
              <div className="grid gap-1.5 font-normal">
                <p className="text-sm leading-none font-medium">
                  Mark as checked to confirm you want to complete this order.
                </p>
                <p className="text-muted-foreground text-sm">
                  The current admin should check the order details before
                  confirming.
                </p>
              </div>
            </Label>
          </div>
        </section>
        <DialogFooter className="   border-t  pt-2 pb-4 gap-y-2  px-5">
          <DialogClose asChild>
            <Button type="button" size="sm" variant="secondary">
              Close
            </Button>
          </DialogClose>
          <Button
            disabled={isLoading || !isChecked}
            onClick={handleCancelOrder}
            size="sm"
          >
            {isLoading && <Spinner className=" static w-4 h-4" />}{" "}
            <span>Continue</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CompleteOrderDialog;
