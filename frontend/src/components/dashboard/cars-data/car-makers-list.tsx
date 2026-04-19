"use client";

import React, { useCallback, useState, useRef } from "react";
import { CarMaker } from "@lib/types";
import { Button } from "@components/ui/button";
import { MoveLeft, MoveRight } from "lucide-react";
import Spinner from "@components/Spinner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import useCarMakers from "@lib/queries/useCarMakers";
import CarMakerItem from "./car-maker-item";
import CarkMakerForm from "@components/car-maker-form";
import useScrollToPoint from "@hooks/use-scroll-to-point";

const CarMakerList = () => {
  const [page, setPage] = useState(1);
  const [carMakerToEdit, setCarMakerToEdit] = useState<CarMaker | undefined>(
    undefined
  );

  const divRef = useRef<HTMLDivElement>(null);
  const makerList = useRef<HTMLUListElement>(null);

  const handleScroll = useScrollToPoint({
    ref: divRef,
    options: {
      behavior: "smooth",
    },
  });
  const { data, isLoading, error, pageCount } = useCarMakers(page);

  const carMakers: CarMaker[] = data ? data : [];

  function handleClose() {
    setCarMakerToEdit(undefined);
  }

  const handleResetPage = useCallback(() => {
    if (carMakers.length === 1) {
      setPage((page) => page - 1);
    }
  }, [carMakers.length, setPage]);

  function handleScrollList() {
    if (makerList.current) {
      makerList.current.scrollTo(0, 0);
    }
  }

  return (
    <>
      <CarkMakerForm
        carMakerToEdit={carMakerToEdit}
        showOpenButton={false}
        handleCloseEdit={handleClose}
      />
      <div className=" relative " id="car-makers" ref={divRef} />
      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1" className=" border-none">
          <AccordionTrigger>
            {" "}
            <h3 className=" tracking-wider font-semibold text-2xl">
              Car makers
            </h3>
          </AccordionTrigger>
          {error ? (
            <p>{`${error}`}</p>
          ) : (
            <AccordionContent>
              {isLoading ? (
                <Spinner className=" h-[300px]" size={25} />
              ) : !carMakers.length ? (
                <p className=" text-center">
                  No car maker data has been posted yet!
                </p>
              ) : (
                <ul
                  ref={makerList}
                  className="  grid grid-cols-2 md:grid-cols-3   overscroll-contain xl:grid-cols-4 gap-2 px-1  py-2  sm:p-4 max-h-[70vh] sm:max-h-none overflow-y-auto  "
                >
                  {carMakers.map((item) => (
                    <CarMakerItem
                      key={item.id}
                      carMaker={item}
                      carMakerToEdit={carMakerToEdit}
                      setCarMakerToEdit={setCarMakerToEdit}
                      handleResetPage={handleResetPage}
                    />
                  ))}
                </ul>
              )}

              <div className=" flex  my-4 justify-end gap-3">
                <Button
                  onClick={() => {
                    if (isLoading || page === 1 || !carMakers.length) return;
                    setPage((page) => page - 1);
                    handleScroll();
                    handleScrollList();
                  }}
                  size="icon"
                  variant="secondary"
                  disabled={isLoading || page === 1}
                >
                  <MoveLeft size={12} />
                </Button>
                <Button
                  onClick={() => {
                    if (isLoading || page === pageCount) return;

                    setPage((page) => page + 1);
                    handleScroll();
                    handleScrollList();
                  }}
                  variant="secondary"
                  size="icon"
                  disabled={
                    isLoading || page === pageCount || !carMakers.length
                  }
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

export default CarMakerList;
