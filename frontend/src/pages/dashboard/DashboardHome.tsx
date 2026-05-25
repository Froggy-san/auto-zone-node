// import EditFeesManagement from "@/components/dashboard/home/edit-fees-management"

import ServiceList from "@/components/dashboard/home/service-list"
// import ServicePagination from "@/components/dashboard/home/service-pagination"
// import Spinner from "@/components/Spinner"
// import React, { Suspense } from "react"
// import SalesCharts from "@/components/dashboard/home/charts/sales-chart"
// import ProductSoldManagement from "@/components/dashboard/home/product-sold-management"
// import Orders from "@/components/dashboard/home/orders/orders"
// import TodayOrders from "@/components/dashboard/home/orders/today-orders"
import { getParam } from "@/lib/getParam"
import { useSearchParams } from "react-router"

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
const DashboardHome = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const pageNumber = getParam(searchParams, "page", "1")
  const dateFrom = getParam(searchParams, "dateFrom", "")
  const dateTo = getParam(searchParams, "dateTo", "")
  const clientId = getParam(searchParams, "clientId", "")
  const serviceStatusId = getParam(searchParams, "serviceStatusId", "")
  const carId = getParam(searchParams, "carId", "")
  const minPrice = getParam(searchParams, "minPrice", "")
  const maxPrice = getParam(searchParams, "maxPrice", "")
  const editFee = getParam(searchParams, "editFee", "")
  const addFeeId = getParam(searchParams, "addFeeId", "")
  const editSold = getParam(searchParams, "editSold", "")
  const addSoldId = getParam(searchParams, "addSoldId", "")

  console.log("WWWWWWWWWWW")
  return (
    <main className="relative">
      <h2 className="text-4xl font-semibold">SALES OVERVIEW.</h2>

      <section className="space-y-40 overflow-x-hidden pb-28 sm:pl-4">
        {/* <SalesCharts />

        <TodayOrders />
        <Orders /> */}

        {/*    
          <EditFeesManagement feesId={editFee} addFeeId={addFeeId} /> */}

        {/* <ProductSoldManagement editSold={editSold} addSoldId={addSoldId} /> */}

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

export default DashboardHome
