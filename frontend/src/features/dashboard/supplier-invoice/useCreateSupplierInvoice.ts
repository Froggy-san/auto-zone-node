import { createSupplierInvoice } from "@/services/supplierInvoiceApi"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export default function useCreateSupplierInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createSupplierInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["infiniteProducts"] })
      queryClient.invalidateQueries({ queryKey: ["supplierInvoices"] })
    },
    onError: (err) => {
      toast.error(err.message)
    },
  })
}
