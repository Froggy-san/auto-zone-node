import { updateSupplierInvoice } from "@/services/supplierInvoiceApi"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export default function useCreateSupplierInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateSupplierInvoice,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["infiniteProducts"] })
      queryClient.invalidateQueries({ queryKey: ["supplierInvoices"] })
      queryClient.invalidateQueries({
        queryKey: ["supplierInvoiceById", data._id],
      })
    },
    onError: (err) => {
      toast.error(err.message)
    },
  })
}
