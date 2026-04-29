import EditFeesManagement from "@components/dashboard/home/edit-fees-management"

import ServiceList from "@components/dashboard/home/service-list"
import ServicePagination from "@components/dashboard/home/service-pagination"
import Spinner from "@components/Spinner"
import React, { Suspense } from "react"
import SalesCharts from "@components/dashboard/home/charts/sales-chart"
import ProductSoldManagement from "@components/dashboard/home/product-sold-management"
import Orders from "@components/dashboard/home/orders/orders"
import TodayOrders from "@components/dashboard/home/orders/today-orders"

// import dynamic from "next/dynamic";
// const Charts = dynamic(
//   () => import("@components/dashboard/home/charts/charts"),
//   {
//     ssr: false,
//   }
// );

interface SearchParams {
  page?: string
  dateFrom?: string
  dateTo?: string
  clientId?: string
  serviceStatusId?: string
  carId?: string
  minPrice?: string
  maxPrice?: string
  editFee?: string
  addFeeId?: string
  editSold?: string
  addSoldId?: string
}
const Page = ({ searchParams }: { searchParams: SearchParams }) => {
  const pageNumber = searchParams?.page ?? "1"
  const dateFrom = searchParams.dateFrom ?? ""
  const dateTo = searchParams.dateTo ?? ""
  const clientId = searchParams.clientId ?? ""
  const serviceStatusId = searchParams.serviceStatusId ?? ""
  const carId = searchParams.carId ?? ""
  const minPrice = searchParams.minPrice ?? ""
  const maxPrice = searchParams.maxPrice ?? ""
  const editFee = searchParams.editFee ?? ""
  const addFeeId = searchParams.addFeeId ?? ""
  const editSold = searchParams.editSold ?? ""
  const addSoldId = searchParams.addSoldId ?? ""

  const key =
    pageNumber + dateFrom + dateTo + clientId + carId + minPrice + maxPrice
  const pageKey = dateFrom + dateTo + clientId + carId + minPrice + maxPrice
  return (
    <main className="relative">
      <h2 className="text-4xl font-semibold">SALES OVERVIEW.</h2>

      <section className="space-y-40 overflow-x-hidden pb-28 sm:pl-4">
        <SalesCharts />

        <TodayOrders />
        <Orders />

        <Suspense
          fallback={
            <Spinner size={30} className="mt-10" key={editFee + addFeeId} />
          }
        >
          <EditFeesManagement feesId={editFee} addFeeId={addFeeId} />
        </Suspense>

        <Suspense
          fallback={
            <Spinner size={30} className="mt-10" key={editSold + addSoldId} />
          }
        >
          <ProductSoldManagement editSold={editSold} addSoldId={addSoldId} />
        </Suspense>

        <Suspense fallback={<Spinner size={30} className="mt-10" key={key} />}>
          <ServiceList
            pageNumber={pageNumber}
            dateTo={dateTo}
            dateFrom={dateFrom}
            clientId={clientId}
            carId={carId}
            serviceStatusId={serviceStatusId}
            minPrice={minPrice}
            maxPrice={maxPrice}
          />
        </Suspense>

        {/* <Suspense
          key={pageKey}
          fallback={<Spinner className=" h-fit" size={15} />}
        >
          <ServicePagination
            pageNumber={pageNumber}
            dateTo={dateFrom}
            dateFrom={dateTo}
            clientId={clientId}
            carId={carId}
            minPrice={minPrice}
            maxPrice={maxPrice}
            serviceStatusId={serviceStatusId}
          />
        </Suspense> */}
      </section>
    </main>
  )
}

export default Page
