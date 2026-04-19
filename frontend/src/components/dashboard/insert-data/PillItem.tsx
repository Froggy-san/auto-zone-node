"use client";

import Spinner from "@components/Spinner";
import React, { SetStateAction, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@hooks/use-toast";
import { Category } from "@lib/types";
import SuccessToastDescription, {
  ErorrToastDescription,
} from "@components/toast-items";
import { Cross2Icon } from "@radix-ui/react-icons";
import TextInputSwitch from "@components/text-input-switch";
import { deleteCategoryAction } from "@lib/actions/categoriesAction";
import { deleteProductTypeAction } from "@lib/actions/productTypeActions";
import { deleteProductBrandAction } from "@lib/actions/productBrandsActions";
type ItemType = "category" | "productType" | "productBrand";
const PillITem = ({
  item,
  itemType,
  handleResetPage,
}: {
  itemType: ItemType;
  handleResetPage: () => void;
  item: Category;
}) => {
  const [loading, setLoading] = useState(false);
  return (
    <li className=" w-full max-w-full  xs:w-fit px-3 py-2 flex items-center gap-2   text-sm border rounded-lg">
      <TextInputSwitch
        item={item}
        ItemType={itemType}
        isLoading={loading}
        setLoading={setLoading}
      />
      <div className=" flex items-center  gap-2">
        {loading ? (
          <Spinner className=" h-full ml-auto" size={10} />
        ) : (
          <DeleteBtn
            itemType={itemType}
            isDeleting={loading}
            setIsDeleting={setLoading}
            handleResetPage={handleResetPage}
            item={item}
          />
        )}
      </div>
    </li>
  );
};

function DeleteBtn({
  item,
  isDeleting,
  setIsDeleting,
  handleResetPage,
  itemType,
}: {
  itemType: ItemType;
  handleResetPage: () => void;
  isDeleting: boolean;
  setIsDeleting: React.Dispatch<SetStateAction<boolean>>;
  item: Category;
}) {
  const { toast } = useToast();
  // const { deleteCargeneration, isDeleting } = useDeleteCarGenerations();

  const [open, setOpen] = useState(false);

  const handleDelete = useCallback(async () => {
    try {
      setIsDeleting(true);
      if (itemType === "category") {
        const data = await deleteCategoryAction(item.id);
        if (data?.error) throw new Error(data.error);
      }

      if (itemType === "productType") {
        const data = await deleteProductTypeAction(item.id);
        if (data?.error) throw new Error(data.error);
      }

      if (itemType === "productBrand") {
        const data = await deleteProductBrandAction(item.id);
        if (data?.error) throw new Error(data.error);
      }
      setOpen(false);
      handleResetPage();

      toast({
        className: "bg-primary  text-primary-foreground",
        title: "Data deleted.",
        description: (
          <SuccessToastDescription
            message={`${
              itemType === "category"
                ? "Category"
                : itemType === "productBrand"
                ? "Product brand"
                : "Product type"
            } has been deleted.`}
          />
        ),
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Something went wrong.",
        description: <ErorrToastDescription error={error.message} />,
      });
    } finally {
      setIsDeleting(false);
    }
  }, [item]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="  rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground  -mr-1">
          {isDeleting ? (
            <Spinner className=" h-full" size={14} />
          ) : (
            <Cross2Icon className="h-4 w-4" />
          )}
          {/* <span className="sr-only">Close</span> */}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] border-none">
        <DialogHeader>
          <DialogTitle>
            Delete{" "}
            {itemType === "category"
              ? "Category"
              : itemType === "productBrand"
              ? "Product brand"
              : "Product Type"}{" "}
            &apos;{item.name}&apos;
          </DialogTitle>
          <DialogDescription>
            This action can&apos;t be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="   gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button size="sm" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            size="sm"
            onClick={async () => handleDelete()}
          >
            {isDeleting ? <Spinner className=" h-full" /> : "Confrim"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default PillITem;
