import { cn } from "@lib/utils";
import React, { CSSProperties } from "react";
import { TbFaceIdError } from "react-icons/tb";

interface Props {
  className?: string;
  style?: CSSProperties;
  children: React.ReactNode;
  icon?: React.ReactNode;
}
const ErrorMessage = ({ children, style, icon, className }: Props) => {
  return (
    <div
      style={style}
      className={cn(
        " flex flex-col-reverse text-center sm:text-left sm:flex-row items-center justify-center gap-2 text-md text-muted-foreground sm:text-2xl",
        className
      )}
    >
      {children}{" "}
      {icon ? icon : <TbFaceIdError className="  w-7 h-7 sm:w-10 sm:h-10" />}
    </div>
  );
};

export default ErrorMessage;
