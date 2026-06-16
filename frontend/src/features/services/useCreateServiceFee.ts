import { deleteProductSold } from "@/services/prodcutSoldApi"
import { createServiceFee } from "@/services/serviceFeesApi"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export default function useCreateServiceFee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createServiceFee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] })
      queryClient.invalidateQueries({ queryKey: ["services-stats"] })
    },
  })
}
