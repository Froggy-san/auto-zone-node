// import EditFeesManagement from "@/components/dashboard/home/edit-fees-management"

import EditSoldForm from "@/components/dashboard/home/edit-sold-form"
import FeesForm from "@/components/dashboard/home/fees-form"
// import ProductSoldManagement from "@/components/dashboard/home/product-sold-management"
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
  const limit = getParam(searchParams, "limit", "12")
  const dateFrom = getParam(searchParams, "dateFrom", "")
  const dateTo = getParam(searchParams, "dateTo", "")
  const clientId = getParam(searchParams, "clientId", "")
  const serviceStatusId = getParam(searchParams, "serviceStatusId", "")
  const receivedAmount = getParam(searchParams, "receivedAmount", "")
  const technician = getParam(searchParams, "technician", "")
  const carId = getParam(searchParams, "carId", "")
  const minPrice = getParam(searchParams, "minPrice", "")
  const maxPrice = getParam(searchParams, "maxPrice", "")

  return (
    <main className="relative">
      <h2 className="text-4xl font-semibold">SALES OVERVIEW.</h2>

      <section className="space-y-40 overflow-x-hidden pb-28 sm:pl-4">
        {/* <SalesCharts />

        <TodayOrders />
        <Orders /> */}

        {/* <EditFeesManagement feesId={editFee} addFeeId={addFeeId} /> */}
        <FeesForm />
        <EditSoldForm />
        {/* <ProductSoldManagement editSold={editSold} addSoldId={addSoldId} /> */}

        <ServiceList
          pageNumber={pageNumber}
          amountReceived={receivedAmount}
          limit={limit}
          technician={technician}
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
