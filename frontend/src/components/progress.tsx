import { cn } from "@lib/utils";
import React, { createContext, CSSProperties, useContext } from "react";

interface ContextProps {
  value: number;
  maxValue: number;
}

const ProgressContext = createContext<ContextProps>({
  value: 0,
  maxValue: 0,
});

interface ProgressProps {
  children: React.ReactNode;
  value: number;
  maxValue: number;
}

function Progress({ value, maxValue, children }: ProgressProps) {
  return (
    <ProgressContext.Provider value={{ value, maxValue }}>
      {children}
    </ProgressContext.Provider>
  );
}

// Define your custom props
interface ProgressBarContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  customProp?: string; // Add any additional props you want
}
const ProgressBarContainer: React.FC<ProgressBarContainerProps> =
  React.forwardRef<
    React.ElementRef<"div">,
    React.ComponentPropsWithoutRef<"div">
  >(({ children, className, ...rest }, ref) => {
    return (
      <div
        className={cn(
          "relative w-full overflow-hidden h-[0.3rem] rounded-full border",
          className
        )}
        ref={ref}
        {...rest}
      >
        {children}
      </div>
    );
  });

type ColorValue = {
  whenValueIs: number;
  color: string;
};

interface ProgressMeterProps {
  className?: string;
  style?: CSSProperties;
  colorArr?: ColorValue[];
}

function ProgressMeter({ className, style }: ProgressMeterProps) {
  const { value, maxValue } = useContext(ProgressContext);
  const progressPercentage = Math.min((value / maxValue) * 100, 100);
  return (
    <div
      className={cn(
        "absolute  top-0 w-full h-full bg-primary rounded-full transition-all duration-500 ",
        className
      )}
      style={{ left: `${progressPercentage - 100}%`, ...style }}
    />
  );
}

ProgressBarContainer.displayName = "ProgressBarContainer";
ProgressMeter.displayName = "ProgressMeter";
Progress.ProgressBarContainer = ProgressBarContainer;
Progress.ProgressMeter = ProgressMeter;

export { Progress, ProgressBarContainer, ProgressMeter };

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context)
    throw new Error(
      `you have used the Progress context outside of it's providor.`
    );
  return context;
}
// Use Cases

// 1.

{
  /* <Progress value={value} maxValue={maxValue} >
  <ProgressBarContainer>
    <ProgressMeter />
  </ProgressBarContainer>
</Progress>; */
}

// 2.

{
  /* <Progress value={value} maxValue={maxValue} >
  <Progress.ProgressBarContainer>
    <Progress.ProgressMeter />
  </Progress.ProgressBarContainer>
</Progress>; */
}
