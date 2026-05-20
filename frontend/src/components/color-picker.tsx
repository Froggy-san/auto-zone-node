import { type HslColor } from "@/lib/types"
import { cn } from "@/lib/utils"
import { ClickAwayListener } from "@mui/material"
import { useTheme } from "next-themes"
import React, { useEffect, useMemo, useState } from "react"
import { type ColorChangeHandler, SketchPicker } from "react-color"

interface Props {
  primaryMode: "light" | "dark"
  color: HslColor
  handler: ColorChangeHandler
  disableAlpha?: boolean
  paletteClassName?: string
  className?: string
}

type Theme = "dark" | "light" | "system" | string | undefined

const ColorPicker = ({
  primaryMode,
  color,
  handler,
  disableAlpha = false,
  className,
  paletteClassName,
}: Props) => {
  const { theme, setTheme } = useTheme()
  const initialTheme: Theme = useMemo(() => {
    return theme
  }, [])

  const [firstMount, setFirstMount] = useState(true)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (firstMount) return
    if (open) {
      setTheme(primaryMode)
    } else {
      if (initialTheme === primaryMode) return
      if (initialTheme) setTheme(initialTheme)
    }
  }, [open, firstMount, initialTheme, primaryMode])

  useEffect(() => {
    setFirstMount(false)
    return () => setFirstMount(true)
  }, [])

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <div className="relative w-full">
        <button
          type="button"
          className={cn(`z-10 h-9 w-full rounded-md border`, className)}
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
            "color-inputs invisible absolute top-5 left-1/2 z-50 -translate-x-1/2 text-black opacity-0 transition-all",
            { "visible top-10 opacity-100": open },
            paletteClassName
          )}
        />
      </div>
    </ClickAwayListener>
  )
}

export default ColorPicker
