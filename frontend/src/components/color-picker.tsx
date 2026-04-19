"use client";
import { HslColor } from "@lib/types";
import { cn } from "@lib/utils";
import { ClickAwayListener } from "@mui/material";
import { useTheme } from "next-themes";
import React, { useEffect, useMemo, useState } from "react";
import { ColorChangeHandler, SketchPicker } from "react-color";

interface Props {
  primaryMode: "light" | "dark";
  color: HslColor;
  handler: ColorChangeHandler;
  disableAlpha?: boolean;
  paletteClassName?: string;
  className?: string;
}

type Theme = "dark" | "light" | "system" | string | undefined;

const ColorPicker = ({
  primaryMode,
  color,
  handler,
  disableAlpha = false,
  className,
  paletteClassName,
}: Props) => {
  const { theme, setTheme } = useTheme();
  const initialTheme: Theme = useMemo(() => {
    return theme;
  }, []);

  const [firstMount, setFirstMount] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (firstMount) return;
    if (open) {
      setTheme(primaryMode);
    } else {
      if (initialTheme === primaryMode) return;
      if (initialTheme) setTheme(initialTheme);
    }
  }, [open, firstMount, initialTheme, primaryMode]);

  useEffect(() => {
    setFirstMount(false);
    return () => setFirstMount(true);
  }, []);

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <div className="  w-full  relative">
        <button
          type="button"
          className={cn(`w-full h-9 z-10 rounded-md border `, className)}
          style={{
            backgroundColor: `hsl(${color.h} ${color.s}% ${color.l}%)`,
          }}
          onClick={() => setOpen((is) => !is)}
        />

        <SketchPicker
          color={color}
          onChange={handler}
          disableAlpha={disableAlpha}
          className={cn(
            "absolute left-1/2 -translate-x-1/2  top-5  z-50 invisible opacity-0  transition-all  color-inputs  text-black",
            { " visible opacity-100 top-10": open },
            paletteClassName
          )}
        />
      </div>
    </ClickAwayListener>
  );
};

export default ColorPicker;
