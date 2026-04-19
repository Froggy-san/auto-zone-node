import { cn } from "@lib/utils";
import React, { CSSProperties } from "react";

interface Props {
  className?: string;
  progressTrackClasses?: string;
  style?: CSSProperties;
  progressTrackStyles?: CSSProperties;
  value: number;
  maxValue: number;
}

const ProgressBar = ({
  value,
  maxValue,
  className,
  progressTrackClasses,
  style,
  progressTrackStyles,
}: Props) => {
  const progressPercentage = Math.min((value / maxValue) * 100, 100);
  return (
    <div
      className={cn(
        `relative w-full overflow-hidden h-[0.3rem] rounded-full border `,
        className
      )}
      style={style}
    >
      <div
        className={cn(
          ` absolute  top-0 w-full h-full bg-red-600 rounded-full transition-all duration-500 `,
          {
            " bg-green-600": value < 3,
          },
          progressTrackClasses
        )}
        style={{
          left: `${progressPercentage - 100}%`,
        }}
      />
    </div>
  );
};

export default ProgressBar;
