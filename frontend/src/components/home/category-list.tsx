"use client";
import { CategoryProps } from "@lib/types";
import React, { useState } from "react";
import Category from "./category";
import CategoryDetails from "./category-details";

const CategoryList = ({ categories }: { categories: CategoryProps[] }) => {
  const [selectedCategory, setSelectedCategory] = useState<
    number | undefined
  >();

  const showDetailsOfCat = categories.find(
    (cat) => cat.id === selectedCategory
  );
  return (
    <div className="my-20 space-y-12  max-w-[1200px] mx-auto ">
      <h2 className="  ml-2  md:ml-6 font-semibold  text-lg sm:text-2xl lg:text-3xl">
        Most popular categories.
      </h2>
      <ul className=" grid  items-center justify-end   gap-4  grid-cols-3  md:grid-cols-4  lg:grid-cols-5   xl:grid-cols-6">
        {categories.map((item) => (
          <Category
            key={item.id}
            category={item}
            setSelectedCategory={setSelectedCategory}
          />
        ))}
      </ul>

      <CategoryDetails
        category={showDetailsOfCat}
        setSelectedCategory={setSelectedCategory}
      />
    </div>
  );
};

export default CategoryList;
