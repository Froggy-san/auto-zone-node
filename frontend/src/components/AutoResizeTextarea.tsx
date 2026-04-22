import React, { useCallback, useEffect, useRef, useState } from "react";
import { Textarea } from "./ui/textarea";
interface AutoResizeTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  // We explicitly define value and onChange for clarity, though TextareaHTMLAttributes includes them
  // value: string;

  maxHeight?: number;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

// Define a maximum height to prevent it from growing infinitely
const MAX_HEIGHT_PIXELS = 300;

const AutoResizeTextarea = React.forwardRef<
  HTMLTextAreaElement,
  AutoResizeTextareaProps
>(({ maxHeight, value, onChange, ...props }, ref) => {
  const maxHeightValue =
    maxHeight !== undefined ? maxHeight : MAX_HEIGHT_PIXELS;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Function to resize the textarea based on its content
  const adjustHeight = useCallback(() => {
    const forwardedRef =
      ref && typeof ref === "object" && "current" in ref ? ref.current : null;

    const textarea = forwardedRef || textareaRef.current;
    if (textarea) {
      // 1. Reset height to shrink it if content was deleted
      textarea.style.height = "auto";

      // 2. Set height to the content's scroll height
      let newHeight = textarea.scrollHeight;

      // 3. Clamp the height at the maximum allowed height
      if (newHeight > maxHeightValue) {
        newHeight = maxHeightValue;
        // Optionally show scrollbar if max height is reached
        textarea.style.overflowY = "scroll";
      } else {
        textarea.style.overflowY = "hidden";
      }
      // Ensure minimum height is respected
      // newHeight = Math.max(MIN_HEIGHT_PIXELS, newHeight);
      textarea.style.height = `${newHeight}px`;
    }
  }, []);

  // 4. Initial adjustment and adjust whenever value changes
  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  // Handle user input
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Call the resize logic immediately to update the height *before* the re-render,
    // which often results in a smoother visual update.
    adjustHeight();
    onChange?.(e);
    // adjustHeight will be called by the useEffect hook after state update
  };

  return (
    <Textarea
      {...props}
      // aria-hidden="false"
      ref={ref || textareaRef}
      value={value}
      onChange={handleChange}
      // Set an initial small height via rows or CSS for when it first loads
      rows={1}
      style={{
        boxSizing: "border-box", // Crucial for padding/border calculation
        overflow: "hidden", // Hide the default scrollbar initially
        minHeight: "30px", // Ensures it doesn't disappear if empty
        ...props.style, // Allow overriding styles
      }}
    />
  );
});
AutoResizeTextarea.displayName = "AutoResizeTextarea";
export default AutoResizeTextarea;
