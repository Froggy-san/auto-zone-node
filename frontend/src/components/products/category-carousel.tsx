"use client";
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { EmblaOptionsType } from "embla-carousel";

import useEmblaCarousel from "embla-carousel-react";
import { CategoryProps } from "@lib/types";
import { setWith } from "lodash";
import { Badge } from "@components/ui/badge";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@lib/utils";
import { Button } from "@components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePrevNextButtons } from "@hooks/use-prev-next-buttons";

type PropType = {
  categories: CategoryProps[];
  slides?: number[];
  options?: EmblaOptionsType;
  asLinks?: boolean;
};

const CategoryCarousel: React.FC<PropType> = (props) => {
  const { slides, options, categories, asLinks = false } = props;
  const [emblaRef, emblaApi] = useEmblaCarousel(options);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = new URLSearchParams(searchParams);
  const currCategory = searchParams.get("categoryId") ?? "";

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(emblaApi);

  function handleCategoryClick(category: CategoryProps) {
    if (Number(currCategory) === category.id) {
      params.delete("categoryId");
    } else {
      params.set("page", "1");
      params.set("categoryId", String(category.id));
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function handleNavTo(category: CategoryProps) {
    router.push(`/products?categoryId=${category.id}`, { scroll: false });
  }

  const selectedIndex = useMemo(() => {
    return categories.findIndex((item) => item.id === Number(currCategory));
  }, [categories, currCategory]);

  // Makes sure that the selected tab is displayed on the screen.
  useEffect(() => {
    if (emblaApi && selectedIndex > -1) {
      emblaApi.scrollTo(selectedIndex, true);
    }
  }, [emblaApi, selectedIndex]);

  // Re-initializes the carousel mounting.
  useEffect(() => {
    if (emblaApi) {
      emblaApi.reInit();
      // emblaApi.scrollTo(8, true);
    }
  }, [emblaApi, categories]); // Note: The categories is added in the dependencies array because we want the carousel to re-initialize when ever the categories array changes.

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
    <section className="embla relative ">
      {!prevBtnDisabled && (
        <Button
          onClick={onPrevButtonClick}
          disabled={prevBtnDisabled}
          size="icon"
          className="  absolute left-0 top-1/2   -translate-y-1/2  z-40"
        >
          <ChevronLeft className=" h-4 w-4" />
        </Button>
      )}
      {!nextBtnDisabled && (
        <Button
          size="icon"
          onClick={onNextButtonClick}
          disabled={nextBtnDisabled}
          className="  absolute right-0 top-1/2    -translate-y-1/2  z-30"
        >
          <ChevronRight className=" h-4 w-4" />
        </Button>
      )}
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container">
          {categories.map((category, index) => (
            <div className=" relative" key={index}>
              <div className="embla__slide">
                <button
                  onClick={() => {
                    if (asLinks) handleNavTo(category);
                    else handleCategoryClick(category);
                  }}
                  className={cn(
                    "select-none px-2 py-1  text-xs  whitespace-nowrap  font-bold rounded-[.5rem] bg-secondary hover:bg-muted-foreground/20   dark:bg-card dark:hover:bg-accent  transition-colors duration-200",
                    {
                      "bg-primary dark:bg-primary dark:hover:bg-primary/85  text-primary-foreground hover:bg-primary":
                        Number(currCategory) === category.id,
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
  );
};

export default CategoryCarousel;

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
