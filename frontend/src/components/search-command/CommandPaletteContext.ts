// src/components/cmdk/CommandPaletteContext.ts
import { createContext, useContext } from "react";

// Define the type for a single search result item's state
export interface CommandItemState {
  id: string; // Unique ID for the item
  value: string; // The value used for filtering (e.g., "Apple")
  keywords?: string[]; // Optional keywords for fuzzy matching
  element: HTMLLIElement | null; // Direct reference to the item's DOM node
}

// Define the type for the filter function
export type FilterFunction = (
  value: string,
  search: string,
  keywords?: string[]
) => number;

// Define the complete context value type that all consumers will use
interface CommandPaletteContextType {
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>; // Add setSearchTerm here
  filter: FilterFunction; // Add filter function here
  registeredItems: CommandItemState[]; // Add registeredItems here
  registerItem: (item: CommandItemState) => void;
  unregisterItem: (id: string) => void;
  focusedIndex: number; // Add focusedIndex here
  setFocusedIndex: React.Dispatch<React.SetStateAction<number>>; // Add setFocusedIndex here
  onItemSelect?: (value: string, index: number) => void;
}

// Create the context with an initial undefined value
// This is typical when the context value is guaranteed to be provided by a Provider
// higher up in the tree.
export const CommandPaletteContext = createContext<
  CommandPaletteContextType | undefined
>(undefined);

// Custom hook to use the context with a check for its presence
export const useCommandPalette = () => {
  const context = useContext(CommandPaletteContext);
  if (context === undefined) {
    throw new Error(
      "useCommandPalette must be used within a CommandPaletteProvider"
    );
  }
  return context;
};

/*

// src/components/cmdk/CommandPaletteContext.ts
import { createContext, useContext } from "react";

// Define the type for a single search result item's state
export interface CommandItemState {
  id: string; // Unique ID for the item
  value: string; // The value used for filtering (e.g., "Apple")
  keywords?: string[]; // Optional keywords for fuzzy matching
  element: HTMLLIElement | null; // Direct reference to the item's DOM node
}

// Define the type for the filter function
export type FilterFunction = (
  value: string,
  search: string,
  keywords?: string[]
) => number;

// Define the complete context value type that all consumers will use
interface CommandPaletteContextType {
  searchTerm: string;
  loop?: boolean;
  shouldFilter?: boolean;
  setSearchTerm: (searchTerm: string) => void; // Add setSearchTerm here
  filter: FilterFunction; // Add filter function here
  registeredItems: CommandItemState[]; // Add registeredItems here
  registerItem: (item: CommandItemState) => void;
  unregisterItem: (id: string) => void;
  focusedIndex: number; // Add focusedIndex here
  setFocusedIndex: React.Dispatch<React.SetStateAction<number>>; // Add setFocusedIndex here
  onItemSelect?: (value: string, index: number) => void;
}

// Create the context with an initial undefined value
// This is typical when the context value is guaranteed to be provided by a Provider
// higher up in the tree.
export const CommandPaletteContext = createContext<
  CommandPaletteContextType | undefined
>(undefined);

// Custom hook to use the context with a check for its presence
export const useCommandPalette = () => {
  const context = useContext(CommandPaletteContext);
  if (context === undefined) {
    throw new Error(
      "useCommandPalette must be used within a CommandPaletteProvider"
    );
  }
  return context;
};

*/
