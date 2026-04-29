import InventoryList from "@components/dashboard/inventory/inventory-list"
import InventoryManagement from "@components/dashboard/inventory/inventory-management"
import InventoryPagination from "@components/dashboard/inventory/inventory-pagination"

import SearchDialog from "@components/dashboard/inventory/search-dialong"

import Spinner from "@components/Spinner"
import { Metadata } from "next"
import React, { Suspense } from "react"

export const metadata: Metadata = {
  title: "Inventory",
}
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
const Page = ({ searchParams }: { searchParams: SearchParams }) => {
  const pageNumber = searchParams?.page ?? "1"
  const name = searchParams.name ?? ""
  const shopName = searchParams.shopName ?? ""
  const dateOfOrderFrom = searchParams.dateOfOrderFrom ?? ""
  const dateOfOrderTo = searchParams.dateOfOrderTo ?? ""
  const minTotalPrice = searchParams.minTotalPrice ?? ""
  const maxTotalPrice = searchParams.maxTotalPrice ?? ""
  const edit = searchParams.edit ?? ""
  const restockingBillId = searchParams.reStockingBillId ?? ""

  const key =
    shopName +
    dateOfOrderFrom +
    dateOfOrderTo +
    minTotalPrice +
    pageNumber +
    name
  const pageKey = shopName + dateOfOrderFrom + dateOfOrderTo + minTotalPrice
  return (
    <main className="relative">
      <h2 className="text-4xl font-semibold">INVENTORY MANAGEMENT.</h2>
      <section className="sm:pl-4">
        {/* <TestingAnimation /> */}

        <div className="mt-12 space-y-5">
          {/* <RestockingForm /> */}
          <Suspense
            key={edit}
            fallback={<Spinner size={30} className="mt-10" />}
          >
            <InventoryManagement
              edit={edit}
              reStockingBillId={restockingBillId}
            />
          </Suspense>
        </div>
        <SearchDialog
          currPage={pageNumber}
          shopName={shopName}
          name={name}
          dateOfOrderFrom={dateOfOrderFrom}
          dateOfOrderTo={dateOfOrderTo}
          minTotalPrice={minTotalPrice}
          maxTotalPrice={maxTotalPrice}
        />

        <Suspense fallback={<Spinner size={30} className="mt-10" key={key} />}>
          <InventoryList
            pageNumber={pageNumber}
            name={name}
            shopName={shopName}
            dateOfOrderFrom={dateOfOrderFrom}
            dateOfOrderTo={dateOfOrderTo}
            minTotalPrice={minTotalPrice}
            maxTotalPrice={maxTotalPrice}
          />
        </Suspense>

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

export default Page
