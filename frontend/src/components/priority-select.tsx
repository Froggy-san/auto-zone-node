import * as React from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ColoredSignalIcon from "./ColoredSignals";
import { cn } from "@lib/utils";

interface Props {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function PrioritySelect({ value, onChange, className }: Props) {
  return (
    <Select defaultValue="low" value={value} onValueChange={onChange}>
      <SelectTrigger className={cn("w-[180px]  relative", className)}>
        <SelectValue placeholder="Select priority" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Priority</SelectLabel>
          <SelectItem
            value="Low"
            className="  flex items-center justify-between"
          >
            <Priority priority="low" />{" "}
            {/* <div className="  pl-10 relative w-full h-fit flex items-center gap-2">
              <ColoredSignalIcon
                bar1Color="hsl(127.46deg 89.33% 44.12%)"
                bar2Color="hsla(127.46deg, 89.33%, 44.12%, 25%)"
                bar3Color="hsla(127.46deg, 89.33%, 44.12%, 25%)"
                className=" w-9 h-9 absolute left-3 bottom-0 "
              />
              <span>Low</span>
            </div> */}
          </SelectItem>
          <SelectItem value="Medium">
            <Priority priority="medium" />

            {/* <div className="  pl-10 relative w-full h-fit flex items-center gap-2">
              <ColoredSignalIcon
                bar1Color="hsl(207.95deg 93.06% 66.08%)"
                bar2Color="hsl(207.95deg 93.06% 66.08%)"
                bar3Color="hsla(207.95deg, 93.06%, 66.08%, 25%)"
                className=" w-9 h-9 absolute left-3 bottom-0 "
              />
              <span>Medium</span>
            </div> */}
          </SelectItem>
          <SelectItem value="High">
            <Priority priority="high" />
            {/* <div className="  pl-10 relative w-full h-fit flex items-center gap-2">
              <ColoredSignalIcon
                bar1Color="hsl(353.94deg 100% 63.14%)"
                bar2Color="hsl(353.94deg 100% 63.14%)"
                bar3Color="hsl(353.94deg 100% 63.14%)"
                className=" w-9 h-9 absolute left-3 bottom-0 "
              />
              <span>High</span>
            </div> */}
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

interface PriorityProps extends React.HTMLAttributes<HTMLDivElement> {
  priority: string;
}

export function Priority({ priority, className, ...props }: PriorityProps) {
  if (priority?.toLocaleLowerCase() === "low")
    return (
      <div
        className={cn(
          "  pl-7 relative w-full h-fit flex items-center gap-2",
          className
        )}
        {...props}
      >
        <ColoredSignalIcon
          bar1Color="hsl(127.46deg 89.33% 44.12%)"
          bar2Color="hsla(127.46deg, 89.33%, 44.12%, 25%)"
          bar3Color="hsla(127.46deg, 89.33%, 44.12%, 25%)"
          className=" w-9 h-9 absolute left-0  bottom-0 "
        />
        <span className=" text-muted-foreground">Low</span>
      </div>
    );

  if (priority?.toLocaleLowerCase() === "medium")
    return (
      <div
        className={cn(
          "  pl-7 relative w-full h-fit flex items-center gap-2",
          className
        )}
        {...props}
      >
        <ColoredSignalIcon
          bar1Color="hsl(207.95deg 93.06% 66.08%)"
          bar2Color="hsl(207.95deg 93.06% 66.08%)"
          bar3Color="hsla(207.95deg, 93.06%, 66.08%, 25%)"
          className=" w-9 h-9 absolute left-0  bottom-0 "
        />
        <span className=" text-muted-foreground">Medium</span>
      </div>
    );

  if (priority?.toLocaleLowerCase() === "high")
    return (
      <div
        className={cn(
          "  pl-7 relative w-full h-fit flex items-center gap-2",
          className
        )}
        {...props}
      >
        <ColoredSignalIcon
          bar1Color="hsl(353.94deg 100% 63.14%)"
          bar2Color="hsl(353.94deg 100% 63.14%)"
          bar3Color="hsl(353.94deg 100% 63.14%)"
          className=" w-9 h-9 absolute left-0  bottom-0 "
        />
        <span className=" text-muted-foreground">High</span>
      </div>
    );

  return (
    <div
      className={cn(
        "  pl-7 relative w-full h-fit flex items-center gap-2",
        className
      )}
      {...props}
    >
      <ColoredSignalIcon
        bar1Color="hsl(127.46deg 89.33% 44.12%)"
        bar2Color="hsla(127.46deg, 89.33%, 44.12%, 25%)"
        bar3Color="hsla(127.46deg, 89.33%, 44.12%, 25%)"
        className=" w-9 h-9 absolute left-0  bottom-0 "
      />
      <span className=" text-muted-foreground">Low</span>
    </div>
    // <div
    //   className={cn(
    //     "  pl-7 relative w-full h-fit flex items-center gap-2 text-muted-foreground ",
    //     className
    //   )}
    //   {...props}
    // >
    //   <ColoredSignalIcon className=" w-9 h-9 absolute left-0  bottom-0  text-orange-500 " />
    //   <span>Normal</span>
    // </div>
  );
}
