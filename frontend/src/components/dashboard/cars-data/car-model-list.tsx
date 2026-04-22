"use client";

import React, { useCallback, useRef, useState } from "react";

import { CarGenerationProps, CarModelProps } from "@lib/types";
import { Button } from "@components/ui/button";
import { MoveLeft, MoveRight } from "lucide-react";
import Spinner from "@components/Spinner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import useCarModels from "@lib/queries/useCarModels";
import ErrorMessage from "@components/error-message";
import ModelItem from "./model-item";
import { PILL_SIZE } from "@lib/constants";
import useScrollToPoint from "@hooks/use-scroll-to-point";
import useLocalPagination from "@hooks/use-local-pagination";

const CarModelsList = ({
  models,
  error,
}: {
  models: CarModelProps[];
  error: string;
}) => {
  const [page, setPage] = useState(1);
  console.log("MODELS:", models);
  // const { isLoading, data, apiError, error } = useCarModels(page);
  const ref = useRef<HTMLDivElement>(null);
  const handleScroll = useScrollToPoint({ ref });
  // const carModels: CarModelProps[] = data?.models || [];
  // const pageCount = data?.count ? Math.ceil(Number(data.count) / PILL_SIZE) : 0;
  const { result, totalPages, totalItems } = useLocalPagination({
    currPage: page,
    pageSize: PILL_SIZE,
    arr: models,
  });
  const handleResetPage = useCallback(() => {
    if (result.length === 1) {
      setPage((page) => page - 1);
    }
  }, [result.length, setPage]);

  // if (apiError) return <ErrorMessage>{apiError}</ErrorMessage>;

  return (
    <>
      <div ref={ref} />
      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1" className=" border-none">
          <AccordionTrigger>
            {" "}
            <h3 className=" tracking-wider font-semibold text-2xl">
              CAR MODELS
            </h3>
          </AccordionTrigger>
          {error ? (
            <p>{String(error)}</p>
          ) : (
            <AccordionContent>
              {!result.length ? (
                <p>No car generation data has been posted yet!</p>
              ) : (
                <ul className=" flex flex-wrap gap-2 p-4 max-h-[45vh] overflow-y-auto  ">
                  {/* {result.map((item, index) => (
                    <ModelItem
                      key={item.id}
                      item={item}
                      handleResetPage={handleResetPage}
                    />
                  ))} */}
                </ul>
              )}

              <div className=" flex  my-4 justify-end gap-3">
                <Button
                  onClick={() => {
                    if (page === 1) return;
                    setPage((page) => page - 1);
                    handleScroll();
                  }}
                  size="icon"
                  variant="secondary"
                  disabled={page === 1 || !result.length}
                >
                  <MoveLeft size={12} />
                </Button>
                <Button
                  onClick={() => {
                    if (page === totalPages) return;

                    setPage((page) => page + 1);
                    handleScroll();
                  }}
                  variant="secondary"
                  size="icon"
                  disabled={page === totalPages || !result.length}
                >
                  <MoveRight size={12} />
                </Button>
              </div>
            </AccordionContent>
          )}
        </AccordionItem>
      </Accordion>
    </>
  );
};

export default CarModelsList;
