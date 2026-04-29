import SideBar, { SideBarMobile } from "@/components/dashboard/side-bar"
import NavDrawer from "@/components/nav-drawer"

import { ModeToggle } from "@/components/theme-switch"

import React from "react"

export const metadata: Metadata = {
  // title: "The Wild Oasis",
  title: {
    template: "%s / Dashboard",
    default: "Home / Dashboard",
  },

  description: "Manage your business.",
}

import {
  ArrowLeftToLine,
  ArrowRightToLine,
  Car,
  FolderKanban,
  Grid2x2Plus,
  House,
  LockKeyhole,
  LockKeyholeOpen,
  LogOut,
  Package,
  PersonStanding,
  SlidersVertical,
  Ticket,
} from "lucide-react"

const ICON_SIZE = 22

const links = [
  {
    icon: <House size={ICON_SIZE} />,
    title: "Home",
    herf: "/dashboard",
  },

  {
    icon: <Package size={ICON_SIZE} />,
    title: "Inventory",
    herf: "/dashboard/inventory",
  },
  // {
  //   icon: <SlidersVertical size={ICON_SIZE} />,
  //   title: "Settings",
  //   herf: "/dashboard/settings",
  // },

  {
    icon: <PersonStanding size={ICON_SIZE} />,
    title: "Customers",
    herf: "/dashboard/customers",
  },
  {
    icon: <Car size={ICON_SIZE} />,
    title: "Cars Data",
    herf: "/dashboard/cars-data",
  },

  // {
  //   icon: <TbBoxModel2 size={ICON_SIZE} />,
  //   title: "Car Models",
  //   herf: "/dashboard/car-models",
  // },
  // {
  //   icon: <VscTypeHierarchySuper size={ICON_SIZE} />,
  //   title: "Car Generations",
  //   herf: "/dashboard/car-generations",
  // },
  {
    icon: <Grid2x2Plus size={ICON_SIZE} />,
    title: "Products Data",
    herf: "/dashboard/insert-data",
  },
  {
    icon: <Ticket size={ICON_SIZE} />,
    title: "Tickets",
    herf: "/dashboard/tickets",
  },
]

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main
      data-vaul-drawer-wrapper
      className="relative flex max-h-[100dvh] min-h-[100dvh] flex-col bg-background"
    >
      <div className="flex items-center justify-between border-b py-1 pr-2">
        <div className="flex items-center gap-2">
          <Link href="/">
            <h1 className="text-3xl font-semibold sm:text-6xl">DASHBOARD</h1>
          </Link>
          <NavDrawer />
        </div>
        <ModeToggle />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <SideBar links={links} />

        <div className="max-h-full flex-1 overflow-y-auto p-2">
          <div className="mx-auto max-w-[1600px]">{children}</div>
        </div>
      </div>

      <SideBarMobile links={links} />
    </main>
  )
}

export default Layout
