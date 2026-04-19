import React, { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@components/ui/button";
import { Service } from "@lib/types";
import ProductImages from "@components/products/product-images";
import { ImageOff } from "lucide-react";
import Link from "next/link";
import NoteDialog from "@components/garage/note-dialog";

const CarDialog = ({
  service,
  isAdmin,
}: {
  service: Service;
  isAdmin: boolean;
}) => {
  const [noteOpen, setNoteOpen] = useState(false);

  const car = service.cars;

  const carImages = car.carImages.map((image) => image.imagePath);

  // const carInfo = car.carInfo;
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="   h-6 px-2 py-3 text-xs"
          variant="outline"
        >
          Show
        </Button>
      </DialogTrigger>
      <DialogContent className=" p-0 ">
        <DialogHeader className=" hidden">
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>
        {carImages.length ? (
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
              content={car.notes}
              open={noteOpen}
              onOpenChange={setNoteOpen}
              className=" absolute right-4 top-3"
            />
          )}
          {isAdmin ? (
            <Link
              prefetch={false}
              href={`/garage/${service.clients.id}?car=${car.id}`}
              className="  space-y-1 text-sm text-muted-foreground "
            >
              <div className=" line-clamp-1 ">
                Client: {service.clients.name}
              </div>

              <div className=" line-clamp-2 ">
                Plate number: {car.plateNumber}
              </div>

              <div className=" line-clamp-2 ">
                Chassis number: {car.chassisNumber}
              </div>

              <div className=" line-clamp-2 ">
                Motor number: {car.motorNumber}
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
                  style={{ background: `${car.color}` }}
                />
              </div>
            </Link>
          ) : (
            <div className="  space-y-1 text-sm text-muted-foreground ">
              <div className=" line-clamp-1 ">
                Client: {service.clients.name}
              </div>

              <div className=" line-clamp-2 ">
                Plate number: {car.plateNumber}
              </div>

              <div className=" line-clamp-2 ">
                Chassis number: {car.chassisNumber}
              </div>

              <div className=" line-clamp-2 ">
                Motor number: {car.motorNumber}
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
                  style={{ background: `${car.color}` }}
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
};

export default CarDialog;
