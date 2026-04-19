import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@components/ui/button";
import { CircleAlert } from "lucide-react";
const WarningTooltip = () => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <div className=" absolute right-5 top-5 w-fit ">
          <TooltipTrigger asChild>
            <Button variant="secondary" className="  p-0 w-7 h-7 rounded-full ">
              <CircleAlert className=" w-4 h-4" />
            </Button>
          </TooltipTrigger>
        </div>
        <TooltipContent className=" max-w-[200px]  text-[10px]">
          <p>
            Updates to the revenue data are not immediately reflected on the
            charts. To see the full data after updating, please refresh the
            page.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default WarningTooltip;
