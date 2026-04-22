"use client";
import * as React from "react";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Link from "next/link";
import { usePrevNextButtons } from "@hooks/use-prev-next-buttons";
import { Button } from "@components/ui/button";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import HomeFilter from "./home-filter";
import { CarMakerData, CarMakersData, CategoryProps } from "@lib/types";
import { EmblaCarouselType } from "embla-carousel";

import FirstSlideImage from "@../public/first-slide.jpg";
import BattaryImage from "@../public/battary.jpeg";
import ExhaustImage from "@../public/exhaustImage.webp";
import BrakeImage from "@../public/brakeImage.jpg";
import ToolsImage from "@../public/toolsImage.webp";
import ServiceImage from "@../public/serviceImage.webp";
import Image, { StaticImageData } from "next/image";
type CarouselItem = {
  image?: StaticImageData;
  header?: string;
  text: string;
  link?: string;
  buttonText?: string;
};
const CAROUSEL_LINKS: CarouselItem[] = [
  {
    image: BattaryImage,

    // "https://article.images.consumerreports.org/image/upload/f_auto/prod/content/dam/cro/news_articles/cars/CR-BG-Car-Battery-Hero",
    header: "Power You Can Trust: 3-Year Warranty Inside.",
    text: "Heavy-duty power with up to 3-Year Free Replacement Warranty. Featuring AGM and High-CCA batteries..",
    link: "/products?categoryId=18&page=1&productTypeId=88",
    buttonText: "",
  },
  {
    image: ExhaustImage,

    // "https://umkyoinqpknmedkowqva.supabase.co/storage/v1/object/public/defualt-image/GettyImages-1387900580-1920w.webp",
    header: "EXHAUST SYSTEMS SALE: Up To 25% Off",
    text: "Huge inventory featuring Cat-Back, Axle-Back, Headers, and more. Performance for every budget!",
    link: "/products?categoryId=26",
  },
  {
    image: BrakeImage,

    // "https://di-uploads-pod18.dealerinspire.com/landroverboise/uploads/2019/10/Car-parts-5-.png",
    header: "Zero Fade. Maximum Endurance.",
    text: "Explore our massive selection of Big Brake Kits (BBKs), drilled/slotted rotors, and ceramic pads built for heat management.",
  },
  {
    image: ToolsImage,

    // "https://umkyoinqpknmedkowqva.supabase.co/storage/v1/object/public/defualt-image/ThinkstockPhotos-526209999-1920w.webp",
    link: "/products",
    header: "Zero Fade. Maximum Endurance.",
    text: "Explore our massive selection of Big Brake Kits (BBKs), drilled/slotted rotors, and ceramic pads built for heat management.",
  },

  {
    image: ServiceImage,

    // "https://umkyoinqpknmedkowqva.supabase.co/storage/v1/object/public/defualt-image/queen-creek-complete-auto-repair-hero-home-1920w.webp",
    header: "Expert Auto Repair. Reliable Service.",
    text: "From complex diagnostics to routine maintenance, our Certified Technicians get you back on the road safely and quickly.",
    link: "/fixs",
    buttonText: "Book Your Appointment",
  },
  // {
  //   image:
  //     "https://shopee365.wordpress.com/wp-content/uploads/2023/09/car-parts-online-collection.png",
  //   text: "Fixs.",
  //   link: "/fixs",
  // },
  // {
  //   image:
  //     "https://autosupplymaster.com/cdn/shop/collections/gettyimages-additives_1.jpg?v=1713368256&width=1200",
  //   text: "Fixs.",
  //   link: "/fixs",
  // },
];

export function HomeCarousel({
  categories,
  carMakers,
}: {
  categories: CategoryProps[];
  carMakers: CarMakersData[];
}) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [currSlide, setCurrSlide] = React.useState(0);

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(api);

  // Makes sure that the selected tab is displayed on the screen.

  const selected = React.useCallback((emblaApi: EmblaCarouselType) => {
    setCurrSlide(emblaApi.selectedScrollSnap());
  }, []);

  React.useEffect(() => {
    if (api) api.on("select", selected);
  }, [api, selected]);

  // ! This useEffect does the same thing has the one above but not has optimized becasue i creates the function on every selection.
  // React.useEffect(() => {
  //   if (!api) return;

  //   const onSelect = () => {
  //     setCurrSlide(api.selectedScrollSnap());
  //   };

  //   api.on("select", onSelect);

  //   return () => {
  //     api.off("select", onSelect);
  //   };
  // }, [api]);

  return (
    <Carousel setApi={setApi} className="w-full  sm:w-[97%] mx-auto  mt-10   ">
      <CarouselContent className="   h-[500px]    ">
        <SlideOne carMakers={carMakers} categories={categories} />
        {CAROUSEL_LINKS.map((item, index) => (
          <CarouselItem key={index} className=" h-full w-full  ">
            <div className=" h-full  w-full ">
              <Link href={item.link || ""}>
                <Card className=" w-full h-full  shadow-none  border-none relative  overflow-hidden  bg-cover bg-center rounded-none sm:rounded-xl">
                  {item.image && (
                    <Image
                      loading="lazy"
                      src={item.image}
                      alt={`${item.header} image`}
                      className={` object-cover object-bottom  h-full   w-full  max-w-full absolute left-0 top-0  mask-accent   ${
                        (index == 0 || index === 4) && "object-center"
                      } `}
                    />
                  )}

                  <div className=" flex items-center  gap-5 relative h-full w-full">
                    <div className="  h-fit max-w-[500px]  gap-5  lg:max-w-[650px] flex items-center justify-center flex-col md:h-full z-50   m-auto  md:ml-0 md md:mr-auto   w-full md:pl-[8%] md:pr-14  bg-accent/80 p-3 text-center md:text-left  ">
                      {item.header && (
                        <h2 className="  text-3xl  md:text-4xl  text-green-700 dark:text-green-500 font-semibold  ">
                          {item.header}
                        </h2>
                      )}

                      <p className=" text-xl   md:text-3xl "> {item.text}</p>
                      {item.buttonText && (
                        <Button className="group w-full gap-4">
                          {item.buttonText}
                          <ArrowRight
                            className={` w-4 h-4   transition-all group-hover:translate-x-2  `}
                          />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      <Button
        onClick={onPrevButtonClick}
        disabled={prevBtnDisabled}
        size="icon"
        className="  absolute hidden md:flex left-5 top-1/2   -translate-y-1/2  z-40"
      >
        <ChevronLeft className=" h-4 w-4" />
      </Button>

      <Button
        size="icon"
        onClick={onNextButtonClick}
        disabled={nextBtnDisabled}
        className="  absolute right-5 top-1/2  hidden md:flex   -translate-y-1/2  z-30"
      >
        <ChevronRight className=" h-4 w-4" />
      </Button>
    </Carousel>
  );
}
// ! how to mirror an image in CSS :  scale-x-[-1]
function SlideOne({
  categories,
  carMakers,
}: {
  categories: CategoryProps[];
  carMakers: CarMakersData[];
}) {
  return (
    <CarouselItem key="first-item" className=" h-full w-full pl-[0.99rem] ">
      <div className=" h-full  w-full ">
        <Card className=" w-full h-full  border-none relative  shadow-none  overflow-hidden sm:rounded-xl  bg-cover bg-center rounded-none ">
          <video
            autoPlay
            loop
            muted
            playsInline // Good practice for cross-device compatibility
            src="/videos/banner-video.mp4"
            className="object-cover object-bottom h-full w-full max-w-full absolute left-0 top-0 mask-accent"
          >
            <source src="/videos/banner-video.mp4" type="video/mp4" />
          </video>
          {/* <Image
            // src="https://media.gq-magazine.co.uk/photos/5fdcb8470d9a429c2d245628/16:9/w_1600,c_limit/2021CARS_AUDIEtron.jpg"
            // src="https://tmna.aemassets.toyota.com/is/image/toyota/lexus/images/performance/high-performance/Lexus-RCF-Performance-explore-lexus-high-performance-desktop-1400x580-LEX-RCF-MY25-0009.jpg?wid=1400&hei=580"
            // src="https://www.asv.com.au/wp-content/uploads/2017/10/shutterstock_126064121-1.jpg"
            src={FirstSlideImage}
            alt="first-silde-image"
            className=" object-cover object-bottom   h-full   w-full  max-w-full absolute left-0 top-0  mask-accent  "
          /> */}

          {/* <img
            src="https://lirp.cdn-website.com/194049ad/dms3rep/multi/opt/478107962-1920w.jpg"
            // src="https://www.asv.com.au/wp-content/uploads/2017/10/shutterstock_126064121-1.jpg"
            className=" object-cover   scale-x-[-1]   h-full   w-full  max-w-full absolute left-0 top-0  "
          /> */}
          <div className=" flex items-center  gap-5 relative h-full p-5 w-full">
            <div className="flex-shrink-0 z-50  mx-auto md:ml-24   w-full md:w-[600px]  my-auto ">
              <h2 className=" text-2xl font-semibold text-center  mb-3 text-white">
                Pick parts for your car
              </h2>
              <HomeFilter
                categories={categories}
                carMakers={carMakers}
                className="    p-2 rounded-md "
              />
            </div>
          </div>
        </Card>
      </div>
    </CarouselItem>
  );
}
// srcset="https://www.mirrorreview.com/wp-content/uploads/2024/11/A-Complete-Guide-to-Choosing-Quality-Car-Parts-Online-in-New-Zealand.jpg 956w, https://www.mirrorreview.com/wp-content/uploads/2024/11/A-Complete-Guide-to-Choosing-Quality-Car-Parts-Online-in-New-Zealand-300x152.jpg 300w, https://www.mirrorreview.com/wp-content/uploads/2024/11/A-Complete-Guide-to-Choosing-Quality-Car-Parts-Online-in-New-Zealand-768x389.jpg 768w"
