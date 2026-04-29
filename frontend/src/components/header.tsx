import React from "react"
// import Logo from "@../public/autozone-logo.svg"

// import UserUi from "@components/user-ui";
import NavDrawer from "./nav-drawer"
import { ModeToggle } from "./theme-switch"
import Search from "./home/search"
import { cn } from "@/lib/utils"

const Header = ({
  showSearch = false,
  className,
}: {
  showSearch?: boolean
  className?: string
}) => {
  // const user = await getCurrentUser();
  return (
    <header
      className={cn(
        "relative flex items-center justify-between gap-3 px-2 py-4 sm:px-6",
        className,
        {
          "mb-12 mid:mb-0": showSearch,
        }
      )}
    >
      <div className="flex items-center gap-2">
        <NavDrawer />
        <img
          src={"../public/autozone-logo.svg"}
          alt="logo"
          className="w-[120px] select-none sm:w-[200px]"
        />
      </div>
      {/* <div className="  absolute mid:static  lg:absolute left-1/2  px-2 sm:px-6 mid:px-0  top-14  w-full   mid:w-[400px]  lg:w-[500px] z-50  flex-1 -translate-x-1/2  mid:-translate-x-0 mid:left-0 mid:top-[unset]   lg:left-1/2 lg:top-[unset] lg:-translate-x-1/2"> */}
      {showSearch && <Search className="bg-card shadow-sm" />}
      {/* </div> */}
      <div className="flex items-center gap-3">
        {/* <UserUi /> */}
        {/* <UserHeaderBtn user={user} /> */}
        <ModeToggle />
      </div>
    </header>
  )
}

export default Header
