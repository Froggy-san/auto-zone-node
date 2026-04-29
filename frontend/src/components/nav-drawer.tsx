import React, { useState } from "react"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from "./ui/button"
import {
  AppWindow,
  Barcode,
  Car,
  Grid2x2Plus,
  House,
  LayoutDashboard,
  ListFilter,
  LogOut,
  Package,
  PersonStanding,
  Ticket,
} from "lucide-react"

import { GiMechanicGarage, GiTowTruck } from "react-icons/gi"
import { MdOutlineCarRepair } from "react-icons/md"

// import UserUi from "./user-ui";
// import useCurrUser from "@/lib/queries/useCurrUser";
import Spinner from "./Spinner"
import { TbMessageReport } from "react-icons/tb"
import { Link } from "react-router"
const NavDrawer = () => {
  const [open, setOpen] = useState(false)
  // const { user, isLoading } = useCurrUser();
  const userBtns = (
    <>
      <div className="mx-auto my-3 h-[1px] w-[90%] bg-muted-foreground/55" />
      <Button
        asChild
        className="justify-start gap-1"
        variant="ghost"
        size="sm"
        onClick={() => setOpen(false)}
      >
        <Link to={`/user/`}>
          <AppWindow className="h-4 w-4" /> Your Activity
        </Link>
      </Button>
      <Button
        asChild
        className="justify-start gap-1"
        variant="ghost"
        size="sm"
        onClick={() => setOpen(false)}
      >
        <Link to={`/user//settings`}>
          <PersonStanding className="h-4 w-4" /> Personal details
        </Link>
      </Button>
      <Button
        asChild
        className="justify-start gap-1"
        variant="ghost"
        size="sm"
        onClick={() => setOpen(false)}
      >
        <Link to={`/user//complaints`}>
          <TbMessageReport className="h-4 w-4" /> Your Complaints
        </Link>
      </Button>
    </>
  )
  const isAdmin = true
  //  user?.user_metadata.role.toLowerCase() === "admin";
  const adminBtn = isAdmin ? (
    <>
      <Button
        asChild
        className="justify-start gap-1"
        variant="ghost"
        size="sm"
        onClick={() => setOpen(false)}
      >
        <Link to="/garage">
          <GiMechanicGarage className="h-5 w-5" /> Garage
        </Link>
      </Button>
      <div className="group relative z-10">
        <Button
          asChild
          className="w-full justify-start"
          variant="ghost"
          size="sm"
          onClick={() => setOpen(false)}
        >
          <Link to="/dashboard" className="gap-1">
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </Link>
        </Button>

        <div className="bg-background pl-5 sm:invisible sm:absolute sm:top-6 sm:-right-20 sm:w-40 sm:rounded-lg sm:border sm:p-1 sm:opacity-0 sm:shadow-md sm:transition-all sm:group-hover:visible sm:group-hover:top-2 sm:group-hover:opacity-100">
          <Button
            asChild
            className="z-50 w-full justify-start gap-1"
            size="sm"
            variant="ghost"
            onClick={() => setOpen(false)}
          >
            <Link to="/dashboard/inventory">
              {" "}
              <Package className="h-4 w-4" /> Inventory
            </Link>
          </Button>

          <Button
            asChild
            className="z-50 w-full justify-start gap-1"
            size="sm"
            variant="ghost"
            onClick={() => setOpen(false)}
          >
            <Link to="/dashboard/customers">
              <PersonStanding className="h-4 w-4" /> Clients
            </Link>
          </Button>

          <Button
            asChild
            className="z-50 w-full justify-start gap-1"
            size="sm"
            variant="ghost"
            onClick={() => setOpen(false)}
          >
            <Link to="/dashboard/cars-data">
              <Car className="h-4 w-4" /> Cars Data
            </Link>
          </Button>

          <Button
            asChild
            className="z-50 w-full justify-start gap-1"
            size="sm"
            variant="ghost"
            onClick={() => setOpen(false)}
          >
            <Link to="/dashboard/insert-data">
              <Grid2x2Plus className="h-4 w-4" />
              Products Data
            </Link>
          </Button>

          <Button
            asChild
            className="z-50 w-full justify-start gap-1"
            size="sm"
            variant="ghost"
            onClick={() => setOpen(false)}
          >
            <Link to="/dashboard/tickets">
              <Ticket className="h-4 w-4" />
              Tickets
            </Link>
          </Button>
        </div>
      </div>
      {userBtns}
    </>
  ) : (
    userBtns
  )
  return (
    <Drawer direction="left" open={open} onOpenChange={setOpen}>
      <DrawerTrigger className="rounded-full" asChild>
        <Button className="rounded-full" size="icon" variant="outline">
          <ListFilter size={20} />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-full w-[250px]">
        <DrawerHeader className="hidden">
          <DrawerTitle>Are you absolutely sure?</DrawerTitle>
          <DrawerDescription>This action cannot be undone.</DrawerDescription>
        </DrawerHeader>
        <div className="flex h-full flex-col justify-between p-4">
          <div className="flex flex-col justify-start gap-3">
            <Button
              asChild
              className="justify-start gap-1"
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
            >
              <Link to="/">
                {" "}
                <House className="h-4 w-4" />
                Home
              </Link>
            </Button>
            <Button
              asChild
              className="justify-start gap-1"
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
            >
              <Link to="/products">
                {" "}
                <Barcode className="h-4 w-4" />
                Products
              </Link>
            </Button>
            {/* {isLoading ? (
              <Spinner className=" static w-7 h-7 mx-auto" />
            ) : !user ? null : ( */}
            {adminBtn}
            {/* )} */}
          </div>

          {/* <UserUi showName /> */}
          <Button
            className="z-50 w-full justify-start gap-1"
            size="sm"
            variant="ghost"
            onClick={async () => {
              setOpen(false)
              // await logoutUser()
            }}
          >
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default NavDrawer
