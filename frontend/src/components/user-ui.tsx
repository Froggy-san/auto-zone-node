import React, { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "./ui/button"
// import useCurrUser from "@/lib/queries/useCurrUser";
import Spinner from "./Spinner"

import { motion } from "framer-motion"
// import { useToast } from "@hooks/use-toast";
import { ErorrToastDescription } from "./toast-items"

import { AppWindow, LogOut, PersonStanding, ShoppingCart } from "lucide-react"
// import Link from "next/link";
import { cn } from "@/lib/utils"
// import { useParams, usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/lib/client-helpers"
import { TbMessageReport } from "react-icons/tb"
import useCurrentUser from "@/features/users/useCurrentUser"
import { Link, useLocation, useParams } from "react-router"
import { BASE_URL } from "@/lib/constants"
import { logout } from "@/services/authApi"
import { toast } from "sonner"
import useLogout from "@/features/auth/useLogout"
interface Props {
  collapse?: boolean
  lock?: boolean
  open?: boolean
  showName?: boolean
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>
  setCollapse?: React.Dispatch<React.SetStateAction<boolean>>
}

const image =
  "https://umkyoinqpknmedkowqva.supabase.co/storage/v1/object/public/defualt-image//Kyoo%20Pal.jpg"

const UserUi = ({
  showName,
  lock,
  collapse,
  open,
  setOpen,
  setCollapse,
}: Props) => {
  // const [open,setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { user, isLoading, error } = useCurrentUser()

  const pathname = useLocation().pathname
  const params = useParams()
  const queryClient = useQueryClient()
  const { logout, isPending } = useLogout()
  if (isLoading) return <Spinner className="mb-2 h-fit" />
  if (!user)
    return (
      <Button size="sm" asChild>
        <Link to="/login">Login</Link>
      </Button>
    ) // Change this line later.
  const userId = params.userId

  const image = user?.picture ? `${BASE_URL}/${user.picture}` : undefined
  const name = user.username
  const sameUser = userId === user._id
  const isSettings = pathname.endsWith("settings") && sameUser

  const isActivities =
    pathname.split("/").length <= 3 && pathname.endsWith("") && sameUser

  function handleOpenMenu() {
    setOpen?.((isOpen) => {
      if (isOpen && !lock && !collapse) setCollapse?.(true)

      return !isOpen
    })
  }
  // async function handleLogout() {
  //   setLoading(true)
  //   await logout()
  //   queryClient.invalidateQueries({ queryKey: ["user"] })
  //   setLoading(false)
  //   if (error) toast.success("Loggedout")
  // }
  return (
    <DropdownMenu open={open} onOpenChange={handleOpenMenu}>
      <DropdownMenuTrigger asChild>
        {showName ? (
          <Button
            variant="ghost"
            size="sm"
            className={cn("mb-1 h-10 w-full gap-2", {
              "w-fit": collapse,
            })}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={image} />

              <AvatarFallback>{getInitials(name)}</AvatarFallback>
            </Avatar>
            {!collapse && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 text-left text-ellipsis text-muted-foreground"
              >
                {name}
              </motion.span>
            )}
          </Button>
        ) : (
          <Avatar className="h-8 w-8">
            <AvatarImage src={image} />

            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </Avatar>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align={showName ? "start" : "end"}>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem disabled={loading || isActivities} asChild>
            <Link
              to={`/user/${user._id}`}
              className="flex w-full items-center justify-between"
            >
              Activities
              <DropdownMenuShortcut>
                <AppWindow className="h-4 w-4" />
              </DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem disabled={loading || isSettings} asChild>
            <Link
              to={`/user/${user._id}/settings`}
              className="flex w-full items-center justify-between"
            >
              Personal details
              <DropdownMenuShortcut>
                <PersonStanding className="h-4 w-4" />
              </DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem disabled={loading || isSettings} asChild>
            <Link
              to={`/user/${user._id}/complaints`}
              className="flex w-full items-center justify-between"
            >
              Complanints
              <DropdownMenuShortcut>
                <TbMessageReport className="h-4 w-4" />
              </DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem disabled={loading || isSettings} asChild>
            <Link
              to={`/cart`}
              className="flex w-full items-center justify-between"
            >
              Your Cart
              <DropdownMenuShortcut>
                <ShoppingCart className="h-4 w-4" />
              </DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        <DropdownMenuItem disabled={loading} onClick={() => logout()}>
          Log out
          <DropdownMenuShortcut>
            <LogOut className="h-4 w-4" />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserUi
