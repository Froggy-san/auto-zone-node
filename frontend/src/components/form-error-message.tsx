import React from "react";
import { motion, MotionProps } from "framer-motion";
import { cn } from "@lib/utils";
// Because 'HTMLParagraphElement' has some of the same properties of 'Motion Props' we are telling typescript to remove the samiliar types from one of them.
type HTMLParagraphProps = Omit<
  React.HTMLAttributes<HTMLParagraphElement>,
  "onAnimationStart" | "onDrag" | "onDragEnd" | "onDragStart" | "style"
>;
interface ErrorMessageProps extends HTMLParagraphProps, MotionProps {
  children: React.ReactNode;
}
const FormErrorMessage = React.forwardRef<
  HTMLParagraphElement,
  ErrorMessageProps
>(({ children, className, ...props }, ref) => {
  return (
    <motion.p
      ref={ref}
      initial={{
        height: 0,
        translateX: -5,
        opacity: 0,
      }}
      animate={{
        height: "auto",
        translateX: 0,
        opacity: 1,
      }}
      exit={{
        height: 0,
        translateX: -5,
        opacity: 0,
      }}
      layout
      className={cn("text-xs font-semibold text-destructive", className)}
      {...props}
    >
      {children}
    </motion.p>
  );
});

FormErrorMessage.displayName = "FormErrorMessage"; // Optional: Helps with debugging in React DevTools

export default FormErrorMessage;
