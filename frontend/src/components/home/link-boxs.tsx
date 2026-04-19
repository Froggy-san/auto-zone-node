import { Card, CardContent, CardHeader } from "@components/ui/card";
import { cn } from "@lib/utils";
import { LayoutDashboard, PackageSearch, UserRoundCog } from "lucide-react";
import Link from "next/link";
import React from "react";
import { GiMechanicGarage } from "react-icons/gi";

const ICON_SIZE = 20;
const LINKS = [
  {
    link: "/products",
    title: "Prodcuts",
    description: "View products.",
    icon: (
      <div className=" p-5 rounded-full bg-dashboard-orange text-dashboard-text-orange ">
        <PackageSearch size={ICON_SIZE} className="" />
      </div>
    ),
  },
  {
    link: "/dashboard",
    title: "Dashboard",
    description: "See how is your business doing.",
    icon: (
      <div className=" p-5 rounded-full bg-dashboard-green  text-dashboard-text-green">
        <LayoutDashboard size={ICON_SIZE} />
      </div>
    ),
  },

  {
    link: "/garage",
    title: "Garage",
    description: "View the cars in the Garage.",
    icon: (
      <div className=" p-5 rounded-full bg-dashboard-indigo text-dashboard-text-indigo ">
        {" "}
        <GiMechanicGarage size={21} />
      </div>
    ),
  },
];

const LinkBoxs = () => {
  return (
    <div className="  flex-1 hidden lg:block  space-y-10 mt-24">
      {LINKS.map((link, i) => (
        <Card
          key={i}
          className={cn(
            "min-w-fit w-[250px] bg-foreground/20 backdrop-blur-md border-slate-100/20  ml-auto",
            {
              " mr-6 md:mr-12 ": i !== 1,
              " mr-60 md:mr-72": i === 1,
            }
          )}
        >
          <Link href={link.link}>
            <CardHeader className="  flex flex-row items-center  justify-between">
              <h1 className=" text-3xl">{link.title} </h1>
              {link.icon}
            </CardHeader>
            <CardContent className="  flex flex-row gap-3  justify-between  items-center">
              <div className=" flex-1 flex flex-col">
                <span>{link.description} </span>
              </div>
            </CardContent>
          </Link>
        </Card>
      ))}
    </div>
  );
};

export default LinkBoxs;
