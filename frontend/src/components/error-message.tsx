import { cn } from "@/lib/utils"
import React, { type CSSProperties } from "react"
import { TbFaceIdError } from "react-icons/tb"

interface Props {
  className?: string
  style?: CSSProperties
  children: React.ReactNode
  icon?: React.ReactNode
}
const ErrorMessage = ({ children, style, icon, className }: Props) => {
  return (
    <div
      style={style}
      className={cn(
        "text-md flex flex-col items-center justify-center gap-2 px-4 text-center text-muted-foreground sm:text-left sm:text-xl lg:text-2xl",
        className
      )}
    >
      {icon ? icon : <TbFaceIdError className="h-7 w-7 sm:h-12 sm:w-12" />}
      {children}{" "}
    </div>
  )
}

export default ErrorMessage
