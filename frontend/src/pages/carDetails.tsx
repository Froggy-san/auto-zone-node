import FullImagesGallery from "@/components/full-images-gallery"
import { getCarByIdAction } from "@/lib/actions/carsAction"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@//components/ui/accordion"
import React from "react"
import CarManagement from "@/components/garage/car-management"
import DeleteCar from "@/components/garage/delete-car"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Blend, Car, ImageOff } from "lucide-react"
import NoteDialog from "@/components/garage/note-dialog"
import { VscTypeHierarchySuper } from "react-icons/vsc"
import { TbBoxModel2 } from "react-icons/tb"
import { BsFillPersonLinesFill } from "react-icons/bs"
import { Button } from "@/components/ui/button"
import ServiceManagement from "@/components/garage/add-service"
import { getAllCarGenerationsAction } from "@/lib/actions/carGenerationsActions"

import CarItem from "@/components/garage/car-item"
import ErrorMessage from "@/components/error-message"
import Footer from "@/components/home/footer"
import { Link, useParams } from "react-router"
import useCarById from "@/features/cars/useCarById"
import Spinner from "@/components/Spinner"

interface Params {
  carId: string
  car: string
}
interface searchParams {
  car?: string
}

const CarDetails = () => {
  // const { data, error } = await getCarByIdAction(params.carId);
  const { carId, userId } = useParams()

  const { data: car, isLoading, error } = useCarById(userId, carId)

  // const [carData, carGeneration, carMakers] = await Promise.all([
  //   getCarByIdAction(params.carId),
  //   getAllCarGenerationsAction(),
  //   getAllCarMakersAction(),
  // ])

  // const { data, error } = carData
  // const { data: carGenerationData, error: carGenerationError } = carGeneration
  // const { data: carMakersData, error: carMakersError } = carMakers

  if (isLoading) return <Spinner size={23} />
  if (!isLoading && error) return <p>{error.message}</p>
  if (!car) return <p>Couldn&apos;t find a car with that id: {carId}</p>

  // const carGenerations = carGenerationData?.carGenerationsData
  // const car = data.cars.find((car) => car.id === Number(carId)) as CarItemType // Client's information with client's cars.

  if (!car) return <ErrorMessage>Failed to fine matching cars.</ErrorMessage>
  const images = car.carImages.map((image) => image.imagePath)
  const carInfo = car.carGeneration
  const carModel = carInfo.carModel
  const carMaker = carModel.carMaker
  const clinetPhones = car.user.phones
  // const client = {
  //   name: data.name,
  //   email: data.email,
  //   id: data?.id,
  //   phones: clinetPhones,
  // }

  const clientOtherCars = car?.relatedCars || []
  console.log(clientOtherCars, "OTHER CARS")
  const client = car.user
  return (
    <main className="mx-auto min-h-screen max-w-[2200px]">
      {images && images.length ? (
        <FullImagesGallery images={images} />
      ) : (
        <div className="flex h-full items-center justify-center gap-3 bg-foreground/10 py-5 text-xl font-semibold">
          <ImageOff className="h-10 w-10" /> No images.
        </div>
      )}

      <section className="mt-10 space-y-14 px-2 pb-10 sm:px-4">
        {/* Car Information  starts*/}
        <div className="space-y-5">
          <Button asChild variant="secondary" size="sm">
            <Link to="/garage" className="group">
              <ArrowLeft
                size={25}
                className="transition-all group-hover:-translate-x-1"
              />
            </Link>
          </Button>
          <h2 className="text-2xl font-semibold">Car information.</h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Card className="relative p-5 text-sm">
              <div className="bg-dashboard-orange text-dashboard-text-orange mb-3 flex h-14 w-14 items-center justify-center rounded-full">
                <Car size={30} />
              </div>

              <div>
                Plate number:{" "}
                <span className="text-muted-foreground">
                  {car?.plateNumber}
                </span>
              </div>
              <div>
                Motor number:{" "}
                <span className="text-muted-foreground">
                  {car?.motorNumber}
                </span>
              </div>
              <div>
                Chassis number:{" "}
                <span className="text-muted-foreground">
                  {car?.chassisNumber}
                </span>
              </div>
              <div className="flex items-center gap-3">
                Color:{" "}
                <div
                  className="h-6 w-6 rounded-full border"
                  style={{ backgroundColor: `${car?.color || "black"}` }}
                />
              </div>
              {car?.notes && (
                <NoteDialog
                  title="Car note."
                  content={<p>{car.notes}</p>}
                  className="absolute top-7 right-5"
                />
              )}
            </Card>

            <Card className="relative p-5 text-sm">
              <div className="bg-dashboard-green text-dashboard-text-green mb-3 flex h-14 w-14 items-center justify-center rounded-full">
                <VscTypeHierarchySuper size={30} />
              </div>

              <div>
                Generation:{" "}
                <span className="break-all text-muted-foreground">
                  {carInfo.name}
                </span>
              </div>

              {!carInfo.notes ? null : carInfo && carInfo.notes.length < 300 ? (
                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <span className="mb-auto"> Note: </span>
                  <p className="break-all text-muted-foreground">
                    {carInfo.notes}
                  </p>
                </div>
              ) : (
                <NoteDialog
                  title="Car model note."
                  content={<p>{carInfo.notes}</p>}
                  className="absolute top-7 right-5"
                />
              )}
            </Card>

            <Card className="relative p-5 text-sm">
              <div className="bg-dashboard-blue text-dashboard-text-blue mb-3 flex h-14 w-14 items-center justify-center rounded-full">
                <Blend size={30} />
              </div>

              <div>
                Maker:{" "}
                <span className="break-all text-muted-foreground">
                  {carMaker.name}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-3">
                Logo:{" "}
                {carMaker.logo ? (
                  <img
                    src={carMaker.logo}
                    alt="Car logo"
                    className="h-10 w-10 object-contain"
                  />
                ) : (
                  <span>Logo</span>
                )}
              </div>
              {carMaker.notes && (
                <NoteDialog
                  title="Car maker note."
                  content={<p>{carMaker.notes}</p>}
                  className="absolute top-7 right-5"
                />
              )}
            </Card>

            <Card className="relative p-5 text-sm">
              <div className="bg-dashboard-indigo text-dashboard-text-indigo mb-3 flex h-14 w-14 items-center justify-center rounded-full">
                <TbBoxModel2 size={30} />
              </div>

              <div>
                Model:{" "}
                <span className="break-all text-muted-foreground">
                  {carModel.name}
                </span>
              </div>

              {!carModel.notes ? null : carInfo &&
                carModel.notes.length < 300 ? (
                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                  Note:{" "}
                  <p className="break-all text-muted-foreground">
                    {carModel.notes}
                  </p>
                </div>
              ) : (
                <NoteDialog
                  title="Car model note."
                  content={<p>{carModel.notes}</p>}
                  className="absolute top-7 right-5"
                />
              )}
            </Card>
          </div>
        </div>
        {/* Car Information  ends*/}

        <div className="space-y-5">
          <h2 className="text-2xl font-semibold">Cleint.</h2>
          <Card className="relative mx-auto max-w-[800px] p-5 text-sm">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <BsFillPersonLinesFill size={30} />
            </div>

            <div className="space-y-2">
              <div>
                Name:{" "}
                <span className="text-muted-foreground">{client.username}</span>
              </div>

              <div>
                Email:{" "}
                <span className="text-muted-foreground">{client.email}</span>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Phones:</h3>
                <ul className="flex list-inside list-decimal flex-wrap gap-3 text-muted-foreground">
                  {clinetPhones.length ? (
                    clinetPhones.map((phone, i) => <li key={i}>{phone}</li>)
                  ) : (
                    <span className="text-muted-foreground">No phones.</span>
                  )}
                </ul>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <h2 className="text-xl font-semibold">Actions</h2>
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <CarManagement
              useParams
              carToEdit={car}
              // clientId={client.id}
              // carGenerations={carGenerations}
              // carMakers={carMakersData || []}
              className="sm:flex-col sm:items-stretch lg:flex-row lg:items-center"
            />
            <DeleteCar
              carId={car.id}
              className="sm:flex-col sm:items-stretch lg:flex-row lg:items-center"
            />
            <ServiceManagement
              car={car}
              client={client}
              className="sm:flex-col sm:items-stretch lg:flex-row lg:items-center"
            />
          </div>
        </div>
        {/* Related */}
        {clientOtherCars.length ? (
          <div>
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1" className="border-none">
                <AccordionTrigger className="text-xl font-semibold">
                  Related cars:
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="mt-10 grid gap-3 px-4">
                    {clientOtherCars.map((car, i) => (
                      <CarItem
                        clientId={client.id}
                        car={car}
                        client={undefined}
                        key={i}
                      />
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        ) : null}
        {/* Related */}
      </section>

      <Footer />
    </main>
  )
}

export default CarDetails
