"use client";
import { CategoryProps } from "@lib/types";
import React, { useState } from "react";
import Category from "./categroy";
import CategoryDetails from "./category-details";
import CategroyForm from "./category-form";
import { cn } from "@lib/utils";
interface Props {
  className?: string;
  categories: CategoryProps[];
}
const CategoryList = ({ categories, className }: Props) => {
  const [catToEdit, setCatToEdit] = useState<number | null>();
  const [openDetails, setOpenDetails] = useState<number | null>();
  const categoryToEdit = categories.find((cat) => cat.id === catToEdit);
  const currCategory = categories.find((cat) => cat.id === openDetails);
  return (
    <>
      <ul
        className={cn(
          "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5  xl:grid-cols-7 gap-3  items-center",
          className
        )}
      >
        {categories.map((category) => (
          <Category
            key={category.id}
            category={category}
            setCatToEdit={() => setCatToEdit(category.id)}
            setOpenDetails={() => setOpenDetails(category.id)}
          />
        ))}
      </ul>

      <CategoryDetails
        open={!!currCategory}
        setOpen={() => setOpenDetails(null)}
        category={currCategory}
      />

      <CategroyForm
        open={!!catToEdit}
        setOpen={() => setCatToEdit(null)}
        categoryToEdit={categoryToEdit}
      />
    </>
  );
};

export default CategoryList;
