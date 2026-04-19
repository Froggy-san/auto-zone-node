import React, { SetStateAction, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import Spinner from "@components/Spinner";
import { useToast } from "@hooks/use-toast";
import SuccessToastDescription, {
  ErorrToastDescription,
} from "@components/toast-items";
import { deleteCarAction } from "@lib/actions/carsAction";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  checkIfLastItem: () => void;
  carId: number;
  setIsLoading?: React.Dispatch<SetStateAction<boolean>>;
  isLoading?: boolean;
  open: boolean;
  setOpen: React.Dispatch<SetStateAction<boolean>>;
  imagePaths: string[];
  clientId: number;
}

const CarDeleteDialog = ({
  checkIfLastItem,
  open,
  setOpen,
  imagePaths,
  carId,
  isLoading,
  setIsLoading,
  clientId,
}: Props) => {
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      const body = document.querySelector("body");
      if (body) body.style.pointerEvents = "auto";
    };
  }, [open]);

  async function handleDelete() {
    try {
      setIsLoading?.(true);
      const { error } = await deleteCarAction(clientId, carId, imagePaths);
      if (error) throw new Error(error);
      checkIfLastItem();
      // queryClient.invalidateQueries({ queryKey: ["carCount"] });
      setOpen(false);
      setIsLoading?.(false);
      toast({
        className: "bg-primary  text-primary-foreground",
        variant: "default",
        title: "Data deleted!.",
        description: (
          <SuccessToastDescription message="Car has been deleted." />
        ),
      });
    } catch (error: any) {
      setIsLoading?.(false);
      toast({
        variant: "destructive",
        title: "Something went wrong.",
        description: <ErorrToastDescription error={error.message} />,
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px] border-none">
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete this
            car&apos;s data from the server.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className=" gap-y-2 ">
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
};

export default CarDeleteDialog;
