import React, { useCallback, useEffect, type SetStateAction } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import Spinner from "@/components/Spinner"


import SuccessToastDescription, {
  ErorrToastDescription,
} from "@/components/toast-items"
import { useQueryClient } from "@tanstack/react-query"
import { useLocation, useNavigate, useSearchParams } from "react-router"
import { toast } from "sonner"
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
  navBack?: boolean
  imagesToDelete: string[]
  pageSize: number
  currPage: number
  productId: string | undefined
  setIsLoading?: React.Dispatch<SetStateAction<boolean>>
  isLoading?: boolean
  open: boolean
  setOpen: React.Dispatch<SetStateAction<boolean>>
}) => {
  const [searchParam] = useSearchParams()
  const navigate = useNavigate()
  const pathname = useLocation().pathname

  useEffect(() => {
    return () => {
      const body = document.querySelector("body")
      if (body) body.style.pointerEvents = "auto"
    }
  }, [open])

  const checkIfLastItem = useCallback(() => {
    const params = new URLSearchParams(searchParam)

    // if (navBack) navigate.back();
    if (pageSize === 1) {
      if (Number(currPage) === 1) {
        params.delete("categoryId")
        params.delete("productBrandId")
        params.delete("productTypeId")
        params.delete("name")
      }

      if (Number(currPage) > 1) {
        params.set("page", String(Number(currPage) - 1))
      }
    }

    if (navBack) {
      params.delete("size")
      navigate(`/products?${params.toString()}`, { replace: true })
    } else {
      navigate(`${pathname}?${params.toString()}`)
    }
  }, [productId, pageSize, navBack, pathname, navigate, searchParam])

  //   async function handleDelete() {
  //     try {
  //       setIsLoading?.(true);
  //       const { error } = await deleteProductsByIdAction(
  //         productId as number,
  //         imagesToDelete
  //       );
  //       if (error) throw new Error(error);
  //       setOpen(false);
  //       checkIfLastItem();

  // toast.success("Product deleted.")
  //       // toast({
  //       //   className: "bg-primary  text-primary-foreground",
  //       //   variant: "default",
  //       //   title: "Data deleted!.",
  //       //   description: <SuccessToastDescription message="Product deleted." />,
  //       // });
  //     } catch (error: any) {

  // toast.warning("Failed to delete product, Please try agian")
  //       // toast({
  //       //   variant: "destructive",
  //       //   title: "Something went wrong.",
  //       //   description: <ErorrToastDescription error={error.message} />,
  //       // });
  //     } finally {
  //       setIsLoading?.(false);
  //     }
  //   }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="border-none sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete this
            product and remove all data associated with it.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col-reverse items-center gap-2 sm:flex-row sm:justify-end">
          <Button
            onClick={() => setOpen(false)}
            type="reset"
            className="w-full sm:w-fit"
            variant="secondary"
            size="sm"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="w-full sm:w-fit"
            // onClick={handleDelete}
            type="submit"
            size="sm"
            disabled={isLoading}
          >
            {isLoading ? <Spinner /> : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteProductDialog
