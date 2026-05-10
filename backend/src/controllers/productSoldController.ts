import { ProductSold } from "../models/productSoldModel";

import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "../utils/controllerFactory";

export const getAllProductSold = getAll(ProductSold);

export const getProductSold = getOne(ProductSold);
export const createProductSold = createOne(ProductSold);

export const updateProductSold = updateOne(ProductSold);
export const deleteProductSold = deleteOne(ProductSold);
