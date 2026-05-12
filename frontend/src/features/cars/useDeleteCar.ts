import { deleteCar as deleteCarApi } from "@/services/carApi"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router"
import { toast } from "sonner"

export default function useDeleteCar() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { mutate: deleteCar, isPending: isLoading } = useMutation({
    mutationFn: deleteCarApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cars"] })

      toast.success("Car deleted")
      navigate(-1)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  return { deleteCar, isLoading }
}
