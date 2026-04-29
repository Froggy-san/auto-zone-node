import { updateProduct } from "@/services/productApi"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams } from "react-router"

export default function useEditProduct() {
  const queryClient = useQueryClient()
  const { id } = useParams()
  const {
    mutateAsync: editProduct,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product", id] })
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })
  return {
    editProduct,
    isPending,
    isError,
    error,
  }
}
