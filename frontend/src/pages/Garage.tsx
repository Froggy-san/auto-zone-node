import { getParam } from "@/lib/getParam"
import ErrorMessage from "@components/error-message"
import CarManagement from "@components/garage/car-management"
import CarsList from "@components/garage/cars-list"
import GarageFilterbar from "@components/garage/garage-filter-bar"
import GaragePagination from "@components/garage/garage-pagination"
import Header from "@components/header"
import Footer from "@components/home/footer"
import IntersectionProvidor from "@components/products/intersection-providor"
import Spinner from "@components/Spinner"
import { getAllCarGenerationsAction } from "@lib/actions/carGenerationsActions"
import { getAllCarMakersAction } from "@lib/actions/carMakerActions"
import { getAllCarModelsAction } from "@lib/actions/carModelsActions"
import { getCarsAction, getCarsCountAction } from "@lib/actions/carsAction"
import { getClientsAction } from "@lib/actions/clientActions"
import { createClient } from "@utils/supabase/server"
// import { getClientsDataAction } from "@lib/actions/clientActions";
import { Metadata } from "next"
import React, { Suspense } from "react"
import { useSearchParams } from "react-router"

export const metadata: Metadata = {
  title: "Garage",
}

interface SearchParams {
  page?: string
  color?: string
  plateNumber?: string
  chassisNumber?: string
  motorNumber?: string
  clientId?: string
  carGenerationId?: string
  carModelId?: string
  carMakerId?: string
}
const Page = () => {
  // const pageNumber = searchParams.page ?? "1";
  // const color = searchParams.color ?? "";
  // const plateNumber = searchParams.plateNumber ?? "";
  // const chassisNumber = searchParams.chassisNumber ?? "";
  // const motorNumber = searchParams.motorNumber ?? "";
  // const clientId = searchParams.clientId ?? "";
  // const carMakerId = searchParams.carMakerId ?? "";
  // const carModelId = searchParams.carModelId ?? "";
  // const carGenerationId = searchParams.carGenerationId ?? "";
  const [searchParams] = useSearchParams()
  const pageNumber = getParam(searchParams, "pageNumber", "1")
  const color = getParam(searchParams, "color", "")
  const plateNumber = getParam(searchParams, "plateNumber", "")
  const chassisNumber = getParam(searchParams, "chassisNumber", "")
  const motorNumber = getParam(searchParams, "motorNumber", "")
  const client = getParam(searchParams, "client", "")
  const carMaker = getParam(searchParams, "carMaker", "")
  const carModel = getParam(searchParams, "carModel", "")
  const generations = getParam(searchParams, "generations", "")

  const [clients, carMakers, carsData] = await Promise.all([
    // getAllCarGenerationsAction(),
    getClientsAction({}),
    getAllCarMakersAction(),
    // getCarsCountAction({
    //   chassisNumber,
    //   motorNumber,
    //   plateNumber,
    //   clientId,
    //   carInfoId: carGenerationId,
    //   carMakerId,
    //   carModelId,
    // }),
    // getAllCarModelsAction(),
    getCarsAction({
      pageNumber,
      plateNumber,
      chassisNumber,
      motorNumber,
      clientId,
      carGenerationId,
      color,
      carMakerId,
      carModelId,
      supabase,
    }),
  ])

  const { data: clientsData, error: clientsDataError } = clients
  // const { data: carGenerationsData, error: carGenerationError } =
  //   carGenerations;
  const { data: carMakersData, error: carMakerError } = carMakers
  // const { data: countData, error: countError } = count;
  // const { data: carModelsData, error: carModelsError } = carModels;
  const { data, error } = carsData

  const cars = data?.cars
  const carsCount = data?.count

  return (
    <main
      data-vaul-drawer-wrapper
      className="flex min-h-screen flex-col bg-background"
    >
      <Header />
      <IntersectionProvidor>
        <div className="flex w-full flex-1">
          <GarageFilterbar
            count={carsCount || 0}
            carMakers={carMakersData || []}
            // carModels={carModelsData?.models}
            // carGenerations={carGenerationsData?.carGenerationsData}
            clients={clientsData?.clients || []}
            color={color}
            chassisNumber={chassisNumber}
            motorNumber={motorNumber}
            plateNumber={plateNumber}
            clientId={clientId}
            carGenerationId={carGenerationId}
            pageNumber={pageNumber}
            carMakerId={carMakerId}
            carModelId={carModelId}
          />
          <section className="flex-1">
            <Suspense
              fallback={<Spinner className="h-[300px]" size={30} />}
              key={key}
            >
              <CarsList
                cars={cars}
                error={error}
                clients={clientsData?.clients || []}
              />
            </Suspense>

            {error ? (
              <ErrorMessage>{error} </ErrorMessage>
            ) : (
              <GaragePagination
                count={carsCount || 0}
                // key={paginationKey}
                // color={color}
                // plateNumber={plateNumber}
                // motorNumber={motorNumber}
                // chassisNumber={chassisNumber}
                // clientId={clientId}
                // carGenerationId={carGenerationId}
              />
            )}
            <div className="my-10 px-2">
              <CarManagement
                carMakers={carMakersData || []}
                clients={clientsData?.clients}
              />
            </div>
            {/* <ProductPagenation
              name={name}
              categoryId={categoryId}
              productTypeId={productTypeId}
              productBrandId={productBrandId}
              isAvailable={isAvailable}
            /> */}

            <Footer />
          </section>
        </div>
      </IntersectionProvidor>
    </main>
  )
}

export default Page
