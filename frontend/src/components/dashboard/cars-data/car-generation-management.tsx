import React from "react"
import CarGenerationForm from "./car-generation-form"
import { getAllCarModelsAction } from "@lib/actions/carModelsActions"
import { getAllCarMakersAction } from "@lib/actions/carMakerActions"
import CarModelForm from "@components/car-model-form"

import CarGenerationList from "./car-generation-list"
import CarModelsList from "./car-model-list"

const CarGenAndModelManagement = () => {
  const [carModels, carMakers] = await Promise.all([
    getAllCarModelsAction(),
    getAllCarMakersAction(),
    // getAllCarGenerationsAction(),
  ])
  const { data: modelsData, error: modelsError } = carModels

  const { data: carMakersData, error: carMakersError } = carMakers

  const models = modelsData?.models || []
  const modelsCount = modelsData?.count || 0

  // if (carGenerationsError || carMakersError)
  //   return <p>{carGenerationsError}</p>;

  return (
    <>
      <div className="space-y-3">
        <div className="flex flex-col justify-between gap-x-7 gap-y-2 rounded-lg border p-3 shadow-sm xs:flex-row xs:items-center">
          <div className="space-y-0.5">
            <label className="font-semibold">Car models</label>
            <p className="text-sm text-muted-foreground">Add car models.</p>
          </div>
          <div className="sm:pr-2">
            {/* <CarModelForm carMaker={carMakersData} /> */}
          </div>
        </div>

        <CarModelsList models={models} error={modelsError} />
      </div>
      <div className="space-y-3">
        <div className="flex flex-col justify-between gap-x-7 gap-y-2 rounded-lg border p-3 shadow-sm xs:flex-row xs:items-center">
          <div className="space-y-0.5">
            <label className="font-semibold">Car generation</label>
            <p className="text-sm text-muted-foreground">
              Create a new car generation.
            </p>
          </div>
          <div className="sm:pr-2">
            <CarGenerationForm
              carMakers={carMakersData || []}
              carModels={models}
            />
            {/* <CarInfoForm
          carGenerations={carGenerationsData}
          carMakers={carMakersData}
          carModels={carModelsData}
          /> */}
          </div>
        </div>

        <CarGenerationList />
      </div>
    </>
  )
}

export default CarGenAndModelManagement
