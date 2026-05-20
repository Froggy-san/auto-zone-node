import React from "react"
// import CarForm from "./car-form"

// import ServicesForm from "./services-form"
// import { getProductsAction } from "@/lib/actions/productsActions"
// import { getServiceStatusAction } from "@/lib/actions/serviceStatusAction"
import { cn } from "@/lib/utils"
import type { Car } from "@/types/carTypes"
import ServiceForm from "@/features/services/ServiceForm"
import { Button } from "../ui/button"
// import { getAllCategoriesAction } from "@/lib/actions/categoriesAction"

interface Client {
  name: string
  email: string
  id: number | undefined
}

const ServiceManagement = ({
  carToEdit,
  car,
  useParams,
  className,
}: {
  car: Car
  useParams?: boolean
  carToEdit?: Car
  className?: string
}) => {
  const [open, setOpen] = React.useState(false)
  // const [productsData, serviceStatusData, categories] = await Promise.all([
  //   getProductsAction({}),
  //   getServiceStatusAction(),
  //   getAllCategoriesAction(),
  // ])

  // const { data: products, error: productError } = productsData
  // const { data: serviceStatus, error: serviceStatusError } = serviceStatusData
  // const { data: categoriesData, error: categoriesError } = categories
  // if (productError || serviceStatusError)
  //   return <p>{productError || serviceStatusError}</p>

  // if (!products || !car || !client) return <p>Soemthng went wrong</p>
  return (
    <div
      className={cn(
        "flex w-full flex-col justify-between gap-x-7 gap-y-2 rounded-lg border p-3 shadow-sm xs:flex-row xs:items-center",
        className
      )}
    >
      <div className="space-y-0.5">
        <label className="font-semibold">Add service</label>
        <p className="text-sm text-muted-foreground">
          {carToEdit ? "Edit car" : "Issue a receipt for this car."}
        </p>
      </div>
      <div className="sm:pr-2">
        {/* <Button onClick={() => setOpen(true)}>Add Service</Button> */}
        <ServiceForm open={open} setOpen={setOpen} car={car} />

        {/* <ServicesForm
          categories={categoriesData || []}
          client={client}
          car={car}
          products={products}
          serviceStatus={serviceStatus || []}
        /> */}
      </div>
    </div>
  )
}

export default ServiceManagement
