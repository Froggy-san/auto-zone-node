import React from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "@components/ui/button"
import { CircleAlert } from "lucide-react"
const WarningTooltip = () => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <div className="absolute top-5 right-5 w-fit">
          <TooltipTrigger asChild>
            <Button variant="secondary" className="h-7 w-7 rounded-full p-0">
              <CircleAlert className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
        </div>
        <TooltipContent className="max-w-[200px] text-[10px]">
          <p>
            Updates to the revenue data are not immediately reflected on the
            charts. To see the full data after updating, please refresh the
            page.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default WarningTooltip
