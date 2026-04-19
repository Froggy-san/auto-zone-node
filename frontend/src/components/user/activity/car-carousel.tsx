"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CarItem, PhoneNumber } from "@lib/types";
import { ImageOff } from "lucide-react";
import ProductImages from "@components/products/product-images";
import NoteDialog from "@components/garage/note-dialog";
import Link from "next/link";
import { Button } from "@components/ui/button";

type ClientDetails = {
  id: number;
  email: string;
  name: string;
  phones: PhoneNumber[];
};
interface Props {
  cars: CarItem[];
  clientDetails: ClientDetails;
  isAdmin: boolean;
}

const CarCarousel = ({ cars, clientDetails, isAdmin }: Props) => {
  const [carId, setCarId] = useState<number | null>(null);

  const showenCar = carId ? cars.find((car) => car.id === carId) : undefined;

  return (
    <div className="mt-10  w-full max-w-[1000px] mx-auto  p-5 shadow-lg space-y-3  rounded-xl bg-card/30  border">
      <h2 className="text-xl font-semibold ">YOUR CARS</h2>
      <Carousel
        opts={{
          align: "start",
        }}
        orientation="vertical"
        className=" flex  items-center justify-between  w-full gap-3"
      >
        <div className=" flex-1 ">
          <CarouselContent className="   -mt-1  h-[250px] py-1 gap-2  relative   ">
            {cars.map((car, index) => {
              const image = car.carImages[0]?.imagePath;
              return (
                <CarouselItem
                  key={index}
                  className=" h-full  p-0  rounded-lg   overflow-hidden  "
                  onClick={() => setCarId(car.id)}
                >
                  {image ? (
                    <img
                      src={image}
                      alt={`image:${car.plateNumber}`}
                      className="object-cover w-full h-full max-h-full hover:opacity-85 hover:contras-[190] hover:cursor-pointer transition-all "
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageOff className="w-6 h-6" />
                    </div>
                  )}
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </div>

        <div className=" flex flex-col  items-center   !h-full gap-5 ">
          <CarouselPrevious className="  static  left-[unset]   translate-x-0  " />
          <CarouselNext className=" static left-[unset]    translate-x-0" />
        </div>
      </Carousel>

      {/* The rest of your component */}
      <CarDialog
        viewedCar={showenCar}
        setCarId={setCarId}
        isAdmin={isAdmin}
        client={clientDetails}
      />
    </div>
  );
};

interface CarDia {
  viewedCar: CarItem | undefined;
  setCarId: React.Dispatch<React.SetStateAction<number | null>>;
  isAdmin: boolean;
  client: ClientDetails;
}

function CarDialog({ viewedCar, setCarId, isAdmin, client }: CarDia) {
  const [noteOpen, setNoteOpen] = useState(false);

  const open = viewedCar ? true : false;
  const carImages = viewedCar?.carImages.map((image) => image.imagePath);
  return (
    <Dialog open={open} onOpenChange={() => setCarId(null)}>
      <DialogContent className=" p-0 ">
        <DialogHeader className=" hidden">
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>
        {carImages?.length ? (
          <ProductImages
            imageUrls={carImages}
            className=" h-[250px] sm:rounded-t-lg overflow-hidden"
          />
        ) : (
          <div className=" h-[200px] flex items-center justify-center  bg-foreground/10 rounded-t-lg">
            <ImageOff className=" w-20 h-20" />
          </div>
        )}

        <div className=" p-3 relative">
          {isAdmin && (
            <NoteDialog
              title="Car note"
              content={viewedCar?.notes}
              open={noteOpen}
              onOpenChange={setNoteOpen}
              className=" absolute right-4 top-3"
            />
          )}
          {isAdmin ? (
            <Link
              prefetch={false}
              href={`/garage/${client.id}?viewedCar=${viewedCar?.id}`}
              className="  space-y-1 text-sm text-muted-foreground "
            >
              <div className=" line-clamp-1 ">Client: {client.name}</div>

              <div className=" line-clamp-2 ">
                Plate number: {viewedCar?.plateNumber}
              </div>

              <div className=" line-clamp-2 ">
                Chassis number: {viewedCar?.chassisNumber}
              </div>

              <div className=" line-clamp-2 ">
                Motor number: {viewedCar?.motorNumber}
              </div>

              {/* <div className=" line-clamp-2  flex items-center gap-3 flex-wrap">
            Make: <span>{carInfo.carMaker.name}</span>{" "}
            {carInfo.carMaker.logo ? (
                <img src={carInfo.carMaker.logo} className="  w-7 h-7" />
                ) : null}
                </div> */}
              {/* <div className=" line-clamp-2 ">Model: {carInfo.carModel.name}</div>

<div className=" line-clamp-2 ">
Generation: {carInfo.carModel.name}
</div> */}

              <div className=" line-clamp-2  flex items-center gap-3">
                color:{" "}
                <div
                  className=" w-6 h-6 rounded-full border"
                  style={{ background: `${viewedCar?.color}` }}
                />
              </div>
            </Link>
          ) : (
            <div className="  space-y-1 text-sm text-muted-foreground ">
              <div className=" line-clamp-1 ">Client: {client.name}</div>

              <div className=" line-clamp-2 ">
                Plate number: {viewedCar?.plateNumber}
              </div>

              <div className=" line-clamp-2 ">
                Chassis number: {viewedCar?.chassisNumber}
              </div>

              <div className=" line-clamp-2 ">
                Motor number: {viewedCar?.motorNumber}
              </div>

              {/* <div className=" line-clamp-2  flex items-center gap-3 flex-wrap">
            Make: <span>{carInfo.carMaker.name}</span>{" "}
            {carInfo.carMaker.logo ? (
                <img src={carInfo.carMaker.logo} className="  w-7 h-7" />
                ) : null}
                </div> */}
              {/* <div className=" line-clamp-2 ">Model: {carInfo.carModel.name}</div>

<div className=" line-clamp-2 ">
Generation: {carInfo.carModel.name}
</div> */}

              <div className=" line-clamp-2  flex items-center gap-3">
                color:{" "}
                <div
                  className=" w-6 h-6 rounded-full border"
                  style={{ background: `${viewedCar?.color}` }}
                />
              </div>
            </div>
          )}
          <DialogClose asChild>
            <Button
              autoFocus
              size="sm"
              className=" w-full mt-4"
              variant="secondary"
            >
              Close
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CarCarousel;

// DON'T DELETE
// THE PEEK-ABOO EFFECT.
// <div className="mt-10 space-y-24">
//       <h2 className="text-xl font-semibold text-center">YOUR CARS</h2>
//       <Carousel
//         opts={{
//           align: "start",
//         }}
//         orientation="vertical"
//         className="w-full max-w-[1000px] mx-auto"
//       >
//         <CarouselContent className="h-[250px] pt-2">
//           {cars.map((car, index) => {
//             const image = car.carImages[0]?.imagePath;
//             return (
//               <CarouselItem
//                 key={index}
//                 className="pt-1 h-[200px]  md:basis-1/2" // Adjusted classes
//                 onClick={() => setCarId(car.id)}
//               >
//                 <div className="p-1 h-full">
//                   <Card className="h-full p-0 overflow-hidden">
//                     <CardContent className="flex items-center justify-center h-full p-0 overflow-hidden">
//                       {image ? (
//                         <img
//                           src={image}
//                           alt={`image:${car.plateNumber}`}
//                           className="object-cover w-full h-full"
//                         />
//                       ) : (
//                         <div className="flex items-center justify-center h-full">
//                           <ImageOff className="w-6 h-6" />
//                         </div>
//                       )}
//                     </CardContent>
//                   </Card>
//                 </div>
//               </CarouselItem>
//             );
//           })}
//         </CarouselContent>
//         <CarouselPrevious />
//         <CarouselNext />
//       </Carousel>

//       {/* The rest of your component */}
//       <CarDialog
//         viewedCar={showenCar}
//         setCarId={setCarId}
//         isAdmin={isAdmin}
//         client={clientDetails}
//       />
//     </div>
