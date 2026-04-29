import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ArrowLeft } from "lucide-react"

import React from "react"
import { useNavigate } from "react-router"

type BackButton = React.HTMLAttributes<HTMLButtonElement>

const BackBtn = ({ onClick, className, ...props }: BackButton) => {
  const navigate = useNavigate()

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={(e) => {
        if (onClick !== undefined) {
          onClick?.(e)
        } else {
          navigate(-1)
        }
      }}
      className={cn("group", className)}
      {...props}
    >
      <ArrowLeft className="icon h-4 w-4 transition-all group-hover:-translate-x-1 sm:h-6 sm:w-6" />
    </Button>
  )
}

export default BackBtn
