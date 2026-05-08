import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import React, { useState } from "react"
import DeleteProductDialog from "./delete-product-dialog"
interface Props {
  pageSize: number
  currPage: number
  productId: string | undefined
  className?: string
  imagesToDelete: string[]
}
const DeleteManagement = ({
  pageSize,
  currPage,
  productId,
  className,
  imagesToDelete,
}: Props) => {
  const [isLoading, setIsloading] = useState(false)
  const [open, setOpen] = useState(false)
  return (
    <>
      <div
        className={cn(
          "flex w-full flex-col justify-between gap-x-7 gap-y-2 rounded-lg border p-3 shadow-sm xs:flex-row xs:items-center",
          className
        )}
      >
        <div className="space-y-0.5 text-center xs:text-left">
          <label className="font-semibold">Delete</label>
          <p className="text-sm text-muted-foreground">
            Delete this product along side all it&apos;s associated data.
          </p>
        </div>
        <div className="sm:pr-2">
          <Button
            className="w-full sm:w-fit"
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
  )
}

export default DeleteManagement
