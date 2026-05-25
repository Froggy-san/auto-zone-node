import { getServiceFeesById } from "@/lib/actions/serviceFeeAction"
import React from "react"

import { getAllCategoriesAction } from "@/lib/actions/categoriesAction"
import { getServiceById } from "@/lib/actions/serviceActions"
import FeesForm from "./fees-form"
import useServiceFeeById from "@/features/services/useServiceFeeById"

const EditFeesManagement = ({
  feesId,
  addFeeId,
}: {
  feesId?: string
  addFeeId?: string
}) => {
  let categoriesArr
  let fee

  // if (feesId) {
  //   const data = await getServiceFeesById(feesId)
  //   fee = data
  // }

  const { data: serviceFee, isLoading } = useServiceFeeById(feesId)

  const serviceId = serviceFee ? serviceFee.service : Number(addFeeId)

  const [serviceData, categoriesData] = await Promise.all([
    getServiceById(serviceId, "id,totalPrice"),
    getAllCategoriesAction(),
  ])

  const { data: service, error: serivceError } = serviceData
  const { data: categories, error } = categoriesData

  if (fee?.error || error) return <p>{fee?.error || error}</p>
  //   if (!fee) return <div />;
  return (
    <FeesForm
      open={fee?.data || addFeeId ? true : false}
      addFeeId={addFeeId}
      categories={categories || []}
      feesToEdit={fee?.data}
      service={service}
    />
  )
}

export default EditFeesManagement
