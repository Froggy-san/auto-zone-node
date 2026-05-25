import ProductImages from "@/components/products/product-images"
import { Card } from "@/components/ui/card"
import CarAction from "./car-item-actions"

import { CircleUser, ImageOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatNumber } from "@/lib/helper"
import type { Car, CarList, User } from "@/types"
import { Link } from "react-router"
import { BASE_URL } from "@/lib/constants"

const CarItem = ({ car, pageSize }: { pageSize?: number; car: CarList }) => {
  const carImages = car.carImages.map((image) => image.imagePath)

  const viewedImages = carImages.length ? carImages : []
  const carInfo = car.carGeneration
  const carModel = carInfo.carModel
  const carMaker = carModel.carMaker

  return (
    <Card className="mx-auto min-h-[250px] w-full max-w-[2000px] border p-0">
      <Link
        to={`/garage/${car.user}?car=${car._id}`}
        className="relative flex h-full w-full flex-col items-start lg:flex-row"
      >
        <div className="h-full min-h-[250px] w-full flex-1 md:min-w-[350px] lg:min-h-[300px] lg:min-w-[470px]">
          {/* md:min-w-[270px] */}
          {viewedImages.length ? (
            <ProductImages
              imageUrls={viewedImages}
              className="h-full overflow-hidden rounded-tl-xl rounded-tr-xl lg:rounded-tr-none lg:rounded-bl-xl"
            />
          ) : (
            <div className="flex h-full items-center justify-center rounded-tl-xl rounded-tr-xl bg-foreground/10 md:rounded-tr-none md:rounded-bl-xl">
              <ImageOff className="h-20 w-20" />
            </div>
          )}
        </div>
        <section className="w-full">
          <div className="relative flex h-full flex-wrap items-start gap-2 px-3 py-4 sm:pr-10 lg:pr-[25%] lg:pl-7">
            <Badge variant="secondary" className="gap-2">
              {carMaker.logo ? (
                <img
                  src={`${BASE_URL}/${carMaker.logo}`}
                  alt={`${carMaker.name} logo`}
                  className="h-7 object-contain"
                />
              ) : null}{" "}
              <span>{carMaker.name} </span>
            </Badge>
            <Badge variant="secondary" className="gap-2">
              {carModel.image ? (
                <img
                  src={carModel.image}
                  alt={`${carModel.name} Image`}
                  className="h-7 object-contain"
                />
              ) : null}{" "}
              <span>{carModel.name} </span>
            </Badge>

            <Badge variant="secondary" className="gap-2">
              {carInfo.image ? (
                <img
                  src={`${BASE_URL}/${carInfo.image}`}
                  alt={`${carInfo.name} Image`}
                  className="h-7 object-contain"
                />
              ) : null}{" "}
              <span>{carInfo.name} </span>
            </Badge>

            <Badge variant="secondary" className="gap-2">
              <span>Color </span>
              <div
                style={{
                  backgroundColor: `${car.color ? car.color : "black"}`,
                }}
                className="h-5 w-5 rounded-md border"
              />
            </Badge>

            <Badge variant="secondary" className="gap-2">
              <span>Plate Number </span>
              <span>{car.plateNumber}</span>
            </Badge>

            <Badge variant="secondary" className="gap-2">
              <span>Chassis</span>
              <span>{car.chassisNumber}</span>
            </Badge>

            <Badge variant="secondary" className="gap-2">
              <span>Motor</span>
              <span>{formatNumber(Number(car.motorNumber))}</span>
            </Badge>
            <Badge variant="secondary" className="gap-2">
              <span>KM</span>
              <span>{formatNumber(Number(car.odometer))}</span>
            </Badge>
            {car.user && (
              <Badge variant="secondary" className="gap-2">
                {car.user.picture ? (
                  <img
                    src={`${BASE_URL}/${car.user.picture}`}
                    alt={`${car.user?.username} Profile picture`}
                    className="h-4 w-4 rounded-full object-cover"
                  />
                ) : (
                  <CircleUser className="h-5 w-5" />
                )}{" "}
                <span>{car.user?.username} </span>
              </Badge>
            )}
          </div>
          <CarAction pageSize={pageSize} car={car} />
        </section>
      </Link>
    </Card>
  )
}

export default CarItem
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
