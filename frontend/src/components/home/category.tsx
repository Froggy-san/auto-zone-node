"use client";
import { CategoryProps } from "@lib/types";
import { cn } from "@lib/utils";
import React from "react";

const Category = ({
  category,
  setSelectedCategory,
}: {
  category: CategoryProps;
  setSelectedCategory: React.Dispatch<React.SetStateAction<number | undefined>>;
}) => {
  return (
    <li
      onClick={() => setSelectedCategory(category.id)}
      className={cn(
        `relative   px-3 py-2 flex flex-col  items-center justify-between    hover:bg-accent/30  transition-all cursor-pointer  gap-2 text-sm   rounded-xl `
      )}
    >
      {category.image ? (
        <img
          loading="lazy"
          src={category.image}
          alt={`${category.name} image`}
          className="  h-20 sm:h-24 block  object-contain"
        />
      ) : null}

      <p className=" font-semibold text-center text-xs  sm:text-sm text-muted-foreground">
        {category.name}
      </p>
    </li>
  );
};

export default Category;
