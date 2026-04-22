"use client";
import { ComboBox } from "@components/combo-box";

import {
  CarGenerationProps,
  CarMaker,
  CarMakersData,
  CarModelProps,
  ClientWithPhoneNumbers,
} from "@lib/types";
import { Filter } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@mui/material";
import { cn } from "@lib/utils";
import { useIntersectionProvidor } from "@components/products/intersection-providor";
import { ClientsComboBox } from "@components/clients-combobox";
import { Input } from "@components/ui/input";
import {
  DrawerProvidor,
  DrawerContent,
  DrawerOverlay,
} from "@components/DrawerComponent";
import { PAGE_SIZE } from "@lib/constants";
import { MakerCombobox } from "@components/maker-combobox";
import { ModelCombobox } from "@components/model-combobox";
interface CarsListProps {
  color: string;
  plateNumber: string;
  chassisNumber: string;
  motorNumber: string;
  clientId: string;
  carMakerId: string;
  carModelId: string;
  carGenerationId: string;
  pageNumber: string;
  clients: ClientWithPhoneNumbers[];
  carMakers: CarMakersData[];
  // We want the filter to disapear in the case of the page count i more than 3 pages and the pageSize i more than 2 cars in a single page.
  count: number;
}

const GarageFilter: React.FC<CarsListProps> = ({
  carMakerId,
  carModelId,
  carMakers,
  color,
  plateNumber,
  chassisNumber,
  motorNumber,
  clientId,
  carGenerationId,
  clients,
  count,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [plateNumberValue, setPlateNumberValue] = useState(plateNumber);
  const [motorValue, setMotorValue] = useState(motorNumber);
  const [chassieValue, setChassieValue] = useState(chassisNumber);
  const [chosenClient, setChosenClient] = useState(Number(clientId) || 0);
  const [chosenMaker, setchosenMaker] = useState(Number(carMakerId) || 0);
  const [chosenModel, setchosenModel] = useState(Number(carModelId) || 0);
  const [chosenCarGenerationId, setCarGenerationId] = useState(
    Number(carGenerationId) || 0
  );

  const { inView } = useIntersectionProvidor();
  const searchParams = useSearchParams();
  const router = useRouter();

  const pathname = usePathname();
  const isBigScreen = useMediaQuery("(min-width:640px)");

  // Don't make the filter button disppear on the smaller devices when the page count is less than 3 and the page size is less than 2.
  const disapear = count > 2 && Math.ceil(count / PAGE_SIZE) > 3;

  // const models = chosenMaker
  //   ? carModels.filter((item) => item.carMakerId === chosenMaker)
  //   : carModels;

  const models =
    carMakers.find((maker) => maker.id === chosenMaker)?.carModels || [];
  const generations =
    models.find((model) => model.id === chosenModel)?.carGenerations || [];
  // const generations = chosenModel
  //   ? carGeneration.filter((item) => item.carModelId === chosenModel)
  //   : carGeneration;

  async function handleSubmit() {
    const params = new URLSearchParams(searchParams);

    if (plateNumberValue.trim() === "") {
      params.delete("plateNumber");
    } else {
      params.set("plateNumber", plateNumberValue);
    }

    if (motorValue.trim() === "") {
      params.delete("motorNumber");
    } else {
      params.set("motorNumber", motorValue);
    }

    if (chassieValue.trim() === "") {
      params.delete("chassisNumber");
    } else {
      params.set("chassisNumber", chassieValue);
    }

    if (!chosenCarGenerationId) {
      params.delete("carGenerationId");
    } else {
      params.set("carGenerationId", String(chosenCarGenerationId));
    }

    if (!chosenMaker) {
      params.delete("carMakerId");
    } else {
      params.set("carMakerId", String(chosenMaker));
    }

    if (!chosenModel) {
      params.delete("carModelId");
    } else {
      params.set("carModelId", String(chosenModel));
    }

    if (!chosenClient) {
      params.delete("clientId");
    } else {
      params.set("clientId", String(chosenClient));
    }
    params.set("page", "1");

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    window.scrollTo(0, 0);
    if (!isBigScreen) setDrawerOpen(false);
  }

  return (
    <>
      {isBigScreen && (
        <form
          action={handleSubmit}
          //   onSubmit={handleSubmit}
          className=" space-y-4  sticky top-[10px]  max-h-[100vh] overflow-y-auto pb-6 sm:px-2 pt-3  garage-scroll-bar sm:block "
        >
          <h1 className=" font-semibold text-2xl flex items-center ">
            Filters{" "}
            <span>
              {" "}
              <Filter size={20} />
            </span>
          </h1>
          <div className=" space-y-2">
            <label className=" text-sm">Clients</label>
            <ClientsComboBox
              value={chosenClient}
              options={clients}
              setValue={setChosenClient}
            />
          </div>
          <div className=" space-y-2">
            <label className=" text-sm">Car maker</label>
            <MakerCombobox
              value={chosenMaker}
              options={carMakers}
              setValue={(value) => {
                setchosenMaker(value);
                setchosenModel(0);
                setCarGenerationId(0);
              }}
            />
          </div>
          <div className=" space-y-2">
            <label className=" text-sm">Car model</label>
            <ModelCombobox
              disabled={!chosenMaker}
              value={chosenModel}
              options={models}
              setValue={(value) => {
                setchosenModel(value);
                setCarGenerationId(0);
              }}
            />
          </div>
          <div className=" space-y-2">
            <label className=" text-sm">Car generation</label>
            <ComboBox
              placeholder="Select generation..."
              disabled={!chosenModel}
              value={chosenCarGenerationId}
              options={generations}
              setValue={setCarGenerationId}
            />
          </div>

          <div className=" space-y-2">
            <label className=" text-sm">Plate number</label>
            <Input
              value={plateNumberValue}
              onChange={(e) => setPlateNumberValue(e.target.value)}
              placeholder="Plate number..."
            />
          </div>

          <div className=" space-y-2">
            <label className=" text-sm">Chassie number</label>
            <Input
              value={chassieValue}
              onChange={(e) => setChassieValue(e.target.value)}
              placeholder="Chassie number"
            />
          </div>

          <div className=" space-y-2">
            <label className=" text-sm">Motor number</label>
            <Input
              value={motorValue}
              onChange={(e) => setMotorValue(e.target.value)}
              placeholder="Motor number"
            />
          </div>

          {/* <ProdcutFilterInput name={name || ""} /> */}
          <Button size="sm" className=" w-full">
            Search...
          </Button>
        </form>
      )}

      {!isBigScreen && (
        <DrawerProvidor open={drawerOpen} setOpen={setDrawerOpen}>
          <div>
            <DrawerOverlay />

            <Button
              onClick={() => setDrawerOpen((is) => !is)}
              className={cn("fixed right-4 bottom-5 z-50 ", {
                "opacity-0 invisible": inView && disapear,
              })}
              size="icon"
              variant="outline"
            >
              {" "}
              <Filter size={18} />
            </Button>

            <DrawerContent
              asCard
              className=" rounded-t-xl border-none max-h-[60vh] overflow-y-auto "
            >
              <h1 className=" text-center sm:text-left grid gap-1 p-4">
                <h2 className="  font-semibold text-xl">
                  {" "}
                  Filters <Filter size={20} className=" inline" />
                </h2>
                <p className=" text-sm text-muted-foreground">
                  Apply some filters to make the searching process easier.
                </p>
              </h1>
              <section className=" space-y-5   p-4">
                <form
                  action={handleSubmit}
                  //   onSubmit={handleSubmit}
                  className=" space-y-5  sticky top-[50px]  sm:block "
                >
                  <div className=" space-y-2">
                    <label>Clients</label>
                    <ClientsComboBox
                      value={chosenClient}
                      options={clients}
                      setValue={setChosenClient}
                    />
                  </div>

                  <div className=" space-y-2">
                    <label className=" text-sm">Car maker</label>
                    <MakerCombobox
                      value={chosenMaker}
                      options={carMakers}
                      setValue={setchosenMaker}
                    />
                  </div>
                  <div className=" space-y-2">
                    <label className=" text-sm">Car model</label>
                    <ModelCombobox
                      value={chosenModel}
                      options={models}
                      setValue={setchosenModel}
                    />
                  </div>
                  <div className=" space-y-2">
                    <label className=" text-sm">Car generation</label>
                    <ComboBox
                      value={chosenCarGenerationId}
                      options={generations}
                      setValue={setCarGenerationId}
                    />
                  </div>

                  <div className=" space-y-2">
                    <label>Plate number</label>
                    <Input
                      value={plateNumberValue}
                      onChange={(e) => setPlateNumberValue(e.target.value)}
                      placeholder="Plate number..."
                    />
                  </div>

                  <div className=" space-y-2">
                    <label>Chassie number</label>
                    <Input
                      value={chassieValue}
                      onChange={(e) => setChassieValue(e.target.value)}
                      placeholder="Chassie number"
                    />
                  </div>

                  <div className=" space-y-2">
                    <label>Motor number</label>
                    <Input
                      value={motorValue}
                      onChange={(e) => setMotorValue(e.target.value)}
                      placeholder="Motor number"
                    />
                  </div>

                  {/* <ProdcutFilterInput name={name || ""} /> */}
                  <div className="  space-y-3">
                    <Button size="sm" className=" w-full">
                      Search...
                    </Button>
                    <Button
                      onClick={() => setDrawerOpen(false)}
                      variant="outline"
                      className=" w-full block"
                      type="button"
                    >
                      Close
                    </Button>
                  </div>
                </form>
              </section>
            </DrawerContent>
          </div>
        </DrawerProvidor>
      )}
    </>
  );
};

export default GarageFilter;
