import { Card, CardContent, CardHeader } from "@components/ui/card"
import { cn } from "@lib/utils"
import { LayoutDashboard, PackageSearch, UserRoundCog } from "lucide-react"
import Link from "next/link"
import React from "react"
import { GiMechanicGarage } from "react-icons/gi"

const ICON_SIZE = 20
const LINKS = [
  {
    link: "/products",
    title: "Prodcuts",
    description: "View products.",
    icon: (
      <div className="bg-dashboard-orange text-dashboard-text-orange rounded-full p-5">
        <PackageSearch size={ICON_SIZE} className="" />
      </div>
    ),
  },
  {
    link: "/dashboard",
    title: "Dashboard",
    description: "See how is your business doing.",
    icon: (
      <div className="bg-dashboard-green text-dashboard-text-green rounded-full p-5">
        <LayoutDashboard size={ICON_SIZE} />
      </div>
    ),
  },

  {
    link: "/garage",
    title: "Garage",
    description: "View the cars in the Garage.",
    icon: (
      <div className="bg-dashboard-indigo text-dashboard-text-indigo rounded-full p-5">
        {" "}
        <GiMechanicGarage size={21} />
      </div>
    ),
  },
]

const LinkBoxs = () => {
  return (
    <div className="mt-24 hidden flex-1 space-y-10 lg:block">
      {LINKS.map((link, i) => (
        <Card
          key={i}
          className={cn(
            "ml-auto w-[250px] min-w-fit border-slate-100/20 bg-foreground/20 backdrop-blur-md",
            {
              "mr-6 md:mr-12": i !== 1,
              "mr-60 md:mr-72": i === 1,
            }
          )}
        >
          <Link href={link.link}>
            <CardHeader className="flex flex-row items-center justify-between">
              <h1 className="text-3xl">{link.title} </h1>
              {link.icon}
            </CardHeader>
            <CardContent className="flex flex-row items-center justify-between gap-3">
              <div className="flex flex-1 flex-col">
                <span>{link.description} </span>
              </div>
            </CardContent>
          </Link>
        </Card>
      ))}
    </div>
  )
}

export default LinkBoxs
