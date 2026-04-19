"use client";
import useCarGenerations from "@lib/queries/car-generation/useCarGenerations";
import React, { useCallback, useRef, useState } from "react";

import { CarGenerationProps } from "@lib/types";
import { Button } from "@components/ui/button";
import { MoveLeft, MoveRight } from "lucide-react";
import Spinner from "@components/Spinner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import useScrollToPoint from "@hooks/use-scroll-to-point";
import GenerationItem from "./generation-item";

const CarGenerationList = () => {
  const [page, setPage] = useState(1);

  const { isLoading, carGenerations, pageCount, error } =
    useCarGenerations(page);
  const ref = useRef<HTMLDivElement>(null);
  const handleScroll = useScrollToPoint({ ref });

  const carGenerationData: CarGenerationProps[] = carGenerations || [];

  const handleResetPage = useCallback(() => {
    if (carGenerationData.length === 1) {
      setPage((page) => page - 1);
    }
  }, [carGenerationData.length, setPage]);

  // if (error) return <p>{String(error)}</p>;

  return (
    <Accordion type="single" collapsible defaultValue="item-1">
      <AccordionItem value="item-1" className=" border-none">
        <AccordionTrigger>
          {" "}
          <h3 className=" tracking-wider font-semibold text-2xl">
            CAR GENERATIONS
          </h3>
        </AccordionTrigger>
        {error ? (
          <p>{String(error)}</p>
        ) : (
          <AccordionContent>
            {isLoading ? (
              <Spinner className=" h-[300px]" size={25} />
            ) : !carGenerationData.length ? (
              <p>No car generation data has been posted yet!</p>
            ) : (
              <ul className=" flex flex-wrap gap-2 p-4 max-h-[45vh] overflow-y-auto  ">
                {carGenerationData.map((item) => (
                  <GenerationItem
                    key={item.id}
                    handleResetPage={handleResetPage}
                    item={item}
                  />
                ))}
              </ul>
            )}

            <div className=" flex  my-4 justify-end gap-3">
              <Button
                onClick={() => {
                  if (isLoading || page === 1) return;
                  setPage((page) => page - 1);
                  handleScroll();
                }}
                size="icon"
                variant="secondary"
                disabled={isLoading || page === 1 || !carGenerationData.length}
              >
                <MoveLeft size={12} />
              </Button>
              <Button
                onClick={() => {
                  if (isLoading || page === pageCount) return;

                  setPage((page) => page + 1);
                  handleScroll();
                }}
                variant="secondary"
                size="icon"
                disabled={
                  isLoading || page === pageCount || !carGenerationData.length
                }
              >
                <MoveRight size={12} />
              </Button>
            </div>
          </AccordionContent>
        )}
      </AccordionItem>
    </Accordion>
  );
};

export default CarGenerationList;
