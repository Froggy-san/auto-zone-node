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
  cars: CarType[] | undefined
  error: string
  clients: User[]
}
const CarsList = () => {
  const [searchParams] = useSearchParams()
  const page = getParam(searchParams, "page", "1")
  const { data, isLoading, error } = useCars({ page, limit: "12" })

  const cars = data?.data
  if (!isLoading && error) return <ErrorMessage>{error.message}</ErrorMessage>
  if (!cars && !isLoading) return <p>Something went wrong</p>
  if (!cars?.length && !isLoading)
    return (
      <div className="flex h-32 flex-col-reverse items-center justify-center gap-2 text-center font-semibold">
        No cars. <Car className="h-10 w-10" />
      </div>
    )

  return (
    <>
      <ul className="grid grid-cols-1 gap-3 border-t px-2 pt-2">
        {cars &&
          cars.map((car) => (
            <CarItem pageSize={cars.length} key={car.id} car={car} />
          ))}
      </ul>

      <GaragePagination count={data?.pagination.totalCount || 0} />
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
