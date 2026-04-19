import React from "react";
import ProductTypeForm from "../product-type-form";
import { getAllProductTypes } from "@lib/data-service";
import ErrorMessage from "@components/error-message";

import PillList from "./pill-list";
import { getAllProductTypesAction } from "@lib/actions/productTypeActions";

const ProductTypes = async () => {
  const { data, error } = await getAllProductTypesAction();
  return (
    <section className=" space-y-2">
      <ProductTypeForm />
      {error ? (
        <ErrorMessage>{error}</ErrorMessage>
      ) : (
        <PillList itemType="productType" items={data || []} />
      )}
    </section>
  );
};

export default ProductTypes;
