"use client";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";

// --- Type Definitions ---
// Define the type for a single search result item.
// This can be more complex if your items are objects (e.g., { id: string, name: string }).
type SearchResultItem = string;

interface SearchComponentProps {
  // You could add props here if your component needs them (e.g., initialSearchTerm)
}

// Simulate an API call or filtering
const dummyData: SearchResultItem[] = [
  "Apple",
  "Banana",
  "Cherry",
  "Date",
  "Elderberry",
  "Fig",
  "Grape",
  "Honeydew",
  "Kiwi",
  "Lemon",
  "Mango",
  "Nectarine",
  "Orange",
  "Papaya",
  "Quince",
  "Raspberry",
  "Strawberry",
  "Tangerine",
  "Ugli Fruit",
  "Vanilla Bean",
  "Watermelon",
  "Xigua",
  "Yellow Watermelon",
  "Zucchini",
];

const SearchComponent: React.FC<SearchComponentProps> = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  // const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1); // -1 means no item is focused

  // Ref for the results container (optional, but good for type safety)
  const searchResultsRef = useRef<HTMLUListElement>(null);
  // Array to store refs for individual result items
  const resultRefs = useRef<(HTMLLIElement | null)[]>([]);

  // --- YOUR SEARCH LOGIC GOES HERE ---
  // This is a placeholder. In a real app, you'd fetch data or filter an array.
  const results = useMemo(() => {
    if (searchTerm.trim() === "") {
      // setSearchResults([]);
      return [];
    }

    const filtered = dummyData.filter((item: SearchResultItem) =>
      item.toLowerCase().includes(searchTerm.toLowerCase())
    );
    // setSearchResults(filtered);
    setFocusedIndex(-1); // Reset focus when search results change
    // Clear old refs, keeping only as many as there are current search results
    resultRefs.current = resultRefs.current.slice(0, filtered.length);
    return filtered;
  }, [searchTerm]);
  // --- END OF SEARCH LOGIC ---

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (results.length === 0) return;

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault(); // Prevent page scroll
          setFocusedIndex((prevIndex: number) => {
            const newIndex = (prevIndex + 1) % results.length;
            return newIndex;
          });
          break;
        case "ArrowUp":
          event.preventDefault(); // Prevent page scroll
          setFocusedIndex((prevIndex: number) => {
            const newIndex = (prevIndex - 1 + results.length) % results.length;
            return newIndex;
          });
          break;
        case "Enter":
          if (focusedIndex >= 0 && focusedIndex < results.length) {
            const selectedItem = results[focusedIndex];
            // You would typically perform an action here, e.g.,
            // navigate, populate input, close results.
            setSearchTerm(selectedItem); // Example: put selected item in input
            // setSearchResults([]); // Clear results after selection
            setFocusedIndex(-1);
          }
          break;
        case "Escape":
          // setSearchResults([]); // Clear results on escape
          setFocusedIndex(-1);
          break;
        default:
          break;
      }
    },
    [results, focusedIndex]
  );

  // Effect to scroll the focused item into view
  useEffect(() => {
    if (focusedIndex !== -1) {
      const focusedElement = resultRefs.current[focusedIndex];
      if (focusedElement) {
        focusedElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }
  }, [focusedIndex]);

  const handleResultClick = (index: number, item: SearchResultItem) => {
    setFocusedIndex(index);
    console.log("Clicked:", item);
    setSearchTerm(item); // Example: put clicked item in input
    // setSearchResults([]); // Clear results after selection
    setFocusedIndex(-1);
  };

  return (
    <div style={{ position: "relative", width: "300px", margin: "50px auto" }}>
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{ width: "100%", padding: "10px", fontSize: "16px" }}
      />

      {results.length > 0 && (
        <ul
          ref={searchResultsRef}
          style={{
            listStyle: "none",
            padding: 0,
            margin: "5px 0 0 0",
            border: "1px solid #ccc",
            maxHeight: "200px",
            overflowY: "auto",
            position: "absolute",
            width: "100%",
            backgroundColor: "background",
            zIndex: 100,
          }}
        >
          {results.map((result: SearchResultItem, index: number) => (
            <li
              key={result}
              // Store ref for each item. Type `HTMLLIElement | null` is used
              // because the ref might be null initially or if the element is unmounted.
              ref={(el: HTMLLIElement | null) => {
                resultRefs.current[index] = el;
              }}
              onClick={() => handleResultClick(index, result)}
              style={{
                padding: "10px",
                cursor: "pointer",
                backgroundColor:
                  index === focusedIndex ? "#e0e0e0" : "transparent",
                transition: "background-color 0.1s ease-in-out",
              }}
            >
              {result}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchComponent;
