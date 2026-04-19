// src/components/cmdk/CommandItem.tsx
import React, { useEffect, useRef, useId } from "react";
import { useCommandPalette } from "./CommandPaletteContext";

// We need to extend the context type for CommandItem
interface ExtendedCommandPaletteContextType {
  searchTerm: string;
  registerItem: (item: {
    id: string;
    value: string;
    keywords?: string[];
    element: HTMLLIElement | null;
  }) => void;
  unregisterItem: (id: string) => void;
  focusedIndex: number;
  onItemSelect?: (value: string, index: number) => void;
  registeredItems: {
    id: string;
    value: string;
    keywords?: string[];
    element: HTMLLIElement | null;
  }[];
}

interface CommandItemProps extends React.ComponentPropsWithoutRef<"li"> {
  value: string; // The value used for filtering and selection
  keywords?: string[]; // Optional keywords for fuzzy matching
  onValueSelect?: (value: string) => void; // Optional callback when item is selected (click or enter)
}

export const CommandItem: React.FC<CommandItemProps> = ({
  value,
  keywords,
  onValueSelect, // Use the new name here
  children,
  className,
  onClick,
  ...rest
}) => {
  const itemRef = useRef<HTMLLIElement>(null);
  const id = useId(); // Generate a stable ID for the item

  // Cast to extended context type
  const { registerItem, unregisterItem, onItemSelect, registeredItems } =
    useCommandPalette();
  useEffect(() => {
    // Register this item with the CommandPaletteContext (specifically the CommandList)
    registerItem({ id, value, keywords, element: itemRef.current });

    // Cleanup: Unregister when component unmounts
    return () => {
      unregisterItem(id);
    };
  }, [id, value, keywords, registerItem, unregisterItem]); // Dependencies for useEffect

  // Find own index in the registered items list
  const ownIndex = registeredItems.findIndex((item) => item.id === id);

  const handleClick = (event: React.MouseEvent<HTMLLIElement>) => {
    if (onValueSelect) {
      onValueSelect(value);
    }
    if (onItemSelect) {
      onItemSelect(value, ownIndex); // Notify parent of selection
    }
    onClick?.(event); // Call any passed onClick handler
  };

  return (
    <li
      ref={itemRef} // Attach ref to the actual DOM element
      id={id}
      className={`cmdk-item ${className || ""}`}
      onClick={handleClick}
      role="option"
      aria-labelledby={`cmdk-item-label-${id}`} // For accessibility
      {...rest}
    >
      <span id={`cmdk-item-label-${id}`}>{children}</span>
    </li>
  );
};
