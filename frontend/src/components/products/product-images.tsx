"use client";
import { ProductImage } from "@lib/types";
import { cn } from "@lib/utils";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

const imageUrl = [
  "https://jldptczaxybijbhlcbjj.supabase.co/storage/v1/object/public/projects/0.1257265497553366-448814389_122157382592181555_8517678768345414919_n.jpg",
  "https://jldptczaxybijbhlcbjj.supabase.co/storage/v1/object/public/projects/0.22337137047383426-449942924_783476877236875_3282549891675463112_n.jpg",
  "https://jldptczaxybijbhlcbjj.supabase.co/storage/v1/object/public/projects/0.34432551927525545-449186742_989589682574123_5705111175156521882_n.jpg",
  "https://jldptczaxybijbhlcbjj.supabase.co/storage/v1/object/public/projects/0.365694995834676-450801928_122185965308031351_3973663162623189835_n.jpg",
  "https://jldptczaxybijbhlcbjj.supabase.co/storage/v1/object/public/projects/0.4160722142697284-FB_IMG_1715907147440.jpg",
];

const ProductImages = ({
  imageUrls,
  // productId,
  className,
}: {
  productId?: number;
  className?: string;
  imageUrls: string[];
}) => {
  const [viewedImage, setViewedImage] = useState(0);
  const [viewBar, setViewBar] = useState(false);
  const [isTouching, setIsTouching] = useState(false);
  // const imageUrls = useMemo(() => {
  //   const viewedImages = images.map((image) => image.imageUrl);
  //   return viewedImages.length ? viewedImages : imageUrl;
  // }, [images]);

  const handleTouchHold = useCallback(() => {
    if (imageUrls.length > 1) {
      setIsTouching(true);
      setViewBar(true);
    }
  }, [imageUrls.length]);
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (isTouching) {
      timer = setInterval(() => {
        setViewedImage((curr) => (curr + 1) % imageUrls.length);
      }, 1000);
    } else {
      if (timer) {
        clearInterval(timer);
      }
    }
    return () => clearInterval(timer);
  }, [isTouching, imageUrls.length]);
  return (
    <div
      onTouchStart={handleTouchHold}
      onTouchEnd={() => {
        if (imageUrls.length > 1) {
          setIsTouching(false);
          setViewBar(false);
          setViewedImage(0);
        }
      }}
      onMouseOut={() => {
        setViewedImage(0);
        setViewBar(false);
      }}
      onMouseOver={() => {
        if (imageUrls.length > 1) setViewBar(true);
      }}
      className=" w-full h-full"
    >
      <div className={cn(" relative ", className)}>
        {imageUrls.map((url, i) => (
          <img
            src={url}
            key={i}
            className={cn(
              "w-full h-full object-cover absolute inset-0 transition-all",
              {
                "opacity-0": viewedImage !== i,
                "opacity-100": viewedImage === i,
              }
            )}
          />
        ))}
        <div className=" absolute  flex inset-0 w-full h-full">
          {imageUrls.map((_, i) => (
            <div
              onMouseOver={() => setViewedImage(i)}
              key={i}
              //  border bg-red-300/20
              className=" h-full"
              style={{ width: `calc( 100% / ${imageUrls.length})` }}
            ></div>
          ))}
        </div>
      </div>
      {viewBar ? (
        <div className=" h-1  flex">
          {imageUrls.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-full     transition-all"
                //   {
                //     "opacity-0": viewedImage !== i,
                //     "opacity-100": viewedImage === i,
                //   }
              )}
              style={{ width: `calc( 100% / ${imageUrls.length})` }}
            >
              {viewedImage === i && (
                <motion.div
                  transition={{ duration: 0.2 }}
                  layoutId="tab-indicator"
                  className="w-full h-full  bg-accent-foreground rounded-full "
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className=" h-1" />
      )}
    </div>
  );
};

export default ProductImages;
