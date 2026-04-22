import { ProductBrand } from "../models/productBrand";

import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "../utils/controllerFactory";

export const createProductBrand = createOne(ProductBrand);

export const getProductBrands = getAll(ProductBrand);

export const getProductBrand = getOne(ProductBrand);

export const updateProductBrand = updateOne(ProductBrand);
export const deleteProductBrand = deleteOne(ProductBrand);
