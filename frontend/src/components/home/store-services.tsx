import { cn } from "@/lib/utils"
import { Cross, Drill, MapPinCheckInside, Recycle } from "lucide-react"
import React, { useState } from "react"
import { AnimatePresence, LayoutGroup, motion } from "framer-motion"
import { PiEngineBold } from "react-icons/pi"

import { TbBatteryAutomotive } from "react-icons/tb"
import { Link } from "react-router"

interface ItemProps {
  className?: string
  icon?: React.ReactNode | string
  link: string
  header?: string
  description?: string
  focused: boolean
  focus: () => void
  unFocus: () => void
}
const ITEMS: Omit<ItemProps, "className" | "focused" | "focus" | "unFocus">[] =
  [
    {
      icon: <Drill className="h-10 w-10 xs:h-12 xs:w-12" />,
      link: "/loan-a-tool",
      header: "Loan-A-Tool",
      description: "Borrow a specialty tools.",
    },
    {
      icon: <PiEngineBold className="h-10 w-10 xs:h-12 xs:w-12" />,
      link: "/engine-check",
      header: "Engine check-up",
      description: "We will check your engine and give you a free report.",
    },

    {
      icon: <Cross className="h-10 w-10 xs:h-12 xs:w-12" />,
      link: "/part-testing",
      header: "Free In-Store Parts Testing",
      description: "We'll check your alternator, starter, battery and more.",
    },

    {
      icon: <TbBatteryAutomotive className="h-10 w-10 xs:h-12 xs:w-12" />,
      link: "battary-testing",
      header: "Battery Solutions",
      description:
        "Check it before you buy it or bring a dead battery back to life.",
    },

    {
      icon: <Recycle className="h-10 w-10 xs:h-12 xs:w-12" />,
      link: "/recycling",
      header: "Recycling",
      description:
        "Bring us your used oil or get credits for your used batteries.",
    },

    {
      icon: <MapPinCheckInside className="h-10 w-10 xs:h-12 xs:w-12" />,
      link: "/pick-up",
      header: "Store Pick Up",
      description: "Pick up at any location in Egypt.",
    },
  ]

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
      className={cn("grid grid-cols-2 gap-3 p-3 md:grid-cols-3", className)}
    >
      <LayoutGroup>
        {ITEMS.map((item, i) => (
          //  Add this to the li and see the difference: hover:scale-95 transition-all
          <li
            // onMouseEnter={() => setFocused(i)}
            // onFocus={() => setFocused(i)}
            //   onMouseLeave={unFocus}
            className={cn(
              "relative z-10 rounded-xl border-2 shadow-md transition-all duration-500 hover:border-primary/80"
            )}
            key={i}
          >
            <Link
              to={item.link}
              className="flex flex-col items-center justify-center p-2 focus:right-0 focus:border-none focus:outline-none"
            >
              <span className="mb-3">{item.icon}</span>
              <h4 className="text-center font-extrabold sm:text-xl">
                {item.header}
              </h4>
              <p className="mx-auto w-[80%] text-center text-xs xs:text-sm sm:text-base">
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
  )
}

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
        "relative z-10 flex flex-col items-center justify-center rounded-xl border p-2 shadow-md",
        className
      )}
    >
      <span className="mb-3">{icon}</span>
      <h4 className="text-xl font-extrabold">{header}</h4>
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
  )
}

export default StoreServices

/*
          initial={{ opacity: 0,left:"50%", top:"50%", translateX:"-50%",translateY:"-50%" }}
                  animate={{ opacity: 1,left:"50%", top:"50%", translateX:"-50%",translateY:"-50%"  }}
                  exit={{ opacity: 0,left:"50%", top:"50%", translateX:"-50%",translateY:"-50%"  
*/
