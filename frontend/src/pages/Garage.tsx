import { getParam } from "@//lib/getParam"
import ErrorMessage from "@/components/error-message"
import CarManagement from "@/components/garage/car-management"

import CarsList from "@/components/garage/cars-list"
import GarageFilterbar from "@/components/garage/garage-filter-bar"

import Header from "@/components/header"
import Footer from "@/components/home/footer"
import IntersectionProvidor from "@/components/products/intersection-providor"
import Spinner from "@/components/Spinner"
import useCars from "@/features/cars/useCars"
import { Car } from "lucide-react"

import React, { Suspense } from "react"
import { useSearchParams } from "react-router"

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
const Garage = () => {
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
  const page = getParam(searchParams, "pageNumber", "1")
  const limit = getParam(searchParams, "limit", "12")
  const color = getParam(searchParams, "color", "")
  const plateNumber = getParam(searchParams, "plateNumber", "")
  const chassisNumber = getParam(searchParams, "chassisNumber", "")
  const motorNumber = getParam(searchParams, "motorNumber", "")
  const user = getParam(searchParams, "user", "")
  const carMaker = getParam(searchParams, "carMaker", "")
  const carModel = getParam(searchParams, "carModel", "")
  const carGeneration = getParam(searchParams, "generations", "")

  const { data, isLoading, error } = useCars({
    page,
    limit,
    color,
    chassisNumber,
    motorNumber,
    user,
    carGeneration,
    carMaker,
    carModel,
  })

  const cars = data?.data || []
  const count = data?.pagination.totalCount || 0

  // const [clients, carMakers, carsData] = await Promise.all([
  //   // getAllCarGenerationsAction(),
  //   getClientsAction({}),
  //   getAllCarMakersAction(),
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
  //   getCarsAction({
  //     pageNumber,
  //     plateNumber,
  //     chassisNumber,
  //     motorNumber,
  //     clientId,
  //     carGenerationId,
  //     color,
  //     carMakerId,
  //     carModelId,
  //     supabase,
  //   }),
  // ])

  // const { data: clientsData, error: clientsDataError } = clients
  // const { data: carGenerationsData, error: carGenerationError } =
  //   carGenerations;
  // const { data: carMakersData, error: carMakerError } = carMakers
  // const { data: countData, error: countError } = count;
  // const { data: carModelsData, error: carModelsError } = carModels;
  // const { data, error } = carsData

  // const cars = data?.cars
  // const carsCount = data?.count

  return (
    <main
      data-vaul-drawer-wrapper
      className="flex min-h-screen flex-col bg-background"
    >
      <Header />
      <IntersectionProvidor>
        <div className="flex w-full flex-1">
          <GarageFilterbar
            color={color}
            chassisNumber={chassisNumber}
            motorNumber={motorNumber}
            plateNumber={plateNumber}
            user={user}
            carGeneration={carGeneration}
            page={page}
            limit={limit}
            carMaker={carMaker}
            carModel={carModel}
            count={0}
          />
          <section className="flex-1">
            {isLoading ? (
              <Spinner className="h-screen" size={25} />
            ) : error ? (
              <ErrorMessage>{error.message}</ErrorMessage>
            ) : !cars.length ? (
              <div className="flex h-32 flex-col-reverse items-center justify-center gap-2 text-center font-semibold">
                No cars. <Car className="h-10 w-10" />
              </div>
            ) : (
              <CarsList cars={cars} count={count} />
            )}

            {/* {error ? (
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
            )} */}
            <div className="my-10 px-2">
              <CarManagement />
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

export default Garage
