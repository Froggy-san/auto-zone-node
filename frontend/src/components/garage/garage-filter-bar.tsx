import React from "react"

import GarageFilter from "./garage-fiter"
import type { CarMaker, User } from "@/types"
import useCars from "@/features/cars/useCars"

interface CarsListProps {
  color: string
  plateNumber: string
  chassisNumber: string
  motorNumber: string
  clientId: string
  carGenerationId: string
  // carGenerations: CarGenerationProps[] | null;
  // clients: User[]
  // carMakers: CarMaker[]
  // carModels: CarModelProps[];
  pageNumber: string

  carMakerId: string
  carModelId: string
}
const GarageFilterbar: React.FC<CarsListProps> = ({
  // clients,
  ...props
}) => {
  const { data } = useCars()
  return (
    <aside className={`sm:w-[210px] sm:border-t sm:border-r 3xl:w-[300px]`}>
      <GarageFilter count={data?.pagination.totalCount || 0} {...props} />
    </aside>
  )
}

export default GarageFilterbar
