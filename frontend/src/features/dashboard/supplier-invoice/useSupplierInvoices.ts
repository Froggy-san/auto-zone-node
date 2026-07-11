import { getSupplierInvoices } from "@/services/supplierInvoiceApi"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

interface SupplierFilters {
  page?: string
  limit?: string
  createdBy?: string
  invoiceNumber?: string
  supplierName?: string
  items?: string
  subTotal?: number
  totalTax?: number
  totalDiscount?: number
  grandTotal?: number
  amountPaid?: number
  fulfillmentStatus?: string
  paymentStatus?: string
  notes?: string
  dateTo?: string
  dateFrom?: string
  minPrice?: string
  maxPrice?: string
  productId?: string
  productName?: string

  isReturned?: boolean
  fulfilledAt?: string
}

export default function useSupplierInvoices(filters: SupplierFilters) {
  const appliedFilters = useMemo(() => {
    if (!filters) return {}
    const filterObj: Record<string, any> = {
      page: filters.page,
      limit: filters.limit,
      createdBy: filters.createdBy,
      invoiceNumber: filters.invoiceNumber,
      supplierName: filters.supplierName,
      items: filters.items,
      subTotal: filters.subTotal,
      totalTax: filters.totalTax,
      totalDiscount: filters.totalDiscount,
      amountPaid: filters.amountPaid,
      fulfillmentStatus: filters.fulfillmentStatus,
      isReturned: filters.isReturned,
      fulfilledAt: filters.fulfilledAt ? new Date(filters.fulfilledAt) : null,
    }
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom)
      filterObj.serviceDate = { $gte: fromDate }
      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo)
        toDate.setHours(23, 59, 59, 999)

        filterObj.serviceDate.$lte = toDate
      }
    }
    // if (filters.dateTo) filterObj.serviceDate = { $lte: filters.dateTo }
    if (filters.minPrice || filters.maxPrice)
      filterObj.grandTotal = {
        $gte: filters.minPrice ? Number(filters.minPrice) : undefined,
        $lte: filters.maxPrice ? Number(filters.maxPrice) : undefined,
      }
    // if (filters.maxPrice)
    //   filterObj.grandTotal = { $lte: Number(filters.maxPrice) }

    return Object.fromEntries(
      Object.entries(filterObj).filter(
        ([_, v]) => v !== undefined && v !== "" && v !== null
      )
    )
  }, [filters])

  return useQuery({
    queryFn: () => getSupplierInvoices(appliedFilters),
    queryKey: ["supplierInvoices", appliedFilters],
  })
}
