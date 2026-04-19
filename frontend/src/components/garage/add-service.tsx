import React from "react";
import CarForm from "./car-form";
import { CarItem, PhoneNumber } from "@lib/types";
import ServicesForm from "./services-form";
import { getProductsAction } from "@lib/actions/productsActions";
import { getServiceStatusAction } from "@lib/actions/serviceStatusAction";
import { cn } from "@lib/utils";
import { getAllCategoriesAction } from "@lib/actions/categoriesAction";

interface Client {
  name: string;
  email: string;
  id: number | undefined;
  phones: PhoneNumber[];
}

const ServiceManagement = async ({
  carToEdit,
  className,
  car,
  client,
  useParams,
}: {
  useParams?: boolean;
  carToEdit?: CarItem;
  className?: string;
  car?: CarItem;
  client?: Client;
}) => {
  const [productsData, serviceStatusData, categories] = await Promise.all([
    getProductsAction({}),
    getServiceStatusAction(),
    getAllCategoriesAction(),
  ]);

  const { data: products, error: productError } = productsData;
  const { data: serviceStatus, error: serviceStatusError } = serviceStatusData;
  const { data: categoriesData, error: categoriesError } = categories;
  if (productError || serviceStatusError)
    return <p>{productError || serviceStatusError}</p>;
  console.log(products);
  if (!products || !car || !client) return <p>Soemthng went wrong</p>;
  return (
    <div
      className={cn(
        "flex  flex-col   w-full gap-y-2 xs:flex-row xs:items-center justify-between rounded-lg border p-3 shadow-sm gap-x-7 ",
        className
      )}
    >
      <div className="space-y-0.5   ">
        <label className=" font-semibold">Add service</label>
        <p className=" text-muted-foreground text-sm">
          {carToEdit ? "Edit car" : "Issue a receipt for this car."}
        </p>
      </div>
      <div className=" sm:pr-2">
        <ServicesForm
          categories={categoriesData}
          client={client}
          car={car}
          products={products}
          serviceStatus={serviceStatus || []}
        />
      </div>
    </div>
  );
};

export default ServiceManagement;
