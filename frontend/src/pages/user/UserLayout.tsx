import SideBar, { SideBarMobile } from "@/features/dashboard/side-bar"
import NavDrawer from "@/components/nav-drawer"

import { ModeToggle } from "@/components/theme-switch"
import React from "react"
import { KeySquare, PersonStanding, Users } from "lucide-react"
import { TbMessageReport } from "react-icons/tb"
import { Link, Outlet, useParams } from "react-router"

const ICON_SIZE = 22

interface Params {
  userId?: string
}

const UserLayout = () => {
  const params = useParams()
  const userId = params.userId || ""

  const links = [
    {
      icon: <KeySquare size={ICON_SIZE} />,
      title: "Activities",
      herf: `/user/${userId}`,
    },
    {
      icon: <PersonStanding size={ICON_SIZE} />,
      title: "Settings",
      herf: `/user/${userId}/settings`,
    },
    {
      icon: <TbMessageReport size={ICON_SIZE} />,
      title: "Complaints",
      herf: `/user/${userId}/complaints`,
    },

    // {
    //   icon: <Users size={ICON_SIZE} />,
    //   title: "User management",
    //   herf: "/user/management",
    // },
  ]
  return (
    <main
      data-vaul-drawer-wrapper
      className="relative flex max-h-[100dvh] min-h-[100dvh] flex-col bg-background"
    >
      <div className="flex items-center justify-between border-b py-1 pr-2">
        <div className="flex items-center gap-2">
          <Link to="/">
            <h1 className="text-3xl font-semibold sm:text-6xl">PROFILE</h1>
          </Link>
          <NavDrawer />
        </div>
        <ModeToggle />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <SideBar links={links} />

        <div
          id="page-container"
          className="relative max-h-full flex-1 overflow-y-auto p-2"
        >
          <Outlet />
        </div>
      </div>

      <SideBarMobile links={links} />
    </main>
  )
}

export default UserLayout
