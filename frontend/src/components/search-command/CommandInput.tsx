// src/components/cmdk/CommandInput.tsx
import React, { useEffect } from "react"; // Import useEffect
import { useCommandPalette } from "./CommandPaletteContext";

export const CommandInput: React.FC<
  React.ComponentPropsWithoutRef<"input">
> = ({ className, ...rest }) => {
  const {
    searchTerm,
    setSearchTerm,
    registeredItems,
    focusedIndex,
    setFocusedIndex,
    onItemSelect,
    filter,
  } = useCommandPalette();

  // --- NEW: Calculate visible items ---
  // This memoized list will contain only the items that are currently visible based on the filter.
  // It's crucial this is updated whenever searchTerm or registeredItems change.
  const visibleItems = React.useMemo(() => {
    return registeredItems.filter((item) => {
      // Re-evaluate visibility based on current filter and search term
      if (!item.element) return false; // Ensure element exists
      const score = filter(item.value, searchTerm, item.keywords);
      return score !== 0; // Item is visible if score is not 0
    });
  }, [searchTerm, registeredItems, filter]); // Re-calculate when these change

  // --- NEW: Adjust focusedIndex when visible items change ---
  // If the currently focused item becomes hidden, or if visible items list changes significantly,
  // we might want to reset or adjust the focused index to a valid visible item.
  useEffect(() => {
    // If no items are visible, reset focus
    if (visibleItems.length === 0) {
      setFocusedIndex(-1);
      return;
    }

    // If the currently focused item is no longer visible, or index is out of bounds for visible items,
    // reset focus to the first visible item (index 0 in the visibleItems array).
    const currentFocusedItem = registeredItems[focusedIndex];
    if (
      focusedIndex === -1 ||
      !currentFocusedItem ||
      !visibleItems.some((item) => item.id === currentFocusedItem.id)
    ) {
      setFocusedIndex(0); // Focus the first visible item
    } else {
      // Ensure focused item is still visible
      const currentFocusedDOMElement = registeredItems[focusedIndex]?.element;
      // Check if the DOM element actually has the data-cmdk-hidden attribute set to true
      if (
        currentFocusedDOMElement &&
        currentFocusedDOMElement.dataset.cmdkHidden === "true"
      ) {
        setFocusedIndex(0); // If current focused is hidden, jump to first visible
      }
    }
  }, [visibleItems, focusedIndex, registeredItems, setFocusedIndex]); // Dependencies for this effect

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // Navigate only if there are visible items
    if (visibleItems.length === 0) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setFocusedIndex((prevIndex) => {
          // Find the current focused item in the *full* registeredItems list
          const currentItemInFullList = registeredItems[prevIndex];

          // Find its index within the *visible* items
          const currentVisibleIndex = visibleItems.findIndex(
            (item) => item.id === currentItemInFullList?.id
          );

          let nextVisibleIndex;
          if (currentVisibleIndex === -1) {
            // If currently focused item is hidden, or no item focused, start from first visible
            nextVisibleIndex = 0;
          } else {
            nextVisibleIndex = (currentVisibleIndex + 1) % visibleItems.length;
          }

          const nextFocusedItem = visibleItems[nextVisibleIndex];
          if (nextFocusedItem && nextFocusedItem.element) {
            nextFocusedItem.element.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
            });
            // Return the index of the next focused item in the *full* registeredItems array
            return registeredItems.findIndex(
              (item) => item.id === nextFocusedItem.id
            );
          }
          return prevIndex; // Fallback
        });
        break;

      case "ArrowUp":
        event.preventDefault();
        setFocusedIndex((prevIndex) => {
          const currentItemInFullList = registeredItems[prevIndex];
          const currentVisibleIndex = visibleItems.findIndex(
            (item) => item.id === currentItemInFullList?.id
          );

          let nextVisibleIndex;
          if (currentVisibleIndex === -1 || currentVisibleIndex === 0) {
            // If currently focused item is hidden or first visible, wrap to last visible
            nextVisibleIndex = visibleItems.length - 1;
          } else {
            nextVisibleIndex =
              (currentVisibleIndex - 1 + visibleItems.length) %
              visibleItems.length;
          }

          const nextFocusedItem = visibleItems[nextVisibleIndex];
          if (nextFocusedItem && nextFocusedItem.element) {
            nextFocusedItem.element.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
            });
            return registeredItems.findIndex(
              (item) => item.id === nextFocusedItem.id
            );
          }
          return prevIndex; // Fallback
        });
        break;

      case "Enter":
        event.preventDefault();
        // Ensure that focusedIndex refers to a visible item before acting
        const selectedItem = registeredItems[focusedIndex];
        if (
          selectedItem &&
          selectedItem.element &&
          selectedItem.element.dataset.cmdkHidden !== "true" &&
          onItemSelect
        ) {
          onItemSelect(selectedItem.value, focusedIndex);
        }
        break;

      case "Escape":
        setSearchTerm("");
        setFocusedIndex(-1);
        break;
      default:
        break;
    }
  };

  return (
    <input
      className={`cmdk-input ${className || ""}`}
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder="Type a command or search..."
      {...rest}
    />
  );
};
