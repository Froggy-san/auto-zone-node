import { cn } from "@lib/utils";
import { LoaderCircle } from "lucide-react";
import React from "react";

const Spinner = ({
  className,
  size = 20,
}: {
  className?: string;
  size?: number;
}) => {
  return (
    <div
      className={cn(
        " h-screen max-h-full flex items-center justify-center w-full",
        className
      )}
    >
      <LoaderCircle size={size} className="animate-spin" />
    </div>
  );
};

export default Spinner;
