import React from "react";
import CategroyForm from "../category-from";
import { getAllCategoriesAction } from "@lib/actions/categoriesAction";
import ErrorMessage from "@components/error-message";

import PillList from "./pill-list";

const Categories = async () => {
  const { data, error } = await getAllCategoriesAction();

  if (error) return <ErrorMessage>{error}</ErrorMessage>;
  return (
    <section className=" space-y-2">
      <CategroyForm />
      {error ? (
        <ErrorMessage>{error}</ErrorMessage>
      ) : (
        <PillList itemType="category" items={data || []} />
      )}
      {/* <CategoriesManagement /> */}
    </section>
  );
};

export default Categories;
