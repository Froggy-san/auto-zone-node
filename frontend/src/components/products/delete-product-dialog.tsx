import React, { SetStateAction, useCallback, useEffect } from "react";
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
import { deleteProductsByIdAction } from "@lib/actions/productsActions";
import { useToast } from "@hooks/use-toast";
import SuccessToastDescription, {
  ErorrToastDescription,
} from "@components/toast-items";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
const DeleteProductDialog = ({
  navBack,
  open,
  imagesToDelete,
  setOpen,
  productId,
  isLoading,
  setIsLoading,
  pageSize,
  currPage,
}: {
  navBack?: boolean;
  imagesToDelete: string[];
  pageSize: number;
  currPage: number;
  productId: number | undefined;
  setIsLoading?: React.Dispatch<SetStateAction<boolean>>;
  isLoading?: boolean;
  open: boolean;
  setOpen: React.Dispatch<SetStateAction<boolean>>;
}) => {
  const { toast } = useToast();
  const searchParam = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    return () => {
      const body = document.querySelector("body");
      if (body) body.style.pointerEvents = "auto";
    };
  }, [open]);

  const checkIfLastItem = useCallback(() => {
    const params = new URLSearchParams(searchParam);

    // if (navBack) router.back();
    if (pageSize === 1) {
      if (Number(currPage) === 1) {
        params.delete("categoryId");
        params.delete("productBrandId");
        params.delete("productTypeId");
        params.delete("name");
      }

      if (Number(currPage) > 1) {
        params.set("page", String(Number(currPage) - 1));
      }
    }

    if (navBack) {
      params.delete("size");
      router.replace(`/products?${params.toString()}`);
    } else {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [productId, pageSize, navBack, pathname, router, searchParam]);

  async function handleDelete() {
    try {
      setIsLoading?.(true);
      const { error } = await deleteProductsByIdAction(
        productId as number,
        imagesToDelete
      );
      if (error) throw new Error(error);
      setOpen(false);
      checkIfLastItem();
      toast({
        className: "bg-primary  text-primary-foreground",
        variant: "default",
        title: "Data deleted!.",
        description: <SuccessToastDescription message="Product deleted." />,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Something went wrong.",
        description: <ErorrToastDescription error={error.message} />,
      });
    } finally {
      setIsLoading?.(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px] border-none">
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete this
            product and remove all data associated with it.
          </DialogDescription>
        </DialogHeader>

        <div className=" flex items-center flex-col-reverse  sm:flex-row sm:justify-end gap-2">
          <Button
            onClick={() => setOpen(false)}
            type="reset"
            className=" w-full sm:w-fit"
            variant="secondary"
            size="sm"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            className=" w-full sm:w-fit"
            onClick={handleDelete}
            type="submit"
            size="sm"
            disabled={isLoading}
          >
            {isLoading ? <Spinner /> : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteProductDialog;
