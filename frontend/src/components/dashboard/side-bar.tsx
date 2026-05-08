import { Button } from "@/components/ui/button"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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
} from "lucide-react"

import React, { useEffect, useState } from "react"

import UserUi from "@/components/user-ui"

import { Link, useLocation } from "react-router"
import useLogout from "@/features/auth/useLogout"

const ICON_SIZE = 22

interface Props {
  links: {
    icon: React.ReactNode
    title: string
    herf: string
  }[]
}
const SideBar = ({ links }: Props) => {
  const [collapse, setCollapse] = useState(true)
  const [lock, setLock] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = useLocation().pathname
  // const { user, error } = useCurrUser()
  // useEffect(() => {
  //   const body = document.querySelector("body");
  //   if (!menuOpen && !collapse && !lock) setCollapse(true);
  //   if (body) body.style.pointerEvents = "auto";
  // }, [menuOpen, setCollapse]);

  return (
    <motion.aside
      onMouseOver={() => {
        if (collapse && !lock) setCollapse(false)
      }}
      onMouseLeave={() => {
        if (!collapse && !lock && !menuOpen) setCollapse(true)
      }}
      animate={{
        width: !collapse ? 200 : 63,
      }}
      transition={{ duration: 0.5, type: "spring" }}
      className={cn(
        "relative hidden w-[200px] flex-col justify-between border-r px-1 pb-2 sm:flex",
        { "w-fit": collapse }
      )}
    >
      <div className="absolute top-1/2 -right-[14px] flex -translate-y-1/2 flex-col gap-2">
        <Button
          onClick={() => setCollapse((is) => !is)}
          variant="outline"
          size="icon"
          className="h-7 w-7"
        >
          <span
            className={cn("transition-transform", {
              "rotate-180": collapse,
            })}
          >
            <ArrowLeftToLine size={14} />
          </span>
        </Button>

        <Button
          onClick={() => setLock((is) => !is)}
          variant="outline"
          size="icon"
          className="h-7 w-7"
        >
          <span>
            {!lock ? <LockKeyholeOpen size={14} /> : <LockKeyhole size={14} />}
          </span>
        </Button>
      </div>
      <div className="mt-7 flex flex-col space-y-3">
        {links.map((link, i) => (
          <React.Fragment key={i}>
            {links.length > 2 && (i === 3 || i === 6) ? (
              <div className="mx-auto h-[1px] w-[98%] rounded-full bg-muted" />
            ) : null}
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      `w-full justify-start gap-3`,
                      {
                        "w-fit": collapse,
                      },
                      { "bg-accent dark:bg-card": pathname === link.herf }
                    )}
                    asChild
                  >
                    <Link to={link.herf}>
                      <span>{link.icon}</span>{" "}
                      {!collapse && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-muted-foreground"
                        >
                          {link.title}
                        </motion.span>
                      )}
                    </Link>
                  </Button>
                </TooltipTrigger>
                {collapse && lock && (
                  <TooltipContent
                    avoidCollisions
                    align="center"
                    sideOffset={10}
                    side="right"
                    className="mb-5 rounded bg-secondary-foreground text-white dark:bg-card"
                  >
                    {link.title}
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </React.Fragment>
        ))}
      </div>
      <UserUi
        open={menuOpen}
        setOpen={setMenuOpen}
        collapse={collapse}
        lock={lock}
        setCollapse={setCollapse}
        showName
      />
      {/* <LogoutBtn collapse={collapse} lock={lock} /> */}
    </motion.aside>
  )
}

export default SideBar

export const SideBarMobile = ({ links }: Props) => {
  const pathname = useLocation().pathname
  return (
    <div className="flex w-full justify-center gap-x-2 border-t px-2 pt-1 pb-2 sm:hidden">
      {links.map((link, i) => (
        <Button
          key={i}
          variant="ghost"
          asChild
          className={`${
            pathname === link.herf && "bg-secondary dark:bg-card"
          }}`}
          style={{ width: `calc(90% / ${links.length})` }}
        >
          <Link to={link.herf}>
            <span>{link.icon}</span>{" "}
            {/* <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="  text-muted-foreground"
            >
              {link.title}
            </motion.span> */}
          </Link>
        </Button>
      ))}
    </div>
  )
}

function LogoutBtn({ collapse, lock }: { collapse: boolean; lock: boolean }) {
  const { logout, isPending: isLoading } = useLogout()

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={() => logout()}
            variant="ghost"
            className={cn("w-full justify-start gap-3", {
              "w-fit": collapse,
              "opacity-40": isLoading,
            })}
          >
            <span>
              <LogOut size={ICON_SIZE} />
            </span>{" "}
            {!collapse && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-muted-foreground"
              >
                Logout
              </motion.span>
            )}
          </Button>
        </TooltipTrigger>
        {collapse && lock && (
          <TooltipContent
            avoidCollisions
            align="center"
            sideOffset={10}
            side="right"
            className="mb-2 rounded bg-secondary-foreground text-white dark:bg-card"
          >
            Log out
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  )
}
