import CarkMakerForm from "@components/dashboard/cars-data/car-maker-form"
import React from "react"

const CarMakerManagement = () => {
  return (
    <div className="flex flex-col justify-between gap-x-7 gap-y-2 rounded-lg border p-3 shadow-sm xs:flex-row xs:items-center">
      <div className="space-y-0.5">
        <label className="font-semibold">Car makers</label>
        <p className="text-sm text-muted-foreground">Add car makers.</p>
      </div>
      <div className="sm:pr-2">
        <CarkMakerForm />
      </div>
    </div>
  )
}

export default CarMakerManagement
