import React from "react";
import { Button, ButtonProps } from "./ui/button";
import { useFormStatus } from "react-dom";
import Spinner from "./Spinner";

interface SubmitButton extends ButtonProps {
  pendingLabel?: string;
}
const SubmitButton: React.FC<SubmitButton> = ({
  variant,
  size,
  className,
  disabled,
  children,
  pendingLabel,
}) => {
  const { pending } = useFormStatus();
  return (
    <Button
      disabled={disabled || pending}
      variant={variant}
      size={size}
      className={className || ""}
    >
      {pending ? pendingLabel || <Spinner /> : children}
    </Button>
  );
};

export default SubmitButton;
