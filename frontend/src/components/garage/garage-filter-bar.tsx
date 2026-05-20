import React from "react"

import GarageFilter from "./garage-fiter"

// interface CarsListProps {
//   color: string
//   plateNumber: string
//   chassisNumber: string
//   motorNumber: string
//   clientId: string
//   carGenerationId: string
//   // carGenerations: CarGenerationProps[] | null;
//   // clients: User[]
//   // carMakers: CarMaker[]
//   // carModels: CarModelProps[];
//   pageNumber: string

//   carMakerId: string
//   carModelId: string
// }
interface CarsListProps {
  page: string
  limit: string
  color: string
  chassisNumber: string
  motorNumber: string
  user: string
  carGeneration: string
  plateNumber: string
  // pageNumber: string
  carMaker: string
  carModel: string
  count: number
}
const GarageFilterbar: React.FC<CarsListProps> = ({
  // clients,

  ...props
}) => {
  return (
    <aside className={`sm:w-[210px] sm:border-t sm:border-r 3xl:w-[300px]`}>
      <GarageFilter {...props} />
    </aside>
  )
}

export default GarageFilterbar
