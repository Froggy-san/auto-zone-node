"use client";
import React, { SetStateAction, useCallback, useState } from "react";
import { Control, FieldValues, Path } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";

import { Input } from "./ui/input";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "./ui/button";

const PasswordShowHide = <TFieldValues extends FieldValues>({
  control,
  labelText,
  disabled,
  fieldName,
  className,
  description,
  placeholder,
  onChange,
  show,
}: {
  fieldName: Path<TFieldValues>;
  control: Control<TFieldValues>;
  labelText: string;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  description?: string;
  onChange?: React.Dispatch<SetStateAction<boolean>>;
  show?: boolean;
}) => {
  const [isShowPass, setIsShowPass] = useState(false);

  const handleHideAndShow = useCallback(
    function () {
      if (onChange) {
        onChange((is) => !is);
      } else {
        setIsShowPass((is) => !is);
      }
    },
    [onChange]
  );

  return (
    <>
      {(show ? !show : !isShowPass) ? (
        <FormField
          control={control}
          name={fieldName}
          render={({ field }) => (
            <FormItem className={className}>
              <FormLabel>{labelText}</FormLabel>
              <FormControl>
                <div className=" relative ">
                  <Input
                    className=" pr-10"
                    disabled={disabled}
                    type="password"
                    placeholder={placeholder || "Placeholder"}
                    {...field}
                  />
                  <Button
                    type="button"
                    size="icon"
                    aria-label="Show password"
                    variant="secondary"
                    className="  absolute w-7 h-7 right-3 top-1/2 translate-y-[-50%]"
                    onClick={handleHideAndShow}
                  >
                    <Eye size={17} />
                  </Button>
                </div>
              </FormControl>
              {description ? (
                <FormDescription>{description}</FormDescription>
              ) : null}
              <FormMessage />
            </FormItem>
          )}
        />
      ) : (
        <FormField
          control={control}
          name={fieldName}
          render={({ field }) => (
            <FormItem className={className}>
              <FormLabel>{labelText}</FormLabel>
              <FormControl>
                <div className=" relative ">
                  <Input
                    className=" pr-10"
                    disabled={disabled}
                    type="text"
                    placeholder={placeholder || "Placeholder"}
                    {...field}
                  />
                  <Button
                    type="button"
                    size="icon"
                    aria-label="Hide password"
                    variant="secondary"
                    className="  absolute w-7 h-7 right-3 top-1/2 translate-y-[-50%]"
                    onClick={handleHideAndShow}
                  >
                    <EyeOff size={17} />
                  </Button>
                </div>
              </FormControl>
              {description ? (
                <FormDescription>{description}</FormDescription>
              ) : null}
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  );
};

export default PasswordShowHide;
