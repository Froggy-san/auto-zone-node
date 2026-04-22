"use client"
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
// import { logoutUser } from "@lib/actions/authActions";
import { AppWindow, LogOut, PersonStanding, ShoppingCart } from "lucide-react"
// import Link from "next/link";
import { cn } from "@/lib/utils"
// import { useParams, usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/lib/client-helpers"
import { TbMessageReport } from "react-icons/tb"
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
  const { isLoading, user, client } = useCurrUser()
  const { toast } = useToast()
  const pathname = usePathname()
  const params = useParams()
  const queryClient = useQueryClient()

  if (isLoading) return <Spinner className="mb-2 h-fit" />
  if (!user)
    return (
      <Button size="sm" asChild>
        <Link href="/login">Login</Link>
      </Button>
    ) // Change this line later.
  const userId = params.userId
  const userData = user
  const image = client?.picture || userData?.user_metadata.avatar_url
  const name = client?.name || userData?.user_metadata.full_name
  const sameUser = userId === userData.id
  const isSettings = pathname.endsWith("settings") && sameUser
  const isActivities =
    pathname.split("/").length <= 3 && pathname.endsWith("") && sameUser

  function handleOpenMenu() {
    setOpen?.((isOpen) => {
      if (isOpen && !lock && !collapse) setCollapse?.(true)

      return !isOpen
    })
  }
  async function handleLogout() {
    setLoading(true)
    const error = await logoutUser()
    queryClient.invalidateQueries({ queryKey: ["user"] })
    setLoading(false)
    if (error)
      toast({
        variant: "destructive",
        title: "Something went wrong.",
        description: <ErorrToastDescription error={error} />,
      })
  }
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
          <div className="flex items-center justify-center">
            <img
              className="h-8 w-8 rounded-full object-cover object-top opacity-90 transition-all hover:cursor-pointer hover:contrast-75"
              src={image}
            />
          </div>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align={showName ? "start" : "end"}>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem disabled={loading || isActivities} asChild>
            <Link
              href={`/user/${userData.id}`}
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
              href={`/user/${userData.id}/settings`}
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
              href={`/user/${userData.id}/complaints`}
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
              href={`/cart`}
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

        <DropdownMenuItem disabled={loading} onClick={handleLogout}>
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
