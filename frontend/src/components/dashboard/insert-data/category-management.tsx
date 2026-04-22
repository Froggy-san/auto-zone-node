import React from "react";
import CategroyForm from "./category-form";

const CategoryManagement = () => {
  return (
    <div className="flex  flex-col  gap-y-2 xs:flex-row xs:items-center justify-between rounded-lg border p-3 shadow-sm gap-x-7">
      <div className="space-y-0.5   ">
        <label htmlFor="z" className=" font-semibold">
          Category
        </label>
        <p className=" text-muted-foreground text-sm">Add product category.</p>
      </div>
      <div className=" flex items-center  gap-3 sm:pr-2">
        <CategroyForm showBtn />
      </div>
    </div>
  );
};

export default CategoryManagement;
