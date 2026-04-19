"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Spinner from "@components/Spinner";
import { useToast } from "@hooks/use-toast";
import { deleteCarAction } from "@lib/actions/carsAction";
import SuccessToastDescription, {
  ErorrToastDescription,
} from "@components/toast-items";
import { useRouter } from "next/navigation";
import { cn } from "@lib/utils";
const DeleteCar = ({
  carId,
  clientId,
  imagePaths,
  className,
}: {
  carId: number;
  clientId: number;
  imagePaths: string[];
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "flex  flex-col w-full  gap-y-2 xs:flex-row xs:items-center justify-between rounded-lg border p-3 shadow-sm gap-x-7",
        className
      )}
    >
      <div className="space-y-0.5   ">
        <label className=" font-semibold">Products</label>
        <p className=" text-muted-foreground text-sm">Delete car.</p>
      </div>
      <div className=" sm:pr-2">
        <DeleteDialog
          carId={carId}
          clientId={clientId}
          imagePaths={imagePaths}
        />
      </div>
    </div>
  );
};

function DeleteDialog({
  carId,
  clientId,
  imagePaths,
}: {
  carId: number;
  clientId: number;
  imagePaths: string[];
}) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  async function handleDelete() {
    try {
      if (!carId) return;
      setIsLoading(true);
      await deleteCarAction(clientId, carId, imagePaths);
      router.back();
      //   checkIfLastItem();
      //   queryClient.invalidateQueries({ queryKey: ["carCount"] });
      setOpen(false);

      toast({
        className: "bg-primary  text-primary-foreground",
        variant: "default",
        title: "Data deleted!.",
        description: <SuccessToastDescription message="Car has been deleted" />,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Something went wrong.",
        description: <ErorrToastDescription error={error.message} />,
      });
    }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="destructive" className="  w-full">
          {isLoading ? <Spinner className=" h-full" size={12} /> : "Delete"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] border-none">
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete this
            car&apos;s data from the server.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className=" gap-y-2">
          <Button
            onClick={() => setOpen(false)}
            type="reset"
            variant="secondary"
            size="sm"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            type="submit"
            size="sm"
            disabled={isLoading}
          >
            {isLoading ? <Spinner /> : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteCar;
