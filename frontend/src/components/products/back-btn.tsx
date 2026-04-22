"use client";
import { Button } from "@components/ui/button";
import { cn } from "@lib/utils";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

type BackButton = React.HTMLAttributes<HTMLButtonElement>;

const BackBtn = ({ onClick, className, ...props }: BackButton) => {
  const router = useRouter();

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={(e) => {
        if (onClick !== undefined) {
          onClick?.(e);
        } else {
          router.back();
        }
      }}
      className={cn("group", className)}
      {...props}
    >
      <ArrowLeft className=" icon  w-4 h-4  sm:w-6 sm:h-6  group-hover:-translate-x-1 transition-all" />
    </Button>
  );
};

export default BackBtn;
