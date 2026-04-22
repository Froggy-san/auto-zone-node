import { createClient } from "@utils/supabase/client";

const supabase = createClient();

type ProductSold = { pricePerUnit: number; discount: number; count: number };

type ServiceFees = {
  price: number;
  discount: number;
};
type ServiceStatus = {
  name: string;
};

type Service = {
  id: string;
  serviceStatuses: ServiceStatus;
  productsToSell: {
    pricePerUnit: number;
    discount: number;
    count: number;
    totalPriceAfterDiscount: number;
    isReturned: boolean;
  }[];
  servicesFee: {
    price: number;
    discount: number;
    totalPriceAfterDiscount: number;
    isReturned: boolean;
  }[];
};

type Params = {
  dateFrom?: string;
  dateTo?: string;
  clientId?: string;
  carId?: string;
  serviceStatusId?: string;
  minPrice?: string;
  maxPrice?: string;
};

export async function getStats({
  dateFrom,
  dateTo,
  clientId,
  carId,
  serviceStatusId,
  minPrice,
  maxPrice,
}: Params) {
  let query = supabase
    .from("services")
    .select(
      "id,serviceStatuses(name),productsToSell(pricePerUnit,discount,count,totalPriceAfterDiscount,isReturned),servicesFee(price,discount,totalPriceAfterDiscount,isReturned)"
    );

  // const { data: services, error } = await supabase
  //   .from("services")
  //   .select(
  //     "id,serviceStatuses(name),productsToSell(pricePerUnit,discount,count,totalPriceAfterDiscount,isReturned),servicesFee(price,discount,totalPriceAfterDiscount,isReturned)"
  //   );

  if (clientId) query = query.eq("clientId", clientId);
  if (dateFrom)
    query = query.gte("created_at", new Date(dateFrom).toISOString());

  if (dateTo) query = query.lte("created_at", new Date(dateTo).toISOString());
  // Other filters
  if (carId) query = query.eq("carId", carId);

  if (serviceStatusId) query = query.eq("serviceStatusId", serviceStatusId);

  if (minPrice) query = query.gte("totalPrice", minPrice);

  if (maxPrice) query = query.lte("totalPrice", maxPrice);

  // const [soldProductsData, servicesFeeData] = await Promise.all([
  //   supabase
  //     .from("productsToSell")
  //     .select("pricePerUnit,discount,count,totalPriceAfterDiscount,isReturned"),
  //   supabase
  //     .from("servicesFee")
  //     .select("price,discount,totalPriceAfterDiscount,isReturned"),
  // ]);

  // const { data: productsSold, error: productsSoldError } = soldProductsData;
  // const { data: serviceFees, error: serviceFeesError } = servicesFeeData;
  const { data: services, error } = await query;
  if (error) {
    throw new Error(`Failed to fetch services: ${error.message}`);
  }

  if (!services) {
    throw new Error("Something went wrong while trying to grab the stats.");
  }

  const nonCanceledServices = services.filter((service) => {
    const serviceStatuses = Array.isArray(service.serviceStatuses)
      ? service.serviceStatuses[0].name
      : (service.serviceStatuses as { name: string });
    return serviceStatuses.name !== "Canceled";
  });

  const productsSold = nonCanceledServices.flatMap(
    (item) => item.productsToSell
  );

  const serviceFees = nonCanceledServices.flatMap((item) => item.servicesFee);

  const totalProductsSold = productsSold
    .filter((pro) => !pro.isReturned)
    .reduce(
      (acc, item) => {
        acc.totalPrice += item.pricePerUnit * item.count;
        acc.totalDiscount += item.discount * item.count;
        acc.totalUnits += item.count;
        return acc;
      },
      { totalPrice: 0, totalDiscount: 0, totalUnits: 0 }
    );

  const totalServicesPerformed = serviceFees
    .filter((fee) => !fee.isReturned)
    .reduce(
      (acc, item) => {
        acc.totalPrice += item.price;
        acc.totalDiscount += item.discount;
        return acc;
      },
      { totalPrice: 0, totalDiscount: 0 }
    );

  return { totalProductsSold, totalServicesPerformed };
}
