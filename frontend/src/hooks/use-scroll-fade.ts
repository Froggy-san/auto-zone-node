import { useState, useEffect, useCallback, RefObject } from "react";

// Define the state of the fade effect
interface ScrollFadeState {
  fadeClass: "no-fade" | "fade-top" | "fade-bottom" | "fade-both";
  isScrollable: boolean;
}

/**
 * Custom hook to manage the fading effect on a scrollable element.
 * * @param scrollRef A React ref object pointing to the scrollable HTML element (e.g., HTMLDivElement).
 * @returns The current fade state (fadeClass) and whether the content is scrollable.
 */
export function useScrollFade(
  scrollRef: RefObject<HTMLElement>
): ScrollFadeState {
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(true);
  const [isScrollable, setIsScrollable] = useState(false);

  // Function to determine the fade state
  const checkScrollPosition = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    // Check if the scroll bar is visible (content is scrollable)
    const currentIsScrollable = el.scrollHeight > el.clientHeight;
    setIsScrollable(currentIsScrollable);

    if (!currentIsScrollable) {
      // If not scrollable, set to 'no-fade' state
      setIsAtStart(true);
      setIsAtEnd(true);
      return;
    }

    // Check scroll position
    const newIsAtStart = el.scrollTop === 0;
    // The content is scrolled to the end if scrollTop + clientHeight >= scrollHeight
    const newIsAtEnd =
      Math.ceil(el.scrollTop + el.clientHeight) >= el.scrollHeight;

    setIsAtStart(newIsAtStart);
    setIsAtEnd(newIsAtEnd);
  }, [scrollRef]);

  // Attach listeners on mount
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      // 1. Initial check
      checkScrollPosition();

      // 2. Attach scroll listener
      el.addEventListener("scroll", checkScrollPosition);

      // 3. Re-check on window resize, as content/container height might change
      window.addEventListener("resize", checkScrollPosition);

      // Cleanup function
      return () => {
        el.removeEventListener("scroll", checkScrollPosition);
        window.removeEventListener("resize", checkScrollPosition);
      };
    }
  }, [checkScrollPosition]);

  // Determine the CSS class based on the state
  let fadeClass: ScrollFadeState["fadeClass"] = "no-fade";

  if (!isScrollable || (isAtStart && isAtEnd)) {
    fadeClass = "no-fade";
  } else if (isAtStart && !isAtEnd) {
    fadeClass = "fade-bottom";
  } else if (!isAtStart && isAtEnd) {
    fadeClass = "fade-top";
  } else if (!isAtStart && !isAtEnd) {
    fadeClass = "fade-both";
  }

  return { fadeClass, isScrollable };
}
