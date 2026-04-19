import React from "react";
import Logo from "@../public/autozone-logo.svg";
import Image from "next/image";
import UserUi from "@components/user-ui";
import NavDrawer from "./nav-drawer";
import { ModeToggle } from "./theme-switch";
import Search from "./home/search";

const Header = ({ showSearch }: { showSearch?: boolean }) => {
  // const user = await getCurrentUser();
  return (
    <header className=" flex  relative justify-between items-center  py-4 px-2 sm:px-6">
      <div className=" flex items-center  gap-2 ">
        <NavDrawer />
        <Image
          src={Logo}
          alt="logo"
          className=" w-[120px] sm:w-[200px]  select-none"
        />
      </div>
      <div className="  absolute left-1/2  w-[350px] z-50  -translate-x-1/2">
        <Search className=" bg-card shadow-sm" />
      </div>
      <div className=" flex items-center gap-3">
        <UserUi />
        {/* <UserHeaderBtn user={user} /> */}
        <ModeToggle />
      </div>
    </header>
  );
};

export default Header;
