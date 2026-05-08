import React from "react"
// import CarItem from "./car-item"
import { Car } from "lucide-react"
import ErrorMessage from "@/components/error-message"
import type { Car as CarType, User } from "@/types"
import useCars from "@/features/cars/useCars"
import { getParam } from "@/lib/getParam"
import { useSearchParams } from "react-router"
import CarItem from "./car-item"
import GaragePagination from "./garage-pagination"

// interface CarsListProps {
//   color: string;
//   plateNumber: string;
//   chassisNumber: string;
//   motorNumber: string;
//   clientId: string;
//   carGenerationId: string;
//   pageNumber: string;
//   carMakerId: string;
//   carModelId: string;
// }

interface CarsListProps {
  cars: CarType[]
  count: number
}
const CarsList = ({ cars, count }: CarsListProps) => {
  return (
    <>
      <ul className="grid grid-cols-1 gap-3 border-t px-2 pt-2">
        {cars &&
          cars.map((car) => (
            <CarItem pageSize={cars.length} key={car.id} car={car} />
          ))}
      </ul>

      <GaragePagination count={count} />
    </>
  )
}

export default CarsList

// const CarsList = async ({
//   color,
//   plateNumber,
//   chassisNumber,
//   motorNumber,
//   clientId,
//   carGenerationId,
//   pageNumber,
//   carMakerId,
//   carModelId,
// }: CarsListProps) => {
//   const { data, error } = await getCarsAction({
//     pageNumber,
//     plateNumber,
//     chassisNumber,
//     motorNumber,
//     clientId,
//     carInfoId: carGenerationId,
//     color,
//     carMakerId,
//     carModelId,
//   });

//   if (error) return <ErrorMessage>{error}</ErrorMessage>;
//   if (!data) return <p>Something went wrong</p>;
//   if (!data.length)
//     return (
//       <div className=" h-32  text-center  flex flex-col-reverse   font-semibold  items-center gap-2 justify-center">
//         No cars. <Car className=" w-10 h-10  " />
//       </div>
//     );

//   return (
//     <ul className="  gap-3 border-t  px-2 pt-2 grid grid-cols-1">
//       {data &&
//         data.map((car: CarItemProps) => (
//           <CarItem pageSize={data.length} key={car.id} car={car} />
//         ))}
//     </ul>
//   );
// };

// export default CarsList;
