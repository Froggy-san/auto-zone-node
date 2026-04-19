import ProductImages from "@components/products/product-images";
import { Card } from "@components/ui/card";
import { CarItem as CarItemProps } from "@lib/types";
import React from "react";
import CarAction from "./car-item-actions";
import Link from "next/link";
import { ImageOff } from "lucide-react";

const CarItem = ({
  clientId,
  car,
  pageSize,
}: {
  clientId?: number;
  pageSize?: number;
  car: CarItemProps;
}) => {
  const carImages = car.carImages.map((image) => image.imagePath);

  const viewedImages = carImages.length ? carImages : [];
  const carInfo = car.carGenerations;
  const carModel = carInfo.carModels;
  const carMaker = carModel.carMakers;
  // console.log("Car info", carInfo);
  // console.log("Car model", carModel);
  // console.log("Car maker", carMaker);
  return (
    <Card className="   border    min-h-[250px]">
      <Link
        prefetch={false}
        href={`/garage/${car.clientId || clientId}?car=${car.id}`}
        className="  flex  flex-col  md:flex-row h-full w-full relative "
      >
        <div className="  min-h-[250px] lg:min-h-[300px]  md:min-w-[270px] flex-1">
          {viewedImages.length ? (
            <ProductImages
              imageUrls={viewedImages}
              className=" h-full  rounded-tl-xl rounded-tr-xl md:rounded-tr-none  md:rounded-bl-xl  overflow-hidden"
            />
          ) : (
            <div className=" h-full flex items-center justify-center  bg-foreground/10   rounded-tl-xl rounded-tr-xl md:rounded-tr-none  md:rounded-bl-xl">
              <ImageOff className=" w-20 h-20" />
            </div>
          )}
        </div>
        <section className="  w-full  xl:pl-14   text-xs  grid grid-cols-1 items-center xs:grid-cols-2 h-fit   md:grid-cols-1 lg:grid-cols-2  md:w-[65%] gap-y-2 gap-x-3 md:gap-y-3 md:gap-x-0  p-3 lg:max-w-[900px]    md:pr-10">
          {/* top */}
          <div className=" flex items-center gap-2  ">
            <span className="">- Make: </span>{" "}
            <span className=" text-muted-foreground  break-all">
              {carMaker.name}
            </span>
            {carMaker.logo ? (
              <img
                src={carMaker.logo}
                className=" h-7 w-7 rounded-md  object-cover"
              />
            ) : null}
          </div>{" "}
          <div className="">
            <span>- Model: </span>{" "}
            <span className=" text-muted-foreground  break-all">
              {carModel.name}
            </span>
          </div>
          <div className="">
            <span>- Generation: </span>{" "}
            <span className=" text-muted-foreground  break-all">
              {carInfo.name}
            </span>
          </div>{" "}
          <div className="">
            <span>- Plate number: </span>{" "}
            <span className=" text-muted-foreground  break-all">
              {car.plateNumber}
            </span>
          </div>
          <div className="">
            <span>- Motor number: </span>{" "}
            <span className=" text-muted-foreground  break-all">
              {car.motorNumber}
            </span>
          </div>{" "}
          <div className="">
            <span>- Chassie number: </span>{" "}
            <span className=" text-muted-foreground  break-all">
              {car.chassisNumber}
            </span>
          </div>{" "}
          <div className=" flex items-center gap-1 ">
            <span>- Color: </span>{" "}
            <div
              style={{
                backgroundColor: `${car.color ? car.color : "black"}`,
              }}
              className=" w-5 h-5 border rounded-md"
            />
          </div>
          <CarAction pageSize={pageSize} car={car} />
        </section>
      </Link>
    </Card>
  );
};

export default CarItem;
