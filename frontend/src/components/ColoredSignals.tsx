import { cn } from "@lib/utils";
import React, { SVGProps } from "react";

// Define the interface for our component's props
interface ColoredSignalIconProps extends SVGProps<SVGSVGElement> {
  // Custom props for the three distinct bar colors
  bar1Color?: string;
  bar2Color?: string;
  bar3Color?: string;

  // Custom size prop (can accept CSS values like '24px' or '2em')
  size?: string | number;
}
// The actual SVG for PiCellSignalMediumBold with dynamic fill props.
const ColoredSignalIcon = ({
  stroke,
  bar1Color,
  bar2Color,
  bar3Color,
  size = "1em",
  className,
  ...props
}: ColoredSignalIconProps) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke || "currentColor"}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(
        "lucide lucide-signal-medium-icon lucide-signal-medium w-14 h-14",
        className
      )}
    >
      <path d="M4 20v-0.7" stroke={bar1Color || "currentColor"} />

      <path d="M8 20v-4" stroke={bar2Color || "currentColor"} />

      <path d="M12 20v-8" stroke={bar3Color || "currentColor"} />
    </svg>
  );
};

export default ColoredSignalIcon;
