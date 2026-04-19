"use client";
import React, { forwardRef, SetStateAction, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Eye, EyeOff } from "lucide-react";
interface HideShowPasswordProps {
  setShow?: React.Dispatch<SetStateAction<boolean>>;
  show?: boolean;
  value: string;
  disabled?: boolean;
  onChange: React.Dispatch<SetStateAction<string>>;
}
const HideShowPassword: React.FC<HideShowPasswordProps> = forwardRef(
  (
    { show, setShow, value, onChange, disabled },
    ref?: React.Ref<HTMLInputElement>
  ) => {
    const [isShow, setIsShow] = useState(false);

    function handleShow() {
      if (setShow) {
        setShow((is) => !is);
      } else {
        setIsShow((is) => !is);
      }
    }
    return (
      <>
        {!(show || !isShow) ? (
          <div className=" relative ">
            <Input
              ref={ref}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className=" pr-10"
              disabled={disabled}
              type="text"
              placeholder="Confirm password"
            />
            <Button
              type="button"
              size="icon"
              aria-label="Hide password"
              variant="secondary"
              className="  absolute w-7 h-7 right-3 top-1/2 translate-y-[-50%]"
              onClick={handleShow}
            >
              <EyeOff size={17} />
            </Button>
          </div>
        ) : (
          <div className=" relative ">
            <Input
              ref={ref}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className=" pr-10"
              disabled={disabled}
              type="password"
              placeholder="Password"
            />
            <Button
              type="button"
              size="icon"
              aria-label="Show password"
              variant="secondary"
              className="  absolute w-7 h-7 right-3 top-1/2 translate-y-[-50%]"
              onClick={handleShow}
            >
              <Eye size={17} />
            </Button>
          </div>
        )}
      </>
    );
  }
);
HideShowPassword.displayName = "HideShowPassword";
export default HideShowPassword;
