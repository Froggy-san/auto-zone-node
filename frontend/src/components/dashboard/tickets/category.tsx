import CloseButton from "@components/close-button";
import Spinner from "@components/Spinner";
import { TicketCategory } from "@lib/types";
import { cn } from "@lib/utils";
import React from "react";

const Category = ({
  category,
  setEdit,
  setDeleteId,
  isLoading,
  className,
}: {
  category: TicketCategory;
  setEdit: React.Dispatch<React.SetStateAction<number | null>>;
  setDeleteId: React.Dispatch<React.SetStateAction<number | null>>;

  isLoading: boolean;
  className?: string;
}) => {
  return (
    <li
      onClick={() => setEdit(category.id)}
      className={cn(" relative ", className)}
    >
      <span>{category.name}</span>
      {isLoading ? (
        <Spinner className=" h-4 w-4" />
      ) : (
        <CloseButton
          className=" top-[unset] left-[unset] static ml-auto"
          onClick={(e) => {
            e.stopPropagation();
            setDeleteId(category.id);
          }}
        />
      )}
    </li>
  );
};

export default Category;
