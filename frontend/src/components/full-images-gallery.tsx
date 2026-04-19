"use client";
import { ProductImage } from "@lib/types";
import { cn } from "@lib/utils";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ImageView from "@components/image-view";
import ViewCarousel from "@components/view-carousel";

const FullImagesGallery = ({
  images,

  className,
}: {
  productId?: number;
  className?: string;
  images: string[];
  error?: string;
}) => {
  const [viewedImage, setViewedImage] = useState(0);
  const [viewBar, setViewBar] = useState(false);
  const [isTouching, setIsTouching] = useState(false);
  const [viewedIndex, setViewedIndex] = useState<number | undefined>(undefined);

  const handleTouchHold = useCallback(() => {
    if (images.length > 1) {
      setIsTouching(true);
      setViewBar(true);
    }
  }, []);
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (isTouching) {
      timer = setInterval(() => {
        setViewedImage((curr) => (curr + 1) % images.length);
      }, 1000);
    } else {
      if (timer) {
        clearInterval(timer);
      }
    }
    return () => clearInterval(timer);
  }, [isTouching, images.length]);

  return (
    <>
      <div
        onTouchStart={handleTouchHold}
        onTouchEnd={() => {
          if (images.length > 1) {
            setIsTouching(false);
            setViewBar(false);
            setViewedImage(0);
          }
        }}
        onMouseOut={() => {
          setViewedImage(0);
          setViewBar(false);
        }}
        onMouseOver={() => images.length > 1 && setViewBar(true)}
      >
        {/* h-[550px]  */}
        <div
          className={cn(
            " h-[60vh] sm:h-[80vh] relative  overflow-hidden z-10",
            className
          )}
        >
          {images.map((url, i) => (
            <div
              key={i}
              className={cn(
                " max-w-full  max-h-full flex items-center justify-center object-contain absolute inset-0 transition-all",
                {
                  "opacity-0": viewedImage !== i,
                  "opacity-100": viewedImage === i,
                }
              )}
            >
              <img
                src={url}
                className=" w-full h-full object-cover absolute inset-0 origin-top  z-10  blur-lg"
              />
              <img
                src={url}
                key={i}
                className={cn(" max-w-full  max-h-full object-contain z-30")}
              />
            </div>
          ))}
          <div className=" absolute  flex inset-0 w-full h-full">
            {images.map((image, i) => (
              <div
                onClick={() => setViewedIndex(i)}
                onMouseOver={() => setViewedImage(i)}
                key={i}
                //  border bg-red-300/20
                className=" h-full cursor-pointer   z-50"
                style={{ width: `calc( 100% / ${images.length})` }}
              ></div>
            ))}
          </div>
        </div>
        {viewBar ? (
          <div className=" h-1  flex">
            {images.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-full    transition-all"
                  //   {
                  //     "opacity-0": viewedImage !== i,
                  //     "opacity-100": viewedImage === i,
                  //   }
                )}
                style={{ width: `calc( 100% / ${images.length})` }}
              >
                {viewedImage === i && (
                  <motion.div
                    transition={{ duration: 0.2 }}
                    layoutId="tab-indicator"
                    className="w-full h-full  bg-accent-foreground rounded-full "
                  ></motion.div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className=" h-1" />
        )}
      </div>
      <AnimatePresence>
        {viewedIndex !== undefined && (
          <ViewCarousel
            closeFunction={() => setViewedIndex(undefined)}
            images={images}
            index={viewedIndex}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default FullImagesGallery;
