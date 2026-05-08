import React from "react"
import InventoryForm from "./inventory-form"
import { getProductsAction } from "@lib/actions/productsActions"
import { getRestockingBillsAction } from "@lib/actions/restockingBillActions"
import { getProductBoughtByIdAction } from "@lib/actions/productBoughtActions"

const InventoryManagement = ({
  edit,
  reStockingBillId,
}: {
  edit: string
  reStockingBillId: string
}) => {
  const [productsData, restockingData] = await Promise.all([
    getProductsAction({}),
    getRestockingBillsAction({}),
  ])

  let productToEdit

  if (edit) {
    const { data, error } = await getProductBoughtByIdAction(edit)
    productToEdit = { data, error }
  }

  const { data: products, error } = productsData
  const { data: restockings, error: restockingsError } = restockingData

  const isOpen = edit || reStockingBillId ? true : false
  if (error || restockingsError) return <p>{error || restockingsError}</p>
  if (!products) return <p>Soemthng went wrong</p>

  return (
    <div className="flex flex-col justify-between gap-x-7 gap-y-2 rounded-lg border p-3 shadow-sm xs:flex-row xs:items-center">
      <div className="space-y-0.5">
        <label className="font-semibold">Inventory</label>
        <p className="text-sm text-muted-foreground">Add new Inventory.</p>
      </div>
      <div className="sm:pr-2">
        <InventoryForm
          open={isOpen}
          reStockingBillId={reStockingBillId}
          products={products}
          restockings={restockings?.data || []}
          proBoughtToEdit={productToEdit?.data}
        />
      </div>
    </div>
  )
}

export default InventoryManagement
