"use client";
import React from "react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Key, LogOut, Settings2, User } from "lucide-react";
import Link from "next/link";
import { logoutUser } from "@/lib/actions/authActions";
import { User as UserType } from "@/lib/types";

const UserHeaderBtn = ({ user }: { user: UserType | null }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className=" rounded-full">
          <User size={20} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {user ? (
          <DropdownMenuItem
            onClick={async () => {
              await logoutUser();
            }}
          >
            Logout
            <DropdownMenuShortcut>
              <LogOut size={15} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        ) : (
          <Link href="/login">
            <DropdownMenuItem>
              Login
              <DropdownMenuShortcut>
                <Key size={15} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </Link>
        )}

        <Link aria-disabled={!user} href={user ? `/user/${user.id}` : ""}>
          <DropdownMenuItem>
            Settings
            <DropdownMenuShortcut>
              <Settings2 size={15} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserHeaderBtn;
