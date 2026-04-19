"use client";

import { ProductType } from "@lib/types";
import React, { useCallback, useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@components/ui/accordion";
import { Button } from "@components/ui/button";
import { MoveLeft, MoveRight } from "lucide-react";
import useLocalPagination from "@hooks/use-local-pagination";
import PillITem from "./PillItem";
import ErrorMessage from "@components/error-message";
type ItemType = "category" | "productType" | "productBrand";
const PillList = ({
  itemType,
  items,
}: {
  itemType: ItemType;
  items: ProductType[];
}) => {
  const [page, setPage] = useState(1);

  const { result, totalPages } = useLocalPagination({
    currPage: page,
    pageSize: 32,
    arr: items,
  });

  const handleResetPage = useCallback(() => {
    if (result.length === 1 && page > 1) {
      setPage((page) => page - 1);
    }
  }, [result.length, setPage]);

  if (!items.length)
    return (
      <ErrorMessage className=" !my-10  ">
        No product types were found.
      </ErrorMessage>
    );
  return (
    <Accordion
      key={items.length}
      type="single"
      collapsible
      defaultValue="item-1"
    >
      <AccordionItem value="item-1" className=" border-none">
        <AccordionTrigger>
          {" "}
          <h3 className=" tracking-wider font-semibold text-2xl">
            {itemType === "category" && "Category"}
            {itemType === "productType" && "Product Types"}
            {itemType === "productBrand" && "Product Brands"}
          </h3>
        </AccordionTrigger>

        <AccordionContent>
          <ul className=" flex gap-2  max-h-[50Vh] overflow-y-auto  flex-wrap">
            {result.map((item) => (
              <PillITem
                itemType={itemType}
                key={item.id}
                item={item}
                handleResetPage={handleResetPage}
              />
            ))}
          </ul>
          <div className=" flex  my-4 justify-end gap-3">
            <Button
              onClick={() => {
                if (page === 1) return;
                setPage((page) => page - 1);
              }}
              size="icon"
              variant="secondary"
              disabled={page === 1 || !totalPages}
            >
              <MoveLeft size={12} />
            </Button>
            <Button
              onClick={() => {
                if (page === totalPages) return;

                setPage((page) => page + 1);
              }}
              variant="secondary"
              size="icon"
              disabled={page === totalPages || !totalPages}
            >
              <MoveRight size={12} />
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default PillList;
