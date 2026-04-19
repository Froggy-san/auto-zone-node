"use client";
import React, { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "./ui/button";
import {
  Barcode,
  Car,
  Grid2x2Plus,
  House,
  LayoutDashboard,
  ListFilter,
  LogOut,
  Package,
  PersonStanding,
} from "lucide-react";
import Link from "next/link";
import { GiMechanicGarage, GiTowTruck } from "react-icons/gi";
import { MdOutlineCarRepair } from "react-icons/md";
import { logoutUser } from "@lib/actions/authActions";
const NavDrawer = () => {
  const [open, setOpen] = useState(false);

  return (
    <Drawer direction="left" open={open} onOpenChange={setOpen}>
      <DrawerTrigger className=" rounded-full" asChild>
        <Button className="rounded-full" size="icon" variant="outline">
          <ListFilter size={20} />
        </Button>
      </DrawerTrigger>
      <DrawerContent className=" h-full   w-[250px] ">
        <DrawerHeader className=" hidden">
          <DrawerTitle>Are you absolutely sure?</DrawerTitle>
          <DrawerDescription>This action cannot be undone.</DrawerDescription>
        </DrawerHeader>
        <div className="   p-4 flex flex-col justify-between h-full">
          <div className=" flex flex-col gap-3 justify-start">
            <Button
              asChild
              className=" justify-start gap-1"
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
            >
              <Link href="/">
                {" "}
                <House className=" w-4 h-4" />
                Home
              </Link>
            </Button>
            <Button
              asChild
              className=" justify-start gap-1"
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
            >
              <Link href="/products">
                {" "}
                <Barcode className=" w-4 h-4" />
                Products
              </Link>
            </Button>
            <Button
              asChild
              className=" justify-start gap-1"
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
            >
              <Link href="/garage">
                <GiMechanicGarage className=" w-5 h-5" /> Garage
              </Link>
            </Button>
            <div className=" relative group z-10">
              <Button
                asChild
                className="  justify-start w-full  "
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
              >
                <Link href="/dashboard" className=" gap-1" prefetch={false}>
                  <LayoutDashboard className=" w-4 h-4" /> Dashboard
                </Link>
              </Button>

              <div className=" sm:absolute sm:invisible sm:opacity-0 sm:-right-20 bg-background sm:top-6 sm:rounded-lg  sm:border  pl-5 sm:shadow-md  sm:group-hover:visible  sm:group-hover:top-2 sm:group-hover:opacity-100 sm:transition-all sm:w-40 sm:p-1">
                <Button
                  asChild
                  className=" justify-start gap-1  z-50 w-full"
                  size="sm"
                  variant="ghost"
                  onClick={() => setOpen(false)}
                >
                  <Link href="/dashboard/inventory" prefetch={false}>
                    {" "}
                    <Package className=" h-4 w-4" /> Inventory
                  </Link>
                </Button>

                <Button
                  asChild
                  className=" justify-start  z-50 w-full gap-1"
                  size="sm"
                  variant="ghost"
                  onClick={() => setOpen(false)}
                >
                  <Link href="/dashboard/customers" prefetch={false}>
                    <PersonStanding className=" w-4 h-4" /> Clients
                  </Link>
                </Button>

                <Button
                  asChild
                  className=" justify-start  z-50 w-full gap-1"
                  size="sm"
                  variant="ghost"
                  onClick={() => setOpen(false)}
                >
                  <Link href="/dashboard/cars-data" prefetch={false}>
                    <Car className=" w-4 h-4" /> Cars Data
                  </Link>
                </Button>

                <Button
                  asChild
                  className=" justify-start  z-50 w-full gap-1"
                  size="sm"
                  variant="ghost"
                  onClick={() => setOpen(false)}
                >
                  <Link href="/dashboard/insert-data">
                    <Grid2x2Plus className=" w-4 h-4" />
                    Products Data
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          <Button
            className=" justify-start    z-50  w-full gap-1"
            size="sm"
            variant="ghost"
            onClick={async () => {
              setOpen(false);
              await logoutUser();
            }}
          >
            <LogOut className=" w-4 h-4" />
            Log out
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default NavDrawer;
