import { cn } from "@/lib/utils"
import { Cross2Icon } from "@radix-ui/react-icons"
import React from "react"

interface Props extends React.HTMLAttributes<HTMLButtonElement> {}

const CloseButton = ({ className, ...props }: Props) => {
  return (
    <button
      {...props}
      type="button"
      className={cn(
        "absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
        className
      )}
    >
      <Cross2Icon className="h-4 w-4" />
      {/* <span className="sr-only">Close</span> */}
    </button>
  )
}

export default CloseButton
