import FullImagesGallery from "@components/full-images-gallery";
import { getCarByIdAction } from "@lib/actions/carsAction";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import React from "react";
import CarManagement from "@components/garage/car-management";
import DeleteCar from "@components/garage/delete-car";
import { Card } from "@components/ui/card";
import { ArrowLeft, Blend, Car, ImageOff } from "lucide-react";
import NoteDialog from "@components/garage/note-dialog";
import { VscTypeHierarchySuper } from "react-icons/vsc";
import { TbBoxModel2 } from "react-icons/tb";
import { BsFillPersonLinesFill } from "react-icons/bs";
import { Button } from "@components/ui/button";
import Link from "next/link";
import ServiceManagement from "@components/garage/add-service";
import { getAllCarGenerationsAction } from "@lib/actions/carGenerationsActions";
import { getAllCarMakersAction } from "@lib/actions/carMakerActions";
import { Metadata } from "next";
import { CarItem as CarItemType } from "@lib/types";
import CarItem from "@components/garage/car-item";
import ErrorMessage from "@components/error-message";
import Footer from "@components/home/footer";

export const metadata: Metadata = {
  title: "Car Details",
};

interface Params {
  carId: string;
  car: string;
}
interface searchParams {
  car?: string;
}

const Page = async ({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: searchParams;
}) => {
  // const { data, error } = await getCarByIdAction(params.carId);
  const carId = searchParams.car || "";

  const [carData, carGeneration, carMakers] = await Promise.all([
    getCarByIdAction(params.carId),
    getAllCarGenerationsAction(),
    getAllCarMakersAction(),
  ]);

  const { data, error } = carData;
  const { data: carGenerationData, error: carGenerationError } = carGeneration;
  const { data: carMakersData, error: carMakersError } = carMakers;
  if (error) return <p>{error}</p>;
  if (!data) return <p>Couldn&apos;t find a car with that id {params.carId}</p>;

  const carGenerations = carGenerationData?.carGenerationsData;
  const car = data.cars.find((car) => car.id === Number(carId)) as CarItemType; // Client's information with client's cars.

  if (!car) return <ErrorMessage>Failed to fine matching cars.</ErrorMessage>;
  const images = car.carImages.map((image) => image.imagePath);
  const carInfo = car.carGenerations;
  const carModel = carInfo.carModels;
  const carMaker = carModel.carMakers;
  const clinetPhones = data.phones;
  const client = {
    name: data.name,
    email: data.email,
    id: data?.id,
    phones: clinetPhones,
  };

  const clientOtherCars = data.cars.filter((car) => car.id !== Number(carId));
  console.log(clientOtherCars, "OTHER CARS");
  // const client: ClientWithPhoneNumbers = data.client;
  return (
    <main className=" min-h-screen  max-w-[2200px] mx-auto ">
      {images && images.length ? (
        <FullImagesGallery images={images} />
      ) : (
        <div className=" h-full flex items-center justify-center  bg-foreground/10  font-semibold text-xl py-5 gap-3">
          <ImageOff className=" w-10 h-10" /> No images.
        </div>
      )}

      <section className="mt-10   space-y-14   px-2 sm:px-4 pb-10">
        {/* Car Information  starts*/}
        <div className=" space-y-5">
          <Button asChild variant="secondary" size="sm">
            <Link href="/garage" className=" group">
              <ArrowLeft
                size={25}
                className="  group-hover:-translate-x-1 transition-all"
              />
            </Link>
          </Button>
          <h2 className=" text-2xl font-semibold">Car information.</h2>
          <div className=" grid  gap-5 grid-cols-1 md:grid-cols-2">
            <Card className="  p-5  text-sm relative">
              <div className=" w-14 h-14 rounded-full    bg-dashboard-orange  text-dashboard-text-orange  flex items-center justify-center mb-3">
                <Car size={30} />
              </div>

              <div>
                Plate number:{" "}
                <span className=" text-muted-foreground">
                  {car?.plateNumber}
                </span>
              </div>
              <div>
                Motor number:{" "}
                <span className=" text-muted-foreground">
                  {car?.motorNumber}
                </span>
              </div>
              <div>
                Chassis number:{" "}
                <span className=" text-muted-foreground">
                  {car?.chassisNumber}
                </span>
              </div>
              <div className=" flex items-center gap-3">
                Color:{" "}
                <div
                  className="  w-6 h-6 rounded-full border"
                  style={{ backgroundColor: `${car?.color || "black"}` }}
                />
              </div>
              {car?.notes && (
                <NoteDialog
                  title="Car note."
                  content={<p>{car.notes}</p>}
                  className=" absolute right-5 top-7"
                />
              )}
            </Card>

            <Card className="  p-5  text-sm relative">
              <div className=" w-14 h-14 rounded-full  bg-dashboard-green text-dashboard-text-green  flex items-center justify-center mb-3">
                <VscTypeHierarchySuper size={30} />
              </div>

              <div>
                Generation:{" "}
                <span className=" text-muted-foreground break-all">
                  {carInfo.name}
                </span>
              </div>

              {!carInfo.notes ? null : carInfo && carInfo.notes.length < 300 ? (
                <div className=" mt-3 flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className=" mb-auto"> Note: </span>
                  <p className=" text-muted-foreground break-all">
                    {carInfo.notes}
                  </p>
                </div>
              ) : (
                <NoteDialog
                  title="Car model note."
                  content={<p>{carInfo.notes}</p>}
                  className=" absolute right-5 top-7"
                />
              )}
            </Card>

            <Card className="  p-5  text-sm relative">
              <div className=" w-14 h-14 rounded-full   bg-dashboard-blue text-dashboard-text-blue  flex items-center justify-center mb-3">
                <Blend size={30} />
              </div>

              <div>
                Maker:{" "}
                <span className=" text-muted-foreground break-all">
                  {carMaker.name}
                </span>
              </div>
              <div className=" flex items-center mt-3 gap-3">
                Logo:{" "}
                {carMaker.logo ? (
                  <img
                    src={carMaker.logo}
                    alt="Car logo"
                    className=" h-10 w-10 object-contain"
                  />
                ) : (
                  <span>Logo</span>
                )}
              </div>
              {carMaker.notes && (
                <NoteDialog
                  title="Car maker note."
                  content={<p>{carMaker.notes}</p>}
                  className=" absolute right-5 top-7"
                />
              )}
            </Card>

            <Card className="  p-5  text-sm relative">
              <div className=" w-14 h-14 rounded-full   bg-dashboard-indigo text-dashboard-text-indigo  flex items-center justify-center mb-3">
                <TbBoxModel2 size={30} />
              </div>

              <div>
                Model:{" "}
                <span className=" text-muted-foreground break-all">
                  {carModel.name}
                </span>
              </div>

              {!carModel.notes ? null : carInfo &&
                carModel.notes.length < 300 ? (
                <div className=" mt-3 flex  flex-col sm:flex-row sm:items-center gap-2">
                  Note:{" "}
                  <p className=" text-muted-foreground break-all">
                    {carModel.notes}
                  </p>
                </div>
              ) : (
                <NoteDialog
                  title="Car model note."
                  content={<p>{carModel.notes}</p>}
                  className=" absolute right-5 top-7"
                />
              )}
            </Card>
          </div>
        </div>
        {/* Car Information  ends*/}

        <div className=" space-y-5">
          <h2 className=" text-2xl font-semibold">Cleint.</h2>
          <Card className=" p-5  text-sm relative max-w-[800px] mx-auto">
            <div className=" w-14 h-14 rounded-full     bg-muted   flex items-center justify-center mb-3">
              <BsFillPersonLinesFill size={30} />
            </div>

            <div className=" space-y-2">
              <div>
                Name:{" "}
                <span className=" text-muted-foreground">{client.name}</span>
              </div>

              <div>
                Email:{" "}
                <span className=" text-muted-foreground">{client.email}</span>
              </div>

              <div className=" space-y-3">
                <h3 className=" font-semibold">Phones:</h3>
                <ul className="list-decimal list-inside flex gap-3 flex-wrap text-muted-foreground ">
                  {clinetPhones.length ? (
                    clinetPhones.map((phone, i) => (
                      <li key={i}>{phone.number}</li>
                    ))
                  ) : (
                    <span className=" text-muted-foreground">No phones.</span>
                  )}
                </ul>
              </div>
            </div>
          </Card>
        </div>

        <div className=" space-y-5 ">
          <h2 className=" text-xl font-semibold">Actions</h2>
          <div className=" flex flex-col sm:flex-row items-center gap-3">
            <CarManagement
              useParams
              carToEdit={car}
              clientId={client.id}
              // carGenerations={carGenerations}
              carMakers={carMakersData || []}
              className=" sm:flex-col   sm:items-stretch lg:flex-row lg:items-center"
            />
            <DeleteCar
              carId={car.id}
              clientId={client.id}
              imagePaths={images}
              className=" sm:flex-col   sm:items-stretch lg:flex-row lg:items-center"
            />
            <ServiceManagement
              car={car}
              client={client}
              className=" sm:flex-col   sm:items-stretch lg:flex-row lg:items-center"
            />
          </div>
        </div>
        {/* Related */}
        {clientOtherCars.length ? (
          <div>
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1" className=" border-none">
                <AccordionTrigger className="font-semibold  text-xl">
                  Related cars:
                </AccordionTrigger>
                <AccordionContent>
                  <ul className=" grid  px-4  mt-10 gap-3">
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
  );
};

export default Page;
