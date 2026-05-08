import { cn } from "@lib/utils"
import { BadgeInfo } from "lucide-react"
import React from "react"

interface Props {
  className?: string
  children?: React.ReactNode
}
const Alert: React.FC<Props> = ({ className, children }) => {
  return (
    <div
      className={cn(
        "flex w-full items-center gap-3 rounded-md border border-destructive/70 bg-destructive/70 px-3 py-2 text-xs font-semibold text-red-700",
        className
      )}
    >
      <BadgeInfo className="h-5 w-5" />
      {children || "Attention needed"}
    </div>
  )
}

export default Alert
