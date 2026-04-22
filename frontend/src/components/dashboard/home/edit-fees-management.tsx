import { getServiceFeesById } from "@lib/actions/serviceFeeAction";
import React from "react";

import { getAllCategoriesAction } from "@lib/actions/categoriesAction";
import { getServiceById } from "@lib/actions/serviceActions";
import FeesForm from "./fees-form";

const EditFeesManagement = async ({
  feesId,
  addFeeId,
}: {
  feesId?: string;
  addFeeId?: string;
}) => {
  let categoriesArr;
  let fee;

  if (feesId) {
    const data = await getServiceFeesById(feesId);
    fee = data;
  }

  const serviceId = fee ? fee.data.serviceId : Number(addFeeId);
  const [serviceData, categoriesData] = await Promise.all([
    getServiceById(serviceId, "id,totalPrice"),
    getAllCategoriesAction(),
  ]);

  const { data: service, error: serivceError } = serviceData;
  const { data: categories, error } = categoriesData;

  if (fee?.error || error) return <p>{fee?.error || error}</p>;
  //   if (!fee) return <div />;
  return (
    <FeesForm
      open={fee?.data || addFeeId ? true : false}
      addFeeId={addFeeId}
      categories={categories || []}
      feesToEdit={fee?.data}
      service={service}
    />
  );
};

export default EditFeesManagement;
