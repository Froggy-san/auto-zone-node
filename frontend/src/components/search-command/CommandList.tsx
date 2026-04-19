// src/components/cmdk/CommandList.tsx
import React, { useEffect } from "react";
import { useCommandPalette } from "./CommandPaletteContext";

// Extend context type for CommandList to access necessary values
interface ExtendedCommandPaletteContextType {
  searchTerm: string;
  filter: (value: string, search: string, keywords?: string[]) => number;
  registeredItems: {
    id: string;
    value: string;
    keywords?: string[];
    element: HTMLLIElement | null;
  }[];
  focusedIndex: number;
}

export const CommandList: React.FC<React.ComponentPropsWithoutRef<"ul">> = ({
  children,
  className,
  ...rest
}) => {
  // Cast to extended type
  const { searchTerm, filter, registeredItems, focusedIndex } =
    useCommandPalette();

  // This effect runs whenever searchTerm or registeredItems change
  useEffect(() => {
    // Iterate through all registered items and apply filtering logic
    registeredItems.forEach((item, index) => {
      if (item.element) {
        // Ensure the DOM element exists
        const score = filter(item.value, searchTerm, item.keywords);
        const isHidden = score === 0;

        // Directly manipulate the `data-cmdk-hidden` attribute
        item.element.dataset.cmdkHidden = isHidden ? "true" : "false";

        // Update aria-selected for keyboard navigation
        item.element.setAttribute(
          "aria-selected",
          focusedIndex === index ? "true" : "false"
        );
      }
    });
  }, [searchTerm, registeredItems, filter, focusedIndex]); // Re-run when these dependencies change

  return (
    <ul className={`cmdk-list ${className || ""}`} role="listbox" {...rest}>
      {children}
    </ul>
  );
};
