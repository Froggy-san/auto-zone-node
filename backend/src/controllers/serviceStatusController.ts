import { ServiceStatus } from "../models/serviceStatusModel";
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "../utils/controllerFactory";

export const getAllServiceStatuses = getAll(ServiceStatus);
export const getServiceStatus = getOne(ServiceStatus);
export const createServiceStatus = createOne(ServiceStatus);
export const updateServiceStatus = updateOne(ServiceStatus);
export const deleteServiceStatus = deleteOne(ServiceStatus);
