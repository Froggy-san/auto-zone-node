"use client";
import { Button } from "@components/ui/button";
import { logoutUser } from "@lib/actions/authActions";
import { cn } from "@lib/utils";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useToast } from "@hooks/use-toast";
import { ErorrToastDescription } from "@components/toast-items";
import UserUi from "@components/user-ui";
import useCurrUser from "@lib/queries/useCurrUser";

<ArrowLeftToLine />;
<ArrowRightToLine />;
const ICON_SIZE = 22;

interface Props {
  links: {
    icon: React.ReactNode;
    title: string;
    herf: string;
  }[];
}
const SideBar = ({ links }: Props) => {
  const [collapse, setCollapse] = useState(true);
  const [lock, setLock] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, error } = useCurrUser();
  // useEffect(() => {
  //   const body = document.querySelector("body");
  //   if (!menuOpen && !collapse && !lock) setCollapse(true);
  //   if (body) body.style.pointerEvents = "auto";
  // }, [menuOpen, setCollapse]);

  return (
    <motion.aside
      onMouseOver={() => {
        if (collapse && !lock) setCollapse(false);
      }}
      onMouseLeave={() => {
        if (!collapse && !lock && !menuOpen) setCollapse(true);
      }}
      animate={{
        width: !collapse ? 200 : 63,
      }}
      transition={{ duration: 0.5, type: "spring" }}
      className={cn(
        "w-[200px] px-1  relative hidden sm:flex flex-col justify-between pb-2  border-r ",
        { "w-fit": collapse },
      )}
    >
      <div className="absolute -right-[14px] top-1/2 -translate-y-1/2 flex flex-col gap-2">
        <Button
          onClick={() => setCollapse((is) => !is)}
          variant="outline"
          size="icon"
          className="  w-7 h-7"
        >
          <span
            className={cn(" transition-transform ", {
              "  rotate-180": collapse,
            })}
          >
            <ArrowLeftToLine size={14} />
          </span>
        </Button>

        <Button
          onClick={() => setLock((is) => !is)}
          variant="outline"
          size="icon"
          className="  w-7 h-7"
        >
          <span>
            {!lock ? <LockKeyholeOpen size={14} /> : <LockKeyhole size={14} />}
          </span>
        </Button>
      </div>
      <div className=" flex flex-col space-y-3 mt-7">
        {links.map((link, i) => (
          <React.Fragment key={i}>
            {links.length > 2 && (i === 3 || i === 6) ? (
              <div className=" w-[98%]  h-[1px] rounded-full  bg-muted mx-auto " />
            ) : null}
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      `  w-full justify-start gap-3`,
                      {
                        "w-fit": collapse,
                      },
                      { "bg-accent dark:bg-card": pathname === link.herf },
                    )}
                    asChild
                  >
                    <Link href={link.herf}>
                      <span>{link.icon}</span>{" "}
                      {!collapse && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="  text-muted-foreground"
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
                    className="  mb-5  dark:bg-card bg-secondary-foreground  text-white rounded "
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
  );
};

export default SideBar;

export const SideBarMobile = ({ links }: Props) => {
  const pathname = usePathname();
  return (
    <div className=" w-full flex gap-x-2  justify-center pb-2 px-2 sm:hidden border-t pt-1">
      {links.map((link, i) => (
        <Button
          key={i}
          variant="ghost"
          asChild
          className={`${
            pathname === link.herf && " bg-secondary dark:bg-card "
          }}`}
          style={{ width: `calc(90% / ${links.length})` }}
        >
          <Link href={link.herf}>
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
  );
};

function LogoutBtn({ collapse, lock }: { collapse: boolean; lock: boolean }) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  async function handleLogout() {
    setIsLoading(true);
    const error = await logoutUser();

    setIsLoading(false);
    if (error)
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: <ErorrToastDescription error={error} />,
      });
  }

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={async () => await handleLogout()}
            variant="ghost"
            className={cn(" w-full justify-start gap-3", {
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
                className="  text-muted-foreground"
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
            className="  mb-2 dark:bg-card bg-secondary-foreground  text-white rounded "
          >
            Log out
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
