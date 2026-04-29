import CarMakerManagement from "@components/dashboard/cars-data/car-makers-managment"
import CarGenAndModelManagement from "@components/dashboard/cars-data/car-generation-management"
import CarMakerList from "@components/dashboard/cars-data/car-makers-list"
import { Metadata } from "next"

import React from "react"
export const metadata: Metadata = {
  title: "Cars Data",
}
const Page = () => {
  return (
    <main>
      <h2 className="text-4xl font-semibold">CARS DATA.</h2>
      <section className="pb-16 sm:pl-4">
        <div className="mt-12 space-y-40">
          <div className="space-y-3">
            <CarMakerManagement />
            <CarMakerList />
          </div>
          {/* <CarModelsList /> */}
          {/* <CarGenAndModelManagement /> */}
        </div>
      </section>
    </main>
  )
}

export default Page
