import React, { useEffect, type SetStateAction } from "react"
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

import { deleteCar } from "@/services/carApi"
import { useQueryClient } from "@tanstack/react-query"

interface Props {
  checkIfLastItem: () => void
  carId: string
  setIsLoading?: React.Dispatch<SetStateAction<boolean>>
  isLoading?: boolean
  open: boolean
  setOpen: React.Dispatch<SetStateAction<boolean>>
  // imagePaths: string[]
  clientId: string
}

const CarDeleteDialog = ({
  checkIfLastItem,
  open,
  setOpen,
  carId,
  isLoading,
  setIsLoading,
  // imagePaths,
  clientId,
}: Props) => {
  const queryClient = useQueryClient()

  async function handleDelete() {
    try {
      setIsLoading?.(true)
      // const { error } = await deleteCarAction(clientId, carId, imagePaths)

      await deleteCar(carId)
      queryClient.invalidateQueries({ queryKey: ["cars"] })
      queryClient.removeQueries({ queryKey: ["carById", clientId] })
      checkIfLastItem()
      // queryClient.invalidateQueries({ queryKey: ["carCount"] });
      setOpen(false)
      setIsLoading?.(false)
      // toast({
      //   className: "bg-primary  text-primary-foreground",
      //   variant: "default",
      //   title: "Data deleted!.",
      //   description: (
      //     <SuccessToastDescription message="Car has been deleted." />
      //   ),
      // })
    } catch (error: any) {
      setIsLoading?.(false)
      // toast({
      //   variant: "destructive",
      //   title: "Something went wrong.",
      //   description: <ErorrToastDescription error={error.message} />,
      // })
    }
  }

  useEffect(() => {
    return () => {
      const body = document.querySelector("body")
      if (body) body.style.pointerEvents = "auto"
    }
  }, [open])
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="border-none sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete this
            car&apos;s data from the server.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-y-2">
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
  )
}

export default CarDeleteDialog
