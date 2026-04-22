import {
  Category,
  CategoryProps,
  ProductBrand,
  ProductImage,
  ProductsSchema,
  ProductType,
} from "@lib/types";
import { Control } from "react-hook-form";
import { z } from "zod";
import { AnimatePresence, motion } from "framer-motion";
import { ProFormSlideVariants, ProFormTransition } from "@lib/constants";

import { Button } from "@components/ui/button";
import { ImageOff, Minus, Plus } from "lucide-react";

import FullImagesGallery from "@components/full-images-gallery";
import { formatCurrency } from "@lib/client-helpers";
import { useState } from "react";
import { BsCartDash } from "react-icons/bs";
import Collapse, {
  CollapseButton,
  CollapseContant,
} from "@components/collapse";
import { TbBoxModel2 } from "react-icons/tb";
import { Card } from "@components/ui/card";
import { MdCategory } from "react-icons/md";
import { VscTypeHierarchySuper } from "react-icons/vsc";
import MoreDetailsAccordion from "./more-details-accordion";
interface StepThreeProps {
  currStep: number[];
  isLoading: boolean;
  mediaUrls: ProductImage[];
  categoriesArr: CategoryProps[];
  productBrandsArr: ProductBrand[];
  formValues: z.infer<typeof ProductsSchema>;
}

function StepThree({
  currStep,
  formValues,
  mediaUrls,
  categoriesArr,
  productBrandsArr,
  isLoading,
}: StepThreeProps) {
  const [step, direction] = currStep;

  const images = formValues.images.map((image) =>
    image.type.startsWith("video") ? `${image.preview} .mp4` : image.preview
  );
  const urls = mediaUrls.map((image) => image.imageUrl);
  const viewedImages = [...urls, ...images];
  const categories = categoriesArr.find(
    (cat) => cat.id === formValues.categoryId
  );
  const productTypes = categories?.productTypes.find(
    (type) => type.id === formValues.productTypeId
  );
  const productBrands = productBrandsArr.find(
    (brand) => brand.id === formValues.productBrandId
  );

  // const date = new Date();

  return (
    <motion.div
      custom={direction}
      variants={ProFormSlideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={ProFormTransition}
      // initial={{
      //   opacity: 0,
      //   x: direction < 0 ? -350 : 350,
      // }}
      // animate={{
      //   opacity: 1,
      //   x: 0,
      // }}
      // exit={{
      //   opacity: 0,
      //   x: direction < 0 ? -350 : 350,
      // }}
      className={` relative border-2 p-4  rounded-xl border-dashed ${
        isLoading && "pointer-events-none"
      }`}
    >
      {viewedImages.length ? (
        <FullImagesGallery images={viewedImages} className="  !h-[50vh]" />
      ) : (
        <div className=" h-full flex items-center justify-center  bg-foreground/10  font-semibold text-xl py-5 gap-3">
          <ImageOff className=" w-10 h-10" /> No images.
        </div>
      )}

      <div className=" text-xs  text-muted-foreground my-4 text-right px-3">
        {formValues.stock ? (
          <i>
            Stock: <span>{formValues.stock}</span>
          </i>
        ) : (
          <i>Out of stock</i>
        )}
      </div>

      <main className=" my-10">
        <h1 className=" text-center text-3xl font-semibold tracking-wide">
          {formValues.name}
        </h1>
        <section className=" mt-10 space-y-7 p-6">
          <div className=" text-xs items-center  flex justify-between">
            <div className="  flex  gap-3">
              <span>
                Listing price:{" "}
                <span className=" text-red-400">
                  {" "}
                  {formatCurrency(formValues.listPrice)}
                </span>
              </span>

              <span className=" ">
                Sales price:{" "}
                <span className=" text-green-400">
                  {" "}
                  {formatCurrency(formValues.salePrice)}
                </span>
              </span>
            </div>
          </div>
          <CartDummy stock={formValues.stock} />

          <div className=" space-y-14">
            <h2 className=" text-xl font-semibold">Product information</h2>
            <div className=" grid  gap-3 grid-cols-1 sm:grid-cols-2  md:grid-cols-3 ">
              <Card className=" p-5 h-fit">
                <div className=" flex items-center gap-2">
                  <div className=" w-14 h-14 rounded-full    bg-dashboard-orange  text-dashboard-text-orange  flex items-center justify-center mb-3">
                    <MdCategory size={30} />
                  </div>
                  <h2 className=" text-2xl font-semibold  text-dashboard-text-orange">
                    {" "}
                    Category
                  </h2>
                </div>
                <p className="   decoration-clone  break-all">
                  &bull; {categories?.name}
                </p>
              </Card>

              <Card className=" p-5 h-fit">
                <div className=" flex items-center gap-2">
                  <div className=" w-14 h-14 rounded-full    bg-dashboard-indigo  text-dashboard-text-indigo  flex items-center justify-center mb-3">
                    <VscTypeHierarchySuper size={30} />
                  </div>
                  <h2 className=" text-2xl font-semibold  text-dashboard-text-indigo">
                    {" "}
                    Type
                  </h2>
                </div>
                <p className="   decoration-clone  break-all">
                  &bull; {productTypes?.name}
                </p>
              </Card>

              <Card className=" p-5 h-fit">
                <div className=" flex items-center gap-2">
                  <div className=" w-14 h-14 rounded-full    bg-dashboard-green  text-dashboard-text-green  flex items-center justify-center mb-3">
                    <TbBoxModel2 size={30} />
                  </div>
                  <h2 className=" text-2xl font-semibold  text-dashboard-text-green">
                    {" "}
                    Brand
                  </h2>
                </div>
                <p className="   decoration-clone  break-all">
                  &bull; {productBrands?.name}
                </p>
              </Card>
            </div>
            {/* ---- */}
            <div>
              <h2 className=" text-xl font-semibold">Description</h2>
              <Collapse textLenght={1200}>
                <CollapseContant className="mt-16 text-lg ">
                  {formValues.description}
                </CollapseContant>
                <CollapseButton arrowPositionX="right" />
              </Collapse>
            </div>
          </div>

          <MoreDetailsAccordion additionalDetails={formValues.moreDetails} />
        </section>
      </main>
    </motion.div>
  );
}
function CartDummy({ stock }: { stock: number }) {
  const [value, setValue] = useState(0);
  return (
    <motion.div className=" flex item-center justify-end gap-2 ">
      <motion.div layout>
        <AnimatePresence>
          {value ? (
            <div className=" flex items-center  transition-opacity overflow-hidden duration-300   gap-2">
              <Button
                onClick={() => setValue((value) => value - 1)}
                size="sm"
                className="  p-2 h-fit "
                type="button"
              >
                <Minus size={17} />
              </Button>

              <motion.span
                key={value}
                initial={{ opacity: 0, translateY: -7 }}
                animate={{
                  opacity: 1,
                  translateY: 0,
                }}
                exit={{
                  opacity: 0,
                  translateY: 7,
                }}
              >
                {value}
              </motion.span>

              <Button
                disabled={value === stock}
                onClick={() => setValue((value) => value + 1)}
                size="sm"
                className="  p-2 h-fit "
                type="button"
              >
                <Plus size={17} />
              </Button>
            </div>
          ) : (
            <motion.button
              onClick={() => setValue(1)}
              className={
                "inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-8 rounded-md px-3 text-xs "
              }
              type="button"
            >
              Add to cart
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence mode="popLayout">
        {value && (
          <motion.button
            layout
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setValue(0)}
            className=" inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground shadow hover:bg-secondary/90 h-8 rounded-md px-3 text-xs"
          >
            <BsCartDash size={19} />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default StepThree;
