import React from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useMediaQuery } from "@mui/material";
interface HoverPopCardProps {
  content: React.ReactNode;
  trigger: React.ReactNode;
  open: boolean;
  openDelay?: number;
  closeDelay?: number;
  minScreenWidth?: number;
  className?: string;
  onOpenChange?: (open: boolean) => void;
}

function HoverPopCard({
  content,
  trigger,
  open,
  onOpenChange,
  className,
  minScreenWidth = 640,
}: HoverPopCardProps) {
  const isBigScreen = useMediaQuery(`(min-width: ${minScreenWidth}px)`);
  if (isBigScreen)
    return (
      <HoverCard
        open={open}
        onOpenChange={onOpenChange}
        openDelay={100}
        closeDelay={200}
      >
        <HoverCardTrigger>{trigger}</HoverCardTrigger>
        <HoverCardContent className={className}>{content}</HoverCardContent>
      </HoverCard>
    );

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className={className}>{content}</PopoverContent>
    </Popover>
  );
}

export default HoverPopCard;
