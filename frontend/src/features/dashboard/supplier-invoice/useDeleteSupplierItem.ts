import { deleteSupplierInvoiceItem } from "@/services/supplierInvoiceApi"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export default function useDeleteSupplierItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteSupplierInvoiceItem,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["supplierInvoices"] })

      //   queryClient.invalidateQueries({
      //     queryKey: ["supplierInvoiceById", data._id],
      //   })
    },
    onError: (err) => {
      toast.error(err.message)
    },
  })
}
