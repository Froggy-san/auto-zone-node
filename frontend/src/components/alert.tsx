import { cn } from "@lib/utils";
import { BadgeInfo } from "lucide-react";
import React from "react";

interface Props {
  className?: string;
  children?: React.ReactNode;
}
const Alert: React.FC<Props> = ({ className, children }) => {
  return (
    <div
      className={cn(
        "px-3 py-2 rounded-md  text-xs  text-red-700    font-semibold border border-destructive/70 bg-destructive/70 w-full   flex items-center gap-3",
        className
      )}
    >
      <BadgeInfo className=" w-5 h-5 " />
      {children || "Attention needed"}
    </div>
  );
};

export default Alert;
