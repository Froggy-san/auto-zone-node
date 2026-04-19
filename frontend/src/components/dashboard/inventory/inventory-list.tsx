import React from "react";

import { getClientsAction } from "@lib/actions/clientActions";
import InventoryTable from "./inventory-table";
import { getProductsBoughtAction } from "@lib/actions/productBoughtActions";
import { getRestockingBillsAction } from "@lib/actions/restockingBillActions";
import PaginationControl from "@components/pagination-controls";

interface ClientListProps {
  // Add the properties you expect in searchParam
  // query: string;
  pageNumber: string;
  name?: string;
  shopName?: string;
  dateOfOrderFrom?: string;
  dateOfOrderTo?: string;
  minTotalPrice?: string;
  maxTotalPrice?: string;
}
const InventoryList = async ({
  pageNumber,
  name,
  shopName,
  dateOfOrderFrom,
  dateOfOrderTo,
  minTotalPrice,
  maxTotalPrice,
}: ClientListProps) => {
  const { data: inventoryData, error } = await getRestockingBillsAction({
    pageNumber,
    name,
    shopName,
    dateOfOrderFrom,
    dateOfOrderTo,
    minTotalPrice,
    maxTotalPrice,
  });

  if (error) return <p>{error}</p>;

  return (
    <div>
      <InventoryTable
        currPage={pageNumber}
        productBought={inventoryData?.data || []}
      />
      {inventoryData?.count && (
        <PaginationControl count={inventoryData.count} currPage={pageNumber} />
      )}
    </div>
  );
};

export default InventoryList;
