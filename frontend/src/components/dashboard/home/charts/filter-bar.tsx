"use client";
import React, { SetStateAction, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, Ellipsis, ListFilter } from "lucide-react";
import { Button } from "@components/ui/button";

const filters = [
  { label: "Last 7 days", value: 7 },
  { label: "Last 30 days", value: 30 },
  { label: "Last 90 days", value: 90 },
  { label: "Current year", value: "year" },
  { label: "All", value: "all" },
];

type selected = "year" | "all" | string;

const FilterBar = ({
  selected,
  setSelected,
}: {
  selected: number | string;
  setSelected: React.Dispatch<SetStateAction<number | selected | string>>;
}) => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <>
      <div
        onMouseLeave={() => setHovered(null)}
        className="  w-fit ml-auto  mr-3 text-sm  hidden sm:flex text-muted-foreground items-center  gap-2"
      >
        {filters.map((filter, i) => (
          <motion.button
            onClick={() => setSelected(filter.value)}
            key={i}
            onMouseOver={() => setHovered(i)}
            //   onMouseOut={() => setHovered(null)}
            className={cn(
              "relative hover:text-accent-foreground transition-colors duration-500  h-8 rounded-md px-3 text-xs bg-transparent ",
              {
                " bg-accent dark:bg-card text-accent-foreground":
                  selected === filter.value,
              }
            )}
          >
            <div className="   absolute   flex items-center justify-center inset-0 z-50">
              {" "}
              {filter.label}
            </div>
            <div className="    invisible"> {filter.label}</div>

            {hovered === i && (
              <motion.div
                transition={{ duration: 0.2 }}
                layoutId="tab-indicator"
                className="w-full h-full  absolute inset-0   z-10  bg-accent dark:bg-card  rounded-md "
              />
            )}
          </motion.button>
        ))}
      </div>
      <div className=" flex items-center justify-end sm:hidden">
        <DropdownMenu>
          <div className=" flex items-center gap-2 ">
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="        gap-1 ">
                {filters.find((item) => item.value === selected)?.label}

                <ListFilter className=" w-3 h-3" />

                {/* <Ellipsis className=" w-4 h-4" /> */}
              </Button>
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent className=" w-48">
            <DropdownMenuLabel>Time period</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {filters.map((filter, i) => (
              <DropdownMenuItem
                className=" justify-between"
                key={i}
                onClick={() => {
                  if (selected !== filter.value) setSelected(filter.value);
                }}
              >
                {filter.label}{" "}
                {selected === filter.value && <Check className=" w-3 h-3" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
};

export default FilterBar;
