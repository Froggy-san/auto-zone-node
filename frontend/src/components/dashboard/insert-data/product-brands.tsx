import React from "react";
import ProductTypeForm from "../product-type-form";
import { getAllProductBrands } from "@lib/data-service";
import ErrorMessage from "@components/error-message";
import PillList from "./pill-list";
import { getAllProductBrandsAction } from "@lib/actions/productBrandsActions";
import ProductBrandForm from "../product-brand-form";

const ProductBrands = async () => {
  const { data, error } = await getAllProductBrandsAction();
  return (
    <section className="  space-y-2">
      <ProductBrandForm />
      {error ? (
        <ErrorMessage>{error}</ErrorMessage>
      ) : (
        <PillList items={data || []} itemType="productBrand" />
      )}
    </section>
  );
};

export default ProductBrands;
