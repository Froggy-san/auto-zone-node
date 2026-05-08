import type { EmblaOptionsType } from "embla-carousel"

import useEmblaCarousel from "embla-carousel-react"

import { setWith } from "lodash"
import { Badge } from "@/components/ui/badge"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { usePrevNextButtons } from "@/hooks/use-prev-next-buttons"
import type { Category } from "@/types"
import { useLocation, useNavigate } from "react-router"
import { useSearchParams } from "react-router"
import { useEffect, useMemo } from "react"

type PropType = {
  categories: Category[]
  slides?: number[]
  options?: EmblaOptionsType
  asLinks?: boolean
}

const CategoryCarousel: React.FC<PropType> = (props) => {
  const { slides, options, categories, asLinks = false } = props
  const [emblaRef, emblaApi] = useEmblaCarousel(options)

  const pathname = useLocation().pathname
  const [searchParams] = useSearchParams()
  const naviagte = useNavigate()
  const params = new URLSearchParams(searchParams)
  const currCategory = searchParams.get("category") ?? ""

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(emblaApi)

  function handleCategoryClick(category: Category) {
    if (currCategory === category._id) {
      params.delete("category")
    } else {
      params.set("page", "1")
      params.set("category", String(category._id))
    }
    naviagte(`${pathname}?${params.toString()}`)
  }

  function handleNavTo(category: Category) {
    naviagte(`/products?category=${category._id}`)
  }

  const selectedIndex = useMemo(() => {
    return categories.findIndex((item) => item._id === currCategory)
  }, [categories, currCategory])

  // Makes sure that the selected tab is displayed on the screen.
  useEffect(() => {
    if (emblaApi && selectedIndex > -1) {
      emblaApi.scrollTo(selectedIndex, true)
    }
  }, [emblaApi, selectedIndex])

  // Re-initializes the carousel mounting.
  useEffect(() => {
    if (emblaApi) {
      emblaApi.reInit()
      // emblaApi.scrollTo(8, true);
    }
  }, [emblaApi, categories]) // Note: The categories is added in the dependencies array because we want the carousel to re-initialize when ever the categories array changes.

  //   useEffect(() => {
  //     if (slidesRef.current && emblaApi) {
  //       slidesRef.current.forEach((slide, index) => {
  //         if (slide) {
  //           const slideWidth = slide.offsetWidth;
  //           slide.style.flex = `0 0 ${slideWidth}px`;
  //         }
  //       });
  //       emblaApi.reInit();
  //     }
  //   }, [slidesRef.current, emblaApi]);

  return (
    <section className="embla relative">
      {!prevBtnDisabled && (
        <Button
          onClick={onPrevButtonClick}
          disabled={prevBtnDisabled}
          size="icon"
          className="absolute top-1/2 left-0 z-40 -translate-y-1/2"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}
      {!nextBtnDisabled && (
        <Button
          size="icon"
          onClick={onNextButtonClick}
          disabled={nextBtnDisabled}
          className="absolute top-1/2 right-0 z-30 -translate-y-1/2"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container">
          {categories.map((category, index) => (
            <div className="relative" key={index}>
              <div className="embla__slide">
                <button
                  onClick={() => {
                    if (asLinks) handleNavTo(category)
                    else handleCategoryClick(category)
                  }}
                  className={cn(
                    "rounded-[.5rem] bg-secondary px-2 py-1 text-xs font-bold whitespace-nowrap transition-colors duration-200 select-none hover:bg-muted-foreground/20 dark:bg-card dark:hover:bg-accent",
                    {
                      "bg-primary text-primary-foreground hover:bg-primary dark:bg-primary dark:hover:bg-primary/85":
                        currCategory === category._id,
                    }
                  )}
                >
                  {category.name}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CategoryCarousel

//! important

// function Slider({
//   category,
//   children,
// }: {
//   category: Category;
//   children?: ReactNode;
// }) {
//   const [width, setWidth] = useState(0);
//   const spanRef = useRef<HTMLSpanElement>(null);

//   useEffect(() => {
//     if (spanRef.current) {
//       const eleWidth = spanRef.current.offsetWidth;
//     //   console.log(eleWidth);
//       setWidth(eleWidth);
//     }
//   });

//   return (
//     <div className=" relative">
//       <span ref={spanRef} className="   absolute invisible">
//         {category.name}
//       </span>
//       <div className="embla__slide" style={{ flex: `0 0 ${width}px` }}>
//         {children}
//       </div>
//     </div>
//   );
// }
