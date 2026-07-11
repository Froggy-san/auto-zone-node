import { getSupplierInvoicesById } from "@/services/supplierInvoiceApi"
import { useQuery } from "@tanstack/react-query"

export default function useSupplierInvoiceById(id?: string | null) {
  return useQuery({
    queryFn: () => getSupplierInvoicesById(id || ""),
    queryKey: ["supplierInvoiceById", id],
    enabled: !!id,
  })
}
