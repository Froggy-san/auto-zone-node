"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { motion } from "framer-motion";
import { ClickAwayListener } from "@mui/material";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

interface ViewCarouselProps {
  images: string[];
  index?: number;
  closeFunction: () => void;
}

const ViewCarousel = ({ images, index, closeFunction }: ViewCarouselProps) => {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(index || 0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    if (index) api.scrollTo(index, true);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api, index, setCurrent]);

  React.useEffect(() => {
    const onEsc = (key: KeyboardEvent) => {
      if (key.code === "Escape") {
        closeFunction();
      }
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [closeFunction]);
  React.useEffect(() => {
    const body = document.querySelector("body");
    if (body) {
      if (index !== undefined) body.style.overflow = "hidden";
      else body.style.overflow = "auto";
    }

    return () => {
      if (body) body.style.overflow = "auto";
    };
  }, [index]);

  return createPortal(
    <motion.div
      onTouchStart={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, type: "spring" }}
      key="container"
      className="fixed inset-0 z-50 h-full w-full bg-[rgba(0,0,0,0.3)] backdrop-blur-sm backdrop-brightness-50"
    >
      <Carousel id="carousel" setApi={setApi}>
        <Button
          variant="secondary"
          className="absolute right-1 top-5 z-50 h-7 w-7 cursor-pointer rounded-full bg-muted p-0"
          onClick={closeFunction} // Ensure this button calls the handleClose function
        >
          <X size={16} />
        </Button>
        <CarouselContent id="carousel-content">
          {images.map((image, i) => {
            if (image.includes("mp4")) {
              return (
                <CarouselItem id="carousel-item" key={i}>
                  <div
                    key="container"
                    className="z-50 flex h-[100dvh] w-full select-none items-center justify-center"
                  >
                    <VideoSlide url={image} i={i} index={current} />
                    {/* <motion.video
                      controls
                      autoPlay={index === i}
                      playsInline
                      src={image}
                      initial={{ scale: 1.1, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 1.1, opacity: 0 }}
                      transition={{ duration: 0.1, ease: "linear" }}
                      className="max-h-[90%] max-w-[100%] object-contain sm:max-h-[100%]"
                    /> */}
                  </div>
                </CarouselItem>
              );
            } else {
              return (
                <CarouselItem id="carousel-item" key={i}>
                  <div
                    key="container"
                    className="z-50 flex h-[100dvh] w-full select-none items-center justify-center"
                  >
                    <motion.img
                      src={image}
                      initial={{ scale: 1.1, opacity: 0 }}
                      animate={{
                        scale: current === i ? 1 : 0.95,
                        opacity: current === i ? 1 : 0.5,
                      }}
                      exit={{ scale: 1.1, opacity: 0 }}
                      transition={{ duration: 0.1, ease: "linear" }}
                      alt="Enlarged view"
                      className="max-h-[90%] max-w-[100%] object-contain sm:max-h-[95%]"
                    />
                  </div>
                </CarouselItem>
              );
            }
          })}
        </CarouselContent>
        <CarouselPrevious variant="default" className="left-2" />
        <CarouselNext variant="default" className="right-2" />
        {/* <div className="absolute bottom-0 left-1/2 z-50 translate-x-[-50%] rounded-tl-lg rounded-tr-lg bg-primary-foreground p-2 py-2 text-center text-sm font-semibold text-muted-foreground">
          Slide {current} of {count}
        </div> */}
      </Carousel>
    </motion.div>,
    document.body
  );
};

export default ViewCarousel;
interface VideoSlideProps {
  index: number;
  i: number;
  url: string;
}

const VideoSlide: React.FC<VideoSlideProps> = ({ index, i, url }) => {
  // 1. Create a ref to hold the video element
  const videoRef = useRef<HTMLVideoElement>(null);

  // 2. Use useEffect to control playback whenever the 'index' changes
  useEffect(() => {
    const video = videoRef.current;

    // Check if this slide is the currently focused one
    const isFocused = index === i;

    if (video) {
      if (isFocused) {
        // Play the video when the slide is focused
        video.play().catch((error) => {
          // Important: Catch and handle potential Autoplay Policy errors
          console.warn("Video playback blocked by browser policy:", error);
        });
      } else {
        // Pause and reset (optional: video.currentTime = 0;) when the slide moves out
        video.pause();
      }
    }
  }, [index, i]); // Re-run this effect whenever the global 'index' changes

  return (
    <motion.video
      // 3. Attach the ref to the motion.video element
      ref={videoRef as any} // Framer Motion uses a complex ref type, using 'as any' often resolves TS issues here
      controls
      playsInline
      src={url.startsWith("blob") ? url.split(" ")[0] : url}
      initial={{ scale: 1.1, opacity: 0 }}
      animate={{
        scale: index === i ? 1 : 0.95,
        opacity: index === i ? 1 : 0.5,
      }} // Optional: Animate based on focus
      exit={{ scale: 1.1, opacity: 0 }}
      transition={{ duration: 0.2, ease: "linear" }}
      className="max-h-[90%] max-w-[100%] object-contain sm:max-h-[100%]"
    />
  );
};
