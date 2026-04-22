import ProductImages from "@components/products/product-images";
import { Card } from "@components/ui/card";
import { CarItem as CarItemProps, ClientWithPhoneNumbers } from "@lib/types";
import React from "react";
import CarAction from "./car-item-actions";
import Link from "next/link";
import { CircleUser, ImageOff } from "lucide-react";
import { Badge } from "@components/ui/badge";
import { formatNumber } from "@lib/helper";

const CarItem = ({
  clientId,
  client,
  car,
  pageSize,
}: {
  clientId?: number;
  client: ClientWithPhoneNumbers | undefined;
  pageSize?: number;
  car: CarItemProps;
}) => {
  const carImages = car.carImages.map((image) => image.imagePath);

  const viewedImages = carImages.length ? carImages : [];
  const carInfo = car.carGenerations;
  const carModel = carInfo.carModels;
  const carMaker = carModel.carMakers;

  return (
    <Card className="   border w-full   max-w-[2000px] mx-auto  min-h-[250px]">
      <Link
        prefetch={false}
        href={`/garage/${car.clientId || clientId}?car=${car.id}`}
        className="  flex  flex-col items-start  lg:flex-row h-full w-full relative "
      >
        <div className="  h-full  min-h-[250px] lg:min-h-[300px]   w-full  md:min-w-[350px]  lg:min-w-[470px] flex-1 ">
          {/* md:min-w-[270px] */}
          {viewedImages.length ? (
            <ProductImages
              imageUrls={viewedImages}
              className=" h-full  rounded-tl-xl rounded-tr-xl lg:rounded-tr-none  lg:rounded-bl-xl  overflow-hidden"
            />
          ) : (
            <div className=" h-full flex items-center justify-center  bg-foreground/10   rounded-tl-xl rounded-tr-xl md:rounded-tr-none  md:rounded-bl-xl">
              <ImageOff className=" w-20 h-20" />
            </div>
          )}
        </div>
        <section className="  w-full ">
          <div className=" flex   items-start    flex-wrap gap-2  sm:pr-10 lg:pr-[25%] py-4 px-3 relative h-full lg:pl-7">
            <Badge variant="secondary" className="  gap-2 ">
              {carMaker.logo ? (
                <img
                  src={carMaker.logo}
                  alt={`${carMaker.name} logo`}
                  className=" h-7 object-contain"
                />
              ) : null}{" "}
              <span>{carMaker.name} </span>
            </Badge>
            <Badge variant="secondary" className="  gap-2 ">
              {carModel.image ? (
                <img
                  src={carModel.image}
                  alt={`${carModel.name} Image`}
                  className=" h-7 object-contain"
                />
              ) : null}{" "}
              <span>{carModel.name} </span>
            </Badge>

            <Badge variant="secondary" className="  gap-2 ">
              {carInfo.image ? (
                <img
                  src={carInfo.image}
                  alt={`${carInfo.name} Image`}
                  className=" h-7 object-contain"
                />
              ) : null}{" "}
              <span>{carInfo.name} </span>
            </Badge>

            <Badge variant="secondary" className="  gap-2 ">
              <span>Color </span>
              <div
                style={{
                  backgroundColor: `${car.color ? car.color : "black"}`,
                }}
                className=" w-5 h-5 border rounded-md"
              />
            </Badge>

            <Badge variant="secondary" className="  gap-2 ">
              <span>Plate Number </span>
              <span>{car.plateNumber}</span>
            </Badge>

            <Badge variant="secondary" className="  gap-2 ">
              <span>Chassis</span>
              <span>{car.chassisNumber}</span>
            </Badge>

            <Badge variant="secondary" className="  gap-2 ">
              <span>Motor</span>
              <span>{formatNumber(Number(car.motorNumber))}</span>
            </Badge>
            <Badge variant="secondary" className="  gap-2 ">
              <span>KM</span>
              <span>{formatNumber(Number(car.odometer))}</span>
            </Badge>
            {client && (
              <Badge variant="secondary" className="  gap-2 ">
                {client.picture ? (
                  <img
                    src={client.picture}
                    alt={`${client.name} Profile picture`}
                    className=" h-7 w-7 object-cover rounded-full"
                  />
                ) : (
                  <CircleUser className=" w-5 h-5" />
                )}{" "}
                <span>{client.name} </span>
              </Badge>
            )}
          </div>
          <CarAction pageSize={pageSize} car={car} />
        </section>
      </Link>
    </Card>
  );
};

export default CarItem;
{
  /*
    <section className="  w-full  xl:pl-14   text-xs  grid grid-cols-1 items-center xs:grid-cols-2 h-fit   md:grid-cols-1 lg:grid-cols-2  md:w-[65%] gap-y-2 gap-x-3 md:gap-y-3 md:gap-x-0  p-3 lg:max-w-[900px]    md:pr-10">
        
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
  */
}
