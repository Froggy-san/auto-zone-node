import React from "react";
import PaginationControl from "../../pagination-controls";
import { getClientsCountAction } from "@lib/actions/clientActions";
import { getProductBrandsCountAction } from "@lib/actions/productBrandsActions";
import { getProductsRestockingBillsCountAction } from "@lib/actions/restockingBillActions";

interface InventoryPaginationProps {
  pageNumber: string;
  shopName?: string;
  dateOfOrderFrom?: string;
  dateOfOrderTo?: string;
  minTotalPrice?: string;
  maxTotalPrice?: string;
}

const InventoryPagination = async ({
  pageNumber,
  shopName,
  dateOfOrderFrom,
  dateOfOrderTo,
  minTotalPrice,
  maxTotalPrice,
}: InventoryPaginationProps) => {
  const { data, error } = await getProductsRestockingBillsCountAction({
    shopName,
    dateOfOrderFrom,
    dateOfOrderTo,
    minTotalPrice,
    maxTotalPrice,
  });

  if (error) return <p>{error}</p>;
  return <PaginationControl count={data} currPage={pageNumber} />;
};

export default InventoryPagination;
