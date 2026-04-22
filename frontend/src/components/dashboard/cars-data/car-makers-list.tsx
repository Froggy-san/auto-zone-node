"use client";

import React, { useCallback, useState, useRef, useEffect } from "react";
import { CarMakersData, CarModelProps } from "@lib/types";
import { Button } from "@components/ui/button";
import { MoveLeft, MoveRight } from "lucide-react";
import Spinner from "@components/Spinner";

import useCarMakers from "@lib/queries/car-maker/useCarMakers";
import CarMakerItem from "./car-maker-item";
import CarkMakerForm from "@components/dashboard/cars-data/car-maker-form";
import useScrollToPoint from "@hooks/use-scroll-to-point";
import CarMakerDia from "./can-maker-dia";
import MakerNote from "./maker-note";
import { Input } from "@components/ui/input";

const CarMakerList = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [carMakerToEdit, setCarMakerToEdit] = useState<
    CarMakersData | undefined
  >(undefined);
  const [carMakerId, setCarMakerId] = useState<number | null>(null);
  const [makerNote, setMakerNote] = useState<number | null>(null);

  const divRef = useRef<HTMLDivElement>(null);
  const makerList = useRef<HTMLUListElement>(null);

  const handleScroll = useScrollToPoint({
    ref: divRef,
    options: {
      behavior: "smooth",
    },
  });
  const { data, isLoading, error, pageCount } = useCarMakers(page, searchTerm);

  const carMaker = data?.find((car) => car.id === carMakerId);

  const note = data?.find((car) => car.id === makerNote);
  const carMakers = data ? data : [];

  function handleClose() {
    setCarMakerToEdit(undefined);
  }

  const handleResetPage = useCallback(() => {
    if (carMakers.length === 1) {
      setPage((page) => page - 1);
      setSearchTerm("");
    }
  }, [carMakers.length, setPage]);

  function handleScrollList() {
    if (makerList.current) {
      makerList.current.scrollTo(0, 0);
    }
  }

  return (
    <>
      {/* <div className=" p-2 bg-accent/20 rounded-xl backdrop-blur-2xl shadow-lg flex items-center  justify-center">
        <Input
          placeholder="Search..."
          className=" h-6 max-w-[600px]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div> */}
      <div className=" relative " id="car-makers" ref={divRef} />

      {error ? (
        <p>{`${error}`}</p>
      ) : (
        <div>
          {isLoading ? (
            <Spinner className=" h-[300px]" size={25} />
          ) : !carMakers.length ? (
            <p className=" text-center">
              No car maker data has been posted yet!
            </p>
          ) : (
            <ul
              ref={makerList}
              className="  grid grid-cols-3 md:grid-cols-4   lg:grid-cols-5   xl:grid-cols-6 gap-2 px-1  py-2  sm:p-4  sm:max-h-none  "
            >
              {carMakers.map((item) => (
                <CarMakerItem
                  key={item.id}
                  carMaker={item}
                  setNoteOpen={setMakerNote}
                  setCarMaker={setCarMakerId}
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
              disabled={isLoading || page === pageCount || !carMakers.length}
            >
              <MoveRight size={12} />
            </Button>
          </div>
        </div>
      )}
      <CarkMakerForm
        carMakerToEdit={carMakerToEdit}
        showOpenButton={false}
        handleCloseEdit={handleClose}
      />
      <CarMakerDia
        carMaker={carMaker || null}
        // handleResetPage={handleResetPage}
        setCarMakerId={setCarMakerId}
      />

      <MakerNote
        open={!!note}
        setOpen={() => setMakerNote(null)}
        carMaker={note || null}
      />
    </>
  );
};

export default CarMakerList;
