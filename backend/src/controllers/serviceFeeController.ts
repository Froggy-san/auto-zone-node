import { ServiceFee } from "../models/serviceFeeModel";

import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "../utils/controllerFactory";

export const getAllServiceFees = getAll(ServiceFee);

export const getServiceFee = getOne(ServiceFee);
export const createServiceFee = createOne(ServiceFee);

export const updateServiceFee = updateOne(ServiceFee);
export const deleteServiceFee = deleteOne(ServiceFee);
