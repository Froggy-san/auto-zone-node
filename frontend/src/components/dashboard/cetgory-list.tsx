import { getAllCategoriesAction } from "@lib/actions/categoriesAction";
import React from "react";

const CategoryList = async () => {
  const { data, error } = await getAllCategoriesAction();
  if (error) return <p>{error}</p>;
  return (
    <div className="min-h-[450px] mt-10">
      <h3 className=" tracking-wider font-semibold text-2xl">CATEGORIES</h3>
      <ul className=" flex flex-wrap gap-5 ">
        {data &&
          data.map((category: { id: number; name: string }, i: number) => (
            <div key={i}>{category.name}</div>
          ))}
      </ul>
    </div>
  );
};

export default CategoryList;
