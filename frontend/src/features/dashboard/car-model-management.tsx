import CarModelForm from "@components/car-model-form"
import { getAllCarMakersAction } from "@lib/actions/carMakerActions"

import React from "react"

const CarModelManagement = () => {
  const { data, error } = await getAllCarMakersAction()

  if (error) return <p>{error}</p>
  return (
    <div className="flex flex-col justify-between gap-x-7 gap-y-2 rounded-lg border p-3 shadow-sm xs:flex-row xs:items-center">
      <div className="space-y-0.5">
        <label className="font-semibold">Car models</label>
        <p className="text-sm text-muted-foreground">Add car models.</p>
      </div>
      <div className="sm:pr-2">{/* <CarModelForm carMakers={data} /> */}</div>
    </div>
  )
}

export default CarModelManagement
