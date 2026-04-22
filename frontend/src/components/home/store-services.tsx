import { cn } from "@lib/utils";
import { Cross, Drill, MapPinCheckInside, Recycle } from "lucide-react";
import React, { useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { PiEngineBold } from "react-icons/pi";
import Link from "next/link";
import { TbBatteryAutomotive } from "react-icons/tb";

interface ItemProps {
  className?: string;
  icon?: React.ReactNode | string;
  link: string;
  header?: string;
  description?: string;
  focused: boolean;
  focus: () => void;
  unFocus: () => void;
}
const ITEMS: Omit<ItemProps, "className" | "focused" | "focus" | "unFocus">[] =
  [
    {
      icon: <Drill className=" w-10 h-10  xs:w-12 xs:h-12 " />,
      link: "/loan-a-tool",
      header: "Loan-A-Tool",
      description: "Borrow a specialty tools.",
    },
    {
      icon: <PiEngineBold className=" w-10 h-10  xs:w-12 xs:h-12 " />,
      link: "/engine-check",
      header: "Engine check-up",
      description: "We will check your engine and give you a free report.",
    },

    {
      icon: <Cross className=" w-10 h-10  xs:w-12 xs:h-12 " />,
      link: "/part-testing",
      header: "Free In-Store Parts Testing",
      description: "We'll check your alternator, starter, battery and more.",
    },

    {
      icon: <TbBatteryAutomotive className=" w-10 h-10  xs:w-12 xs:h-12 " />,
      link: "battary-testing",
      header: "Battery Solutions",
      description:
        "Check it before you buy it or bring a dead battery back to life.",
    },

    {
      icon: <Recycle className=" w-10 h-10  xs:w-12 xs:h-12 " />,
      link: "/recycling",
      header: "Recycling",
      description:
        "Bring us your used oil or get credits for your used batteries.",
    },

    {
      icon: <MapPinCheckInside className=" w-10 h-10  xs:w-12 xs:h-12 " />,
      link: "/pick-up",
      header: "Store Pick Up",
      description: "Pick up at any location in Egypt.",
    },
  ];

const StoreServices = ({ className }: { className?: string }) => {
  // const [focused, setFocused] = useState(-1);
  // const [hovered, setHovered] = useState(false);
  // console.log("HOVERED", hovered);
  return (
    <ul
      // onMouseEnter={() => setHovered(true)}
      // onMouseLeave={() => {
      //   setFocused(-1);
      //   setHovered(false);
      // }}
      className={cn(" grid   grid-cols-2 md:grid-cols-3 gap-3 p-3", className)}
    >
      <LayoutGroup>
        {ITEMS.map((item, i) => (
          //  Add this to the li and see the difference: hover:scale-95 transition-all
          <li
            // onMouseEnter={() => setFocused(i)}
            // onFocus={() => setFocused(i)}
            //   onMouseLeave={unFocus}
            className={cn(
              "  rounded-xl shadow-md  border-2 hover:border-primary/80   transition-all duration-500  z-10  relative "
            )}
            key={i}
          >
            <Link
              href={item.link}
              className="  flex flex-col items-center   focus:border-none focus:outline-none focus:right-0 justify-center p-2 "
            >
              <span className=" mb-3">{item.icon}</span>
              <h4 className=" sm:text-xl font-extrabold text-center ">
                {item.header}
              </h4>
              <p className=" w-[80%]  text-xs  xs:text-sm sm:text-base mx-auto text-center">
                {item.description}
              </p>

              {/* {hovered && ( */}
              {/* <AnimatePresence custom={hovered}>
                {focused === i && (
                  <motion.div
                    transition={{ duration: 0.25, stiffness: 50 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    layoutId="tab-indicator"
                    className={cn(
                      "bg-transparent border-2 border-primary/80 absolute  left-0 top-0 w-full h-full rounded-2xl z-[-1]"
                    )}
                  />
                )}
              </AnimatePresence> */}
              {/* )} */}
            </Link>
          </li>
        ))}
      </LayoutGroup>
    </ul>
  );
};

function Item({
  icon,
  header,
  description,
  focused,
  focus,
  unFocus,
  className,
}: ItemProps) {
  return (
    <div
      // onMouseEnter={focus}
      //   onMouseLeave={unFocus}
      className={cn(
        " flex flex-col items-center p-2  rounded-xl shadow-md border justify-center z-10  relative",
        className
      )}
    >
      <span className=" mb-3">{icon}</span>
      <h4 className=" text-xl font-extrabold ">{header}</h4>
      <p>{description}</p>

      {/* <AnimatePresence>
        {focused && (
          <motion.div
            transition={{ duration: 0.5 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            layoutId="tab-indicator"
            className="bg-transparent border-2 border-primary absolute   w-[103%] h-[110%] rounded-2xl z-[-1]"
          />
        )}
      </AnimatePresence> */}
    </div>
  );
}

export default StoreServices;

/*
          initial={{ opacity: 0,left:"50%", top:"50%", translateX:"-50%",translateY:"-50%" }}
                  animate={{ opacity: 1,left:"50%", top:"50%", translateX:"-50%",translateY:"-50%"  }}
                  exit={{ opacity: 0,left:"50%", top:"50%", translateX:"-50%",translateY:"-50%"  
*/
