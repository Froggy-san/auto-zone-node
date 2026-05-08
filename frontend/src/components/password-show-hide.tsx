import React, { useCallback, useState, type SetStateAction } from "react"

import { Input } from "./ui/input"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "./ui/button"
import type { FieldValues } from "react-hook-form"
import { cn } from "@/lib/utils"

const PasswordShowHide = <TFieldValues extends FieldValues>({
  id,
  disabled,
  className,
  placeholder,
  onShow,
  show,
  value,
  onChange,
  ...props
}: {
  id?: string
  disabled?: boolean
  className?: string
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  onShow?: React.Dispatch<SetStateAction<boolean>>
  show?: boolean
}) => {
  const [isShowPass, setIsShowPass] = useState(false)

  const handleHideAndShow = useCallback(
    function () {
      if (onShow) {
        onShow((is) => !is)
      } else {
        setIsShowPass((is) => !is)
      }
    },
    [onShow]
  )

  return (
    <>
      {(show ? !show : !isShowPass) ? (
        <div className={cn("relative", className)}>
          <Input
            id={id}
            autoComplete="current-password"
            className="pr-10"
            disabled={disabled}
            type="password"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            {...props}
          />
          <Button
            type="button"
            size="icon"
            aria-label="Show password"
            variant="secondary"
            className="absolute top-1/2 right-3 h-7 w-7 translate-y-[-50%] active:!translate-y-[-50%]"
            onClick={handleHideAndShow}
          >
            <Eye size={17} />
          </Button>
        </div>
      ) : (
        <div className={cn("relative", className)}>
          <Input
            id={id}
            autoComplete="current-password"
            className="pr-10"
            disabled={disabled}
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            {...props}
          />
          <Button
            type="button"
            size="icon"
            aria-label="Hide password"
            variant="secondary"
            className="absolute top-1/2 right-3 h-7 w-7 translate-y-[-50%] active:!translate-y-[-50%]"
            onClick={handleHideAndShow}
          >
            <EyeOff size={17} />
          </Button>
        </div>
      )}
    </>
  )
}

export default PasswordShowHide
