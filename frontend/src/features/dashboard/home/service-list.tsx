import React from "react"

// import { getClientsAction } from "@lib/actions/clientActions"

import ServiceTable from "./service-table"
// import { getServicesAction } from "@lib/actions/serviceActions"
// import { getServiceStatusAction } from "@lib/actions/serviceStatusAction"
// import { getAllCategoriesAction } from "@lib/actions/categoriesAction"
// import { getCarsAction } from "@lib/actions/carsAction"
// import SearchDialog from "./search-dialog"

import PaginationControl from "@/components/pagination-controls"
import useServices from "@/features/services/useServices"
import useCategories from "@/features/categories/useCategories"
import useServiceStatuses from "@/features/services/useServiceStatuses"
import Spinner from "@/components/Spinner"
import ErrorMessage from "@/components/error-message"

interface Props {
  pageNumber: string
  limit: string
  dateFrom: string
  dateTo: string
  clientId: string
  carId: string
  serviceStatusId: string
  minPrice: string
  maxPrice: string
  amountReceived: string
  // serviceDate: string
  technician: string
}
const ServiceList = ({
  pageNumber,
  limit,
  dateFrom,
  dateTo,
  clientId,
  carId,
  amountReceived,

  // serviceDate,
  technician,
  serviceStatusId,
  minPrice,
  maxPrice,
}: Props) => {
  // const { data, error } = await getServicesAction({
  //   pageNumber,
  //   dateFrom,
  //   dateTo,
  //   clientId,
  //   carId,
  //   serviceStatusId,
  //   minPrice,
  //   maxPrice,
  // });

  const { data, isLoading, error, isError } = useServices({
    page: pageNumber ? Number(pageNumber) : 1,
    limit: limit ? Number(limit) : 12,
    dateFrom,
    dateTo,
    clientId,
    carId,
    serviceStatusId,
    // serviceDate,
    maxPrice,
    minPrice,
    technician,
    amountReceived,
  })

  const {
    categories,
    isLoading: isCategoryLoading,
    error: categoryError,
  } = useCategories()
  const {
    data: serviceStatuses,
    isLoading: serviceStatusLoading,
    error: serviceStatusError,
  } = useServiceStatuses()
  // const [servicesData, statusData, categoriesData, clientsData, carsData] =
  //   await Promise.all([
  //     getServicesAction({
  //       pageNumber,
  //       dateFrom,
  //       dateTo,
  //       clientId,
  //       carId,
  //       serviceStatusId,
  //       minPrice,
  //       maxPrice,
  //     }),
  //     getServiceStatusAction(),
  //     getAllCategoriesAction(),
  //     getClientsAction({}),
  //     getCarsAction({ supabase }),
  //   ])
  // const { data: status, error: statusError } = statusData
  // const { data: categories, error: categoriesError } = categoriesData
  // const { data: clients, error: clientsError } = clientsData
  // const { data: cars, error: carsError } = carsData
  // const { data, error } = servicesData

  if (isLoading) return <Spinner className="mt-16 h-80" size={30} />

  if (!isLoading && error) return <ErrorMessage>{error.message}</ErrorMessage>

  return (
    <div className="mt-16">
      {/* <SearchDialog
        isAdmin
        cars={cars?.cars || []}
        clients={clients?.clients || []}
        status={status || []}
        carId={carId}
        clientId={clientId}
        dateTo={dateTo}
        dateFrom={dateFrom}
        serviceStatusId={serviceStatusId}
        maxPrice={maxPrice}
        minPrice={minPrice}
        currPage={pageNumber}
      /> */}

      <h3 className="my-10 text-lg font-semibold sm:text-3xl">Services</h3>

      <>
        <ServiceTable
          isAdmin
          // cars={cars?.cars || []}
          // clients={clients?.clients || []}
          technician={technician}
          categories={categories || []}
          currPage={pageNumber}
          services={data?.data || []}
          status={serviceStatuses?.data || []}
          carId={carId}
          clientId={clientId}
          dateTo={dateTo}
          dateFrom={dateFrom}
          serviceStatusId={serviceStatusId}
          maxPrice={maxPrice}
          minPrice={minPrice}
          pageNumber={pageNumber}
        />
        <PaginationControl
          count={data ? Number(data.pagination.totalCount) : 0}
          currPage={pageNumber}
        />
      </>
    </div>
  )
}

export default ServiceList
