import * as React from "react";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Link from "next/link";

export function HomeCarousel() {
  return (
    <Carousel className="w-full  ">
      <CarouselContent className="   h-56     ">
        {Array.from({ length: 5 }).map((_, index) => (
          <CarouselItem key={index} className=" h-full w-full">
            <div className="p-1 h-full  w-full">
              <Link href="" className=" w-full h-full">
                <Card className=" w-full h-full">{index + 1}</Card>
              </Link>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious
        variant="default"
        size="sm"
        className=" left-5  text-xl"
      />
      <CarouselNext variant="default" size="sm" className=" right-5" />
    </Carousel>
  );
}
