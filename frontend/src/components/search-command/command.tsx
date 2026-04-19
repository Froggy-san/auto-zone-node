// import React, { useEffect, useId, useRef, useState } from "react";
// import {
//   CommandPaletteContext,
//   CommandItemState,
//   useCommandPalette,
// } from "./CommandPaletteContext";

// interface CommandPaletteProps {
//   children: React.ReactNode;
//   value?: string;
//   setValue?: React.Dispatch<React.SetStateAction<string>>;
//   shouldFilter?: boolean;
//   loop?: boolean;
//   // Optional custom filter function
//   filter?: (value: string, search: string, keywords?: string[]) => number;
// }

// const defaultFilter = (
//   value: string,
//   search: string,
//   keywords?: string[]
// ): number => {
//   if (!search) return 1; // Show all if no search term

//   const lowerValue = value.toLowerCase();
//   const lowerSearch = search.toLowerCase();

//   // Basic substring match (you'd replace this with a fuzzy search algorithm)
//   if (lowerValue.includes(lowerSearch)) {
//     return 1; // Found a match
//   }

//   // Check keywords if provided
//   if (keywords) {
//     for (const keyword of keywords) {
//       if (keyword.toLowerCase().includes(lowerSearch)) {
//         return 1;
//       }
//     }
//   }

//   return 0; // No match
// };

// export function CommandPalette({
//   children,
//   value,
//   loop = true,
//   shouldFilter = true,
//   setValue,
//   filter = defaultFilter,
// }: CommandPaletteProps) {
//   const [term, setTerm] = useState<string>("");
//   const [registeredItems, setRegisteredItems] = useState<CommandItemState[]>(
//     []
//   );
//   const [focusedIndex, setFocusedIndex] = useState<number>(-1);

//   const searchTerm = value ? value : term;

//   // Expose the register/unregister functions to children
//   const registerItem = (item: CommandItemState) => {
//     setRegisteredItems((prev) => [...prev, item]);
//   };

//   const unregisterItem = (id: string) => {
//     setRegisteredItems((prev) => prev.filter((item) => item.id !== id));
//   };

//   const handleSearch = (searchTerm: string) => {
//     setValue?.(searchTerm);
//     setTerm(searchTerm);
//   };
//   const handleItemSelect = (value: string, index: number) => {
//     setFocusedIndex(index);
//     // Here you could update the input, close the palette, etc.
//     setTerm(value); // Example: Populate input with selected value
//     setValue?.(value);
//   };

//   // Provide the context value
//   const contextValue = {
//     searchTerm,
//     shouldFilter,
//     loop,
//     setSearchTerm: handleSearch, // Pass setSearchTerm down to CommandInput
//     filter, // Pass the filter function down to CommandList
//     registerItem,
//     unregisterItem,
//     registeredItems, // Pass registered items for CommandList to iterate
//     focusedIndex,
//     setFocusedIndex,
//     onItemSelect: handleItemSelect,
//   };

//   return (
//     // We'll extend this context with more state specific to CommandList later
//     <CommandPaletteContext.Provider value={contextValue}>
//       <div className="cmdk-palette">{children}</div>
//     </CommandPaletteContext.Provider>
//   );
// }

// export const CommandInput: React.FC<
//   React.ComponentPropsWithoutRef<"input">
// > = ({ className, ...rest }) => {
//   // Cast to the extended type as we know setSearchTerm is provided by CommandPalette
//   const {
//     searchTerm,
//     loop,
//     setSearchTerm,
//     registeredItems,
//     focusedIndex,
//     setFocusedIndex,
//     onItemSelect,
//   } = useCommandPalette();

//   const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
//     if (registeredItems.length === 0) return;

//     switch (event.key) {
//       case "ArrowDown":
//         event.preventDefault();
//         setFocusedIndex((prevIndex) => {
//           const nextIndex = (prevIndex + 1) % registeredItems.length;
//           // Ensure the next focused item is in view
//           const nextElement = registeredItems[nextIndex]?.element;
//           if (nextElement) {
//             nextElement.scrollIntoView({
//               behavior: "smooth",
//               block: "nearest",
//             });
//           }
//           return nextIndex;
//         });
//         break;
//       case "ArrowUp":
//         event.preventDefault();
//         setFocusedIndex((prevIndex) => {
//           const nextIndex =
//             (prevIndex - 1 + registeredItems.length) % registeredItems.length;
//           // Ensure the next focused item is in view
//           const nextElement = registeredItems[nextIndex]?.element;
//           if (nextElement) {
//             nextElement.scrollIntoView({
//               behavior: "smooth",
//               block: "nearest",
//             });
//           }
//           return nextIndex;
//         });
//         break;
//       case "Enter":
//         event.preventDefault();
//         if (focusedIndex >= 0 && focusedIndex < registeredItems.length) {
//           const selectedItem = registeredItems[focusedIndex];
//           if (selectedItem && onItemSelect) {
//             onItemSelect(selectedItem.value, focusedIndex);
//           }
//         }
//         break;
//       case "Escape":
//         // You might want to clear search or close the palette
//         setSearchTerm("");
//         setFocusedIndex(-1);
//         break;
//       default:
//         break;
//     }
//   };

//   return (
//     <input
//       className={`cmdk-input ${className || ""}`}
//       value={searchTerm}
//       onChange={(e) => setSearchTerm(e.target.value)}
//       onKeyDown={handleKeyDown}
//       placeholder="Type a command or search..."
//       {...rest}
//     />
//   );
// };

// export const CommandList: React.FC<React.ComponentPropsWithoutRef<"ul">> = ({
//   children,
//   className,
//   ...rest
// }) => {
//   // Cast to extended type
//   const { searchTerm, shouldFilter, filter, registeredItems, focusedIndex } =
//     useCommandPalette();

//   // This effect runs whenever searchTerm or registeredItems change
//   useEffect(() => {
//     // Iterate through all registered items and apply filtering logic
//     registeredItems.forEach((item, index) => {
//       if (item.element) {
//         if (shouldFilter) {
//           // Ensure the DOM element exists
//           const score = filter(item.value, searchTerm, item.keywords);
//           const isHidden = score === 0;

//           // Directly manipulate the `data-cmdk-hidden` attribute
//           item.element.dataset.cmdkHidden = isHidden ? "true" : "false";
//         }

//         // Update aria-selected for keyboard navigation
//         item.element.setAttribute(
//           "aria-selected",
//           focusedIndex === index ? "true" : "false"
//         );
//       }
//     });
//   }, [searchTerm, registeredItems, filter, focusedIndex]); // Re-run when these dependencies change

//   return (
//     <ul className={`cmdk-list ${className || ""}`} role="listbox" {...rest}>
//       {children}
//     </ul>
//   );
// };

// interface CommandItemProps extends React.ComponentPropsWithoutRef<"li"> {
//   value: string; // The value used for filtering and selection
//   keywords?: string[]; // Optional keywords for fuzzy matching
//   onValueSelect?: (value: string) => void; // Optional callback when item is selected (click or enter)
// }

// export const CommandItem: React.FC<CommandItemProps> = ({
//   value,
//   keywords,
//   onValueSelect, // Use the new name here
//   children,
//   className,
//   onClick,
//   ...rest
// }) => {
//   const itemRef = useRef<HTMLLIElement>(null);
//   const id = useId(); // Generate a stable ID for the item

//   // Cast to extended context type
//   const { registerItem, unregisterItem, onItemSelect, registeredItems } =
//     useCommandPalette();
//   useEffect(() => {
//     // Register this item with the CommandPaletteContext (specifically the CommandList)
//     registerItem({ id, value, keywords, element: itemRef.current });

//     // Cleanup: Unregister when component unmounts
//     return () => {
//       unregisterItem(id);
//     };
//   }, [id, value, keywords, registerItem, unregisterItem]); // Dependencies for useEffect

//   // Find own index in the registered items list
//   const ownIndex = registeredItems.findIndex((item) => item.id === id);

//   const handleClick = (event: React.MouseEvent<HTMLLIElement>) => {
//     if (onValueSelect) {
//       onValueSelect(value);
//     }
//     if (onItemSelect) {
//       onItemSelect(value, ownIndex); // Notify parent of selection
//     }
//     onClick?.(event); // Call any passed onClick handler
//   };

//   return (
//     <li
//       ref={itemRef} // Attach ref to the actual DOM element
//       id={id}
//       className={`cmdk-item ${className || ""}`}
//       onClick={handleClick}
//       role="option"
//       aria-labelledby={`cmdk-item-label-${id}`} // For accessibility
//       {...rest}
//     >
//       <span id={`cmdk-item-label-${id}`}>{children}</span>
//     </li>
//   );
// };

// CommandInput.displayName = "CommandInput";
// CommandList.displayName = "CommandList";
// CommandItem.displayName = "CommandItem";
// CommandPalette.Input = CommandInput;
// CommandPalette.CommandList = CommandList;
// CommandPalette.CommandItem = CommandItem;
