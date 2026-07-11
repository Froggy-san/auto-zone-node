// import { getParam } from "@/lib/getParam"
// import InventoryList from "@/features/dashboard/supplier-invoice/inventory-list"

// import InventoryPagination from "@/features/dashboard/supplier-invoice/inventory-pagination"

// import SearchDialog from "@/features/dashboard/supplier-invoice/search-dialong"

import Spinner from "@/components/Spinner"

import { useSearchParams } from "react-router"
import SupplierInvoiceManagement from "@/features/dashboard/supplier-invoice/SupplierInvoiceManagement"

interface SearchParams {
  page?: string
  name?: string
  shopName?: string
  dateOfOrderFrom?: string
  dateOfOrderTo?: string
  minTotalPrice?: string
  maxTotalPrice?: string
  edit?: string
  reStockingBillId?: string
}
const SupplerInvoices = () => {
  const [searchParams] = useSearchParams()
  const pageNumber = searchParams.get("page") ?? "1"
  const name = searchParams.get("name") ?? ""
  const shopName = searchParams.get("shopName") ?? ""
  const dateOfOrderFrom = searchParams.get("dateOfOrderFrom") ?? ""
  const dateOfOrderTo = searchParams.get("dateOfOrderTo") ?? ""
  const minTotalPrice = searchParams.get("minTotalPrice") ?? ""
  const maxTotalPrice = searchParams.get("maxTotalPrice") ?? ""
  const edit = searchParams.get("edit") ?? ""
  const restockingBillId = searchParams.get("restockingBillId") ?? ""

  return (
    <main className="relative">
      <h2 className="text-4xl font-semibold">INVENTORY MANAGEMENT.</h2>
      <section className="sm:pl-4">
        {/* <TestingAnimation /> */}

        <div className="mt-12 space-y-5">
          <SupplierInvoiceManagement />
        </div>
        {/* <SearchDialog
          currPage={pageNumber}
          shopName={shopName}
          name={name}
          dateOfOrderFrom={dateOfOrderFrom}
          dateOfOrderTo={dateOfOrderTo}
          minTotalPrice={minTotalPrice}
          maxTotalPrice={maxTotalPrice}
        /> */}

        {/* <InventoryList
          pageNumber={pageNumber}
          name={name}
          shopName={shopName}
          dateOfOrderFrom={dateOfOrderFrom}
          dateOfOrderTo={dateOfOrderTo}
          minTotalPrice={minTotalPrice}
          maxTotalPrice={maxTotalPrice}
        /> */}

        {/* <Suspense
          key={pageKey}
          fallback={<Spinner className=" h-fit" size={15} />}
        >
          <InventoryPagination
            pageNumber={pageNumber}
            shopName={shopName}
            dateOfOrderFrom={dateOfOrderFrom}
            dateOfOrderTo={dateOfOrderTo}
            minTotalPrice={minTotalPrice}
            maxTotalPrice={maxTotalPrice}
          />
        </Suspense> */}
      </section>
    </main>
  )
}

export default SupplerInvoices
