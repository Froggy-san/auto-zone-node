import { cn } from "@/lib/utils"
import React, { useCallback, useState } from "react"
import { Button } from "./ui/button"
import { Eye, EyeOff } from "lucide-react"

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  show?: boolean
  setShow?: React.Dispatch<React.SetStateAction<boolean>>
  //   value?: string;
  //   onChange?: React.Dispatch<React.SetStateAction<string>>;
}
const PasswordInput = React.forwardRef<HTMLInputElement, Props>(
  ({ className, style, type, show, setShow, ...props }, ref) => {
    const [isShowPass, setIsShowPass] = useState(false)

    const isShow = show || isShowPass
    // const handleChangeValue = useCallback(
    //   (value: string) => {
    //     setValue(value);
    //     onChange?.(value);
    //   },
    //   [setValue, onChange]
    // );

    const handleShow = useCallback(() => {
      setIsShowPass((show) => !show)
      setShow?.((show) => !show)
    }, [setIsShowPass, setShow])

    if (isShow) {
      return (
        <div className={cn("relative", className)} style={style}>
          <input
            type="text"
            className="input flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            ref={ref}
            {...props}
          />
          <Button
            type="button"
            size="icon"
            aria-label="Show password"
            variant="secondary"
            className="show-btn absolute top-1/2 right-3 h-7 w-7 translate-y-[-50%] active:!translate-y-[-50%]"
            onClick={handleShow}
          >
            <EyeOff size={17} />
          </Button>
        </div>
      )
    }

    return (
      <div className={cn("relative", className)} style={style}>
        <input
          type="password"
          className="input flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          ref={ref}
          {...props}
        />
        <Button
          type="button"
          size="icon"
          aria-label="Show password"
          variant="secondary"
          className="show-btn absolute top-1/2 right-3 h-7 w-7 translate-y-[-50%] active:!translate-y-[-50%]"
          onClick={handleShow}
        >
          <Eye size={17} />
        </Button>
      </div>
    )
  }
)

PasswordInput.displayName = "PasswordInput"
export default PasswordInput
