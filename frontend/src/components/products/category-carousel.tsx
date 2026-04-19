"use client";
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { EmblaOptionsType } from "embla-carousel";

import useEmblaCarousel from "embla-carousel-react";
import { Category } from "@lib/types";
import { setWith } from "lodash";
import { Badge } from "@components/ui/badge";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@lib/utils";

type PropType = {
  categories: Category[];
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
  const handleNext = emblaApi?.scrollNext;
  const handlePrev = emblaApi?.scrollPrev;

  function handleCategoryClick(category: Category) {
    if (Number(currCategory) === category.id) {
      params.delete("categoryId");
    } else {
      params.set("page", "1");
      params.set("categoryId", String(category.id));
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function handleNavTo(category: Category) {
    router.push(`/products?${params.toString()}`, { scroll: false });
  }

  useEffect(() => {
    if (emblaApi) {
      emblaApi.reInit();
    }
  }, [categories, emblaApi]);

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
    <section className="embla">
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
                      "bg-muted-foreground/20 dark:bg-accent":
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
