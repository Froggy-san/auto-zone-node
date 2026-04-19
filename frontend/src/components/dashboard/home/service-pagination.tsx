import React from "react";
import PaginationControl from "../../pagination-controls";
import { getClientsCountAction } from "@lib/actions/clientActions";
import { getProductBrandsCountAction } from "@lib/actions/productBrandsActions";
import { getProductsRestockingBillsCountAction } from "@lib/actions/restockingBillActions";
import { getServicesCountAction } from "@lib/actions/serviceActions";

interface ServicePaginationProps {
  pageNumber: string;
  dateFrom?: string;
  dateTo?: string;
  clientId?: string;
  carId?: string;
  serviceStatusId?: string;
  minPrice?: string;
  maxPrice?: string;
}
const ServicePagination = async ({
  pageNumber,
  dateFrom,
  dateTo,
  clientId,
  carId,
  serviceStatusId,
  minPrice,
  maxPrice,
}: ServicePaginationProps) => {
  const { data, error } = await getServicesCountAction({
    dateFrom,
    dateTo,
    clientId,
    carId,
    minPrice,
    maxPrice,
    serviceStatusId,
  });

  if (error) return <p>{error}</p>;
  return <PaginationControl count={data} currPage={pageNumber} />;
};

export default ServicePagination;
