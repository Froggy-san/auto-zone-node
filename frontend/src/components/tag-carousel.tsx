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
  slides?: number[];
  options?: EmblaOptionsType;
  children: React.ReactNode;
};

const TagCarousel: React.FC<PropType> = (props) => {
  const { slides, options, children } = props;
  const [emblaRef, emblaApi] = useEmblaCarousel(options);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = new URLSearchParams(searchParams);
  const currCategory = searchParams.get("categoryId") ?? "";

  useEffect(() => {
    if (emblaApi) {
      emblaApi.reInit();
    }
  }, [emblaApi]);

  return (
    <section className="embla">
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container items-center select-none ">
          {children}
        </div>
      </div>
    </section>
  );
};

export default TagCarousel;
