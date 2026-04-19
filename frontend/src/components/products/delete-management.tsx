"use client";
import { Button } from "@components/ui/button";
import { cn } from "@lib/utils";
import React, { useState } from "react";
import DeleteProductDialog from "./delete-product-dialog";
interface Props {
  pageSize: number;
  currPage: number;
  productId: number | undefined;
  className?: string;
  imagesToDelete: string[];
}
const DeleteManagement = ({
  pageSize,
  currPage,
  productId,
  className,
  imagesToDelete,
}: Props) => {
  const [isLoading, setIsloading] = useState(false);
  const [open, setOpen] = useState(false);
  return (
    <>
      <div
        className={cn(
          "flex  flex-col   w-full gap-y-2 xs:flex-row xs:items-center justify-between rounded-lg border p-3 shadow-sm gap-x-7",
          className
        )}
      >
        <div className="space-y-0.5   ">
          <label className=" font-semibold">Delete</label>
          <p className=" text-muted-foreground text-sm">
            Delete this product along side all it&apos;s associated data.
          </p>
        </div>
        <div className=" sm:pr-2">
          <Button
            className=" w-full sm:w-fit"
            variant="destructive"
            size="sm"
            onClick={() => setOpen((is) => !is)}
          >
            DELETE
          </Button>
        </div>
      </div>
      <DeleteProductDialog
        navBack
        open={open}
        setOpen={setOpen}
        imagesToDelete={imagesToDelete}
        isLoading={isLoading}
        setIsLoading={setIsloading}
        pageSize={pageSize}
        currPage={currPage}
        productId={productId}
      />
    </>
  );
};

export default DeleteManagement;
