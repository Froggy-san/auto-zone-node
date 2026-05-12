import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Spinner from "@/components/Spinner"
import { useToast } from "@/hooks/use-toast"

import SuccessToastDescription, {
  ErorrToastDescription,
} from "@/components/toast-items"

import { cn } from "@/lib/utils"
import { useNavigate } from "react-router"
import useDeleteCar from "@/features/cars/useDeleteCar"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { deleteCar } from "@/services/carApi"
const DeleteCar = ({
  carId,
  className,
}: {
  carId: string
  className?: string
}) => {
  return (
    <div
      className={cn(
        "flex w-full flex-col justify-between gap-x-7 gap-y-2 rounded-lg border p-3 shadow-sm xs:flex-row xs:items-center",
        className
      )}
    >
      <div className="space-y-0.5">
        <label className="font-semibold">Delte</label>
        <p className="text-sm text-muted-foreground">Delete car.</p>
      </div>
      <div className="sm:pr-2">
        <DeleteDialog carId={carId} />
      </div>
    </div>
  )
}

function DeleteDialog({ carId }: { carId: string }) {
  const [open, setOpen] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const queryClient = useQueryClient()
  // const { toast } = useToast()
  const navigate = useNavigate()
  async function handleDelete() {
    try {
      if (!carId) return
      setIsLoading(true)
      await deleteCar(carId)
      // await deleteCarAction(clientId, carId, imagePaths)
      navigate(-1)
      //   checkIfLastItem();
      queryClient.invalidateQueries({ queryKey: ["cars"] })
      queryClient.removeQueries({ queryKey: ["carById", carId] })
      setOpen(false)

      toast.success("Deleted car successfuly")

      // toast({
      //   className: "bg-primary  text-primary-foreground",
      //   variant: "default",
      //   title: "Data deleted!.",
      //   description: <SuccessToastDescription message="Car has been deleted" />,
      // })
    } catch (error: any) {
      toast.error("Failed to delete car")
      // toast({
      //   variant: "destructive",
      //   title: "Something went wrong.",
      //   description: <ErorrToastDescription error={error.message} />,
      // })
    }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="destructive" className="w-full">
          {isLoading ? <Spinner className="h-full" size={12} /> : "Delete"}
        </Button>
      </DialogTrigger>
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

export default DeleteCar
