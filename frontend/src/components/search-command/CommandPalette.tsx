// src/components/cmdk/CommandPalette.tsx
import React, { useCallback, useState } from "react";
import {
  CommandPaletteContext,
  CommandItemState,
} from "./CommandPaletteContext";

interface CommandPaletteProps {
  children: React.ReactNode;
  // Optional custom filter function
  filter?: (value: string, search: string, keywords?: string[]) => number;
}

const defaultFilter = (
  value: string,
  search: string,
  keywords?: string[]
): number => {
  if (!search) return 1; // Show all if no search term

  const lowerValue = value.toLowerCase();
  const lowerSearch = search.toLowerCase();

  // Basic substring match (you'd replace this with a fuzzy search algorithm)
  if (lowerValue.includes(lowerSearch)) {
    return 1; // Found a match
  }

  // Check keywords if provided
  if (keywords) {
    for (const keyword of keywords) {
      if (keyword.toLowerCase().includes(lowerSearch)) {
        return 1;
      }
    }
  }

  return 0; // No match
};

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  children,
  filter = defaultFilter,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [registeredItems, setRegisteredItems] = useState<CommandItemState[]>(
    []
  );
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  // Memoize registerItem and unregisterItem
  const registerItem = useCallback((item: CommandItemState) => {
    setRegisteredItems((prev) => {
      // It's good practice to ensure uniqueness if items might register multiple times
      if (!prev.some((existing) => existing.id === item.id)) {
        return [...prev, item];
      }
      return prev;
    });
  }, []); // Dependencies: empty array because setRegisteredItems is stable

  const unregisterItem = useCallback((id: string) => {
    setRegisteredItems((prev) => prev.filter((item) => item.id !== id));
  }, []); // Dependencies: empty array because setRegisteredItems is stable

  const handleItemSelect = useCallback((value: string, index: number) => {
    setFocusedIndex(index);
    setSearchTerm(value);
  }, []); // Dependencies: empty array because setFocusedIndex and setSearchTerm are stable

  const contextValue = {
    searchTerm,
    setSearchTerm,
    filter,
    registeredItems,
    registerItem, // Now stable
    unregisterItem, // Now stable
    focusedIndex,
    setFocusedIndex,
    onItemSelect: handleItemSelect, // Now stable
  };

  return (
    <CommandPaletteContext.Provider value={contextValue}>
      <div className="cmdk-palette">{children}</div>
    </CommandPaletteContext.Provider>
  );
};
