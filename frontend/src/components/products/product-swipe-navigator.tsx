// components/ProductSwipeNavigator.tsx

import { Button } from "@/components/ui/button"

import React, { useRef, useEffect, useState } from "react"
import { ArrowBigLeftDash, ArrowBigRightDash, ImageOff } from "lucide-react"
import { useLocation, useNavigate, useSearchParams } from "react-router"

interface ProductSwipeNavigatorProps {
  currentProductId: string
  prevProductId: string | null
  nextProductId: string | null
  children: React.ReactNode // The content that the user will swipe
}

const SWIPE_THRESHOLD = 170 // Minimum pixels to count as a swipe
const HUE_MAX = 150
const ARROW_MAX_MOVEMENT = 300 // Max pixels the arrow will move during a swipe

export function ProductSwipeNavigator({
  currentProductId,
  prevProductId,
  nextProductId,
  children,
}: ProductSwipeNavigatorProps) {
  const navigate = useNavigate()
  console.log(nextProductId, "SS")
  const [touchStartX, setTouchStartX] = useState(0)
  const [touchCurrentX, setTouchCurrentX] = useState(0)
  const targetElementRef = useRef<HTMLDivElement>(null)

  const { search } = useLocation()
  // const encondedFilters = encodeURIComponent(filters);
  // Calculate the amount the arrows should shift
  const deltaX = touchCurrentX - touchStartX

  // Determine the translation for the arrows
  let leftArrowTranslateX = -3000
  let rightArrowTranslateX = 3000
  let rightArrowHue = 100
  let leftArrowHue = 100

  // Only apply movement if a swipe is in progress (touchCurrentX is non-zero after touchstart)
  if (touchStartX !== 0 && touchCurrentX !== 0) {
    if (deltaX > 0) {
      // Swiping right
      leftArrowTranslateX = Math.min(deltaX, SWIPE_THRESHOLD) // Move left arrow to the right
      leftArrowHue = Math.min(deltaX + 2, HUE_MAX)
      //   rightArrowTranslateX = Math.max(0, -deltaX + SWIPE_THRESHOLD); // Keep right arrow at 0 or push it slightly left then back
    } else if (deltaX < 0) {
      // Swiping left
      rightArrowTranslateX = Math.max(deltaX, -SWIPE_THRESHOLD) // Move right arrow to the left
      rightArrowHue = Math.max(deltaX - 2, -HUE_MAX)
      //   leftArrowTranslateX = Math.min(0, -deltaX - SWIPE_THRESHOLD); // Keep left arrow at 0 or push it slightly right then back
    }
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchStartX(e.touches[0].clientX)
    setTouchCurrentX(e.touches[0].clientX) // Initialize currentX
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchCurrentX(e.touches[0].clientX)
  }

  function handlePrev() {
    navigate(`/products/${prevProductId}${search}`, {
      replace: true,
    })
  }
  function handleNext() {
    navigate(`/products/${nextProductId}${search}`, {
      replace: true,
    })
  }
  const handleTouchEnd = () => {
    const finalDeltaX = touchCurrentX - touchStartX

    if (Math.abs(finalDeltaX) > SWIPE_THRESHOLD) {
      if (finalDeltaX < 0) {
        // Swiped right (going to previous product)
        if (prevProductId !== null) {
          handlePrev()
        }
      } else {
        // Swiped left (going to next product)
        if (nextProductId !== null) {
          handleNext()
        }
      }
    }
    // Reset touch state to zero for next swipe and to reset arrow positions
    setTouchStartX(0)
    setTouchCurrentX(0)
  }

  useEffect(() => {
    function handleArrowClick(e: KeyboardEvent) {
      if (e.code === "ArrowRight") {
        if (!prevProductId) return
        handlePrev()
      }
      if (e.code === "ArrowLeft") {
        if (!nextProductId) return
        handleNext()
      }
    }
    document.addEventListener("keydown", handleArrowClick)
    return () => document.removeEventListener("keydown", handleArrowClick)
  }, [])

  // Attach event listeners using JSX props directly for simplicity in Client Components
  // No need for useEffect here for the direct JSX event handlers

  return (
    <div
      ref={targetElementRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="product-swipe-container relative overflow-hidden" // Removed bg-blue-100 for production code
    >
      {/* Previous Button */}
      {/* BIG SCREEN BUTTONS */}
      {prevProductId !== null && (
        <div
          onClick={handlePrev}
          className="fixed top-0 -right-10 z-30 hidden h-full w-14 cursor-pointer items-center justify-center bg-accent/15 backdrop-blur-sm transition-all focus-within:right-0 hover:right-0 sm:flex 4xl:right-0"
        >
          <Button
            size="sm"
            variant="secondary"
            className="relative h-8 rounded-md bg-primary px-3 text-xs text-primary-foreground shadow hover:bg-primary/90 dark:bg-secondary dark:text-secondary-foreground dark:shadow-sm dark:hover:bg-secondary/80"
          >
            <ArrowBigRightDash className="h-5 w-5" />
          </Button>
        </div>
      )}
      {nextProductId !== null && (
        <div
          onClick={handleNext}
          className="fixed top-0 -left-10 z-30 hidden h-full w-14 cursor-pointer items-center justify-center bg-accent/15 backdrop-blur-sm transition-all focus-within:left-0 hover:left-0 focus:left-0 sm:flex 4xl:left-0"
        >
          <Button
            size="sm"
            variant="secondary"
            className="relative h-8 rounded-md bg-primary px-3 text-xs text-primary-foreground shadow hover:bg-primary/90 dark:bg-secondary dark:text-secondary-foreground dark:shadow-sm dark:hover:bg-secondary/80"
          >
            <ArrowBigLeftDash className="h-5 w-5" />
          </Button>
        </div>
      )}
      {/* BIG SCREEN BUTTONS */}
      {nextProductId !== null && (
        <div
          className="fixed top-1/2 left-0 z-50 -translate-y-1/2 transition-transform duration-500 ease-out" // Added transition
          style={{
            transform: `translateY(-50%) translateX(${leftArrowTranslateX}px)`,
          }} // Use inline style for dynamic movement
          aria-label="Previous Product"
        >
          <Button
            onClick={handlePrev}
            size="sm"
            variant="secondary"
            className="relative h-8 rounded-md bg-primary px-3 text-xs text-primary-foreground shadow hover:bg-primary/90 dark:bg-secondary dark:text-secondary-foreground dark:shadow-sm dark:hover:bg-secondary/80"
          >
            <span
              className="absolute top-0 left-0 z-[-1] h-full w-full rounded-full bg-ring/40"
              style={{ scale: `${leftArrowHue}%` }}
            />
            <ArrowBigLeftDash className="h-5 w-5" />
          </Button>
        </div>
      )}
      {children} {/* This is your product content */}
      {/* Next Button */}
      {prevProductId !== null && (
        <div
          className="fixed top-1/2 right-0 z-50 -translate-y-1/2 transition-transform duration-500 ease-out" // Added transition
          style={{
            transform: `translateY(-50%) translateX(${rightArrowTranslateX}px)`,
          }} // Use inline style for dynamic movement
          aria-label="Next Product"
        >
          <button
            onClick={handleNext}
            className="relative h-8 rounded-md bg-primary px-3 text-xs text-primary-foreground shadow hover:bg-primary/90 dark:bg-secondary dark:text-secondary-foreground dark:shadow-sm dark:hover:bg-secondary/80"
          >
            <span
              className="absolute top-0 left-0 z-[-1] h-full w-full rounded-full bg-ring/40"
              style={{ scale: `${rightArrowHue}%` }}
            />
            <ArrowBigRightDash className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  )
}
