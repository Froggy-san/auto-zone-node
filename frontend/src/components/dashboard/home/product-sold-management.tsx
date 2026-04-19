import React from "react";

import EditSoldForm from "./edit-sold-form";
import { getProductToSellById } from "@lib/actions/product-sold-actions";
import { getProductsAction } from "@lib/actions/productsActions";
import { getServiceById } from "@lib/actions/serviceActions";

const ProductSoldManagement = async ({
  editSold,
  addSoldId,
}: {
  editSold?: string;
  addSoldId?: string;
}) => {
  let proById;
  let products;
  if (editSold) {
    const data = await getProductToSellById(editSold);
    //  const relatedPro = await getProductsAction({id:data});
    proById = data;
  }

  if (addSoldId) {
    const data = await getProductsAction({});
    products = data;
  }
  const serviceId = proById?.data
    ? proById.data.serviceId
    : Number(addSoldId) || 0;
  const { data, error } = await getServiceById(serviceId);

  //   const { data: fee, error } = feesToEdit;
  //   const { data: CategoriesData, error: categoriesErorr } = categories;

  if (proById?.error || products?.error)
    return <p>{proById?.error || products?.error}</p>;
  //   if (!fee) return <div />;
  return (
    <EditSoldForm
      open={proById || addSoldId ? true : false}
      proSold={proById?.data}
      products={products?.data || []}
      addSoldId={addSoldId}
      service={data}
    />
  );
};

export default ProductSoldManagement;
