import { z } from "zod"
import { AnimatePresence, motion } from "framer-motion"
import { ProFormSlideVariants, ProFormTransition } from "@/lib/constants"

import { Button } from "@/components/ui/button"
import { ImageOff, Minus, Plus } from "lucide-react"

import FullImagesGallery from "@/components/full-images-gallery"
import { formatCurrency } from "@/lib/client-helpers"
import { useState } from "react"
import { BsCartDash } from "react-icons/bs"
import Collapse, {
  CollapseButton,
  CollapseContant,
} from "@/components/collapse"
import { TbBoxModel2 } from "react-icons/tb"
import { Card } from "@/components/ui/card"
import { MdCategory } from "react-icons/md"
import { VscTypeHierarchySuper } from "react-icons/vsc"
import MoreDetailsAccordion from "./more-details-accordion"
import type { Category, ProductBrand, ProductImage } from "@/types"
import type { ProductsSchema } from "@/lib/types"
interface StepThreeProps {
  currStep: number[]
  isLoading: boolean
  mediaUrls: ProductImage[]
  categoriesArr: Category[]
  productBrandsArr: ProductBrand[]
  formValues: z.infer<typeof ProductsSchema>
}
const BASE_URL = import.meta.env.VITE_API_URL
function StepThree({
  currStep,
  formValues,
  mediaUrls,
  categoriesArr,
  productBrandsArr,
  isLoading,
}: StepThreeProps) {
  const [step, direction] = currStep

  const images = formValues.images.map((image) =>
    image.type.startsWith("video") ? `${image.preview} .mp4` : image.preview
  )
  const urls = mediaUrls.map((image) => `${BASE_URL}${image.imageUrl}`)
  const viewedImages = [...urls, ...images]
  const categories = categoriesArr.find(
    (cat) => cat._id === formValues.category
  )
  const productTypes = categories?.productTypes?.find(
    (type) => type._id === formValues?.productType
  )
  const productBrands = productBrandsArr.find(
    (brand) => brand._id === formValues.productBrand
  )

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
      className={`relative rounded-xl border-2 border-dashed p-4 ${
        isLoading && "pointer-events-none"
      }`}
    >
      {viewedImages.length ? (
        <FullImagesGallery
          images={viewedImages}
          shouldHideScrollBar={false}
          className="!h-[50vh]"
        />
      ) : (
        <div className="flex h-full items-center justify-center gap-3 bg-foreground/10 py-5 text-xl font-semibold">
          <ImageOff className="h-10 w-10" /> No images.
        </div>
      )}

      <div className="my-4 px-3 text-right text-xs text-muted-foreground">
        {formValues.stock ? (
          <i>
            Stock: <span>{formValues.stock}</span>
          </i>
        ) : (
          <i>Out of stock</i>
        )}
      </div>

      <main className="my-10">
        <h1 className="text-center text-3xl font-semibold tracking-wide">
          {formValues.name}
        </h1>
        <section className="mt-10 space-y-7 p-6">
          <div className="flex items-center justify-between text-xs">
            <div className="flex gap-3">
              <span>
                Listing price:{" "}
                <span className="text-red-400">
                  {" "}
                  {formatCurrency(formValues.listPrice)}
                </span>
              </span>

              <span className=" ">
                Sales price:{" "}
                <span className="text-green-400">
                  {" "}
                  {formatCurrency(formValues.salePrice)}
                </span>
              </span>
            </div>
          </div>
          <CartDummy stock={formValues.stock} />

          <div className="space-y-14">
            <h2 className="text-xl font-semibold">Product information</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              <Card className="h-fit p-5">
                <div className="flex items-center gap-2">
                  <div className="bg-dashboard-orange text-dashboard-text-orange mb-3 flex h-14 w-14 items-center justify-center rounded-full">
                    <MdCategory size={30} />
                  </div>
                  <h2 className="text-dashboard-text-orange text-2xl font-semibold">
                    {" "}
                    Category
                  </h2>
                </div>
                <p className="decoration-clone break-all">
                  &bull; {categories?.name}
                </p>
              </Card>

              <Card className="h-fit p-5">
                <div className="flex items-center gap-2">
                  <div className="bg-dashboard-indigo text-dashboard-text-indigo mb-3 flex h-14 w-14 items-center justify-center rounded-full">
                    <VscTypeHierarchySuper size={30} />
                  </div>
                  <h2 className="text-dashboard-text-indigo text-2xl font-semibold">
                    {" "}
                    Type
                  </h2>
                </div>
                <p className="decoration-clone break-all">
                  &bull; {productTypes?.name}
                </p>
              </Card>

              <Card className="h-fit p-5">
                <div className="flex items-center gap-2">
                  <div className="bg-dashboard-green text-dashboard-text-green mb-3 flex h-14 w-14 items-center justify-center rounded-full">
                    <TbBoxModel2 size={30} />
                  </div>
                  <h2 className="text-dashboard-text-green text-2xl font-semibold">
                    {" "}
                    Brand
                  </h2>
                </div>
                <p className="decoration-clone break-all">
                  &bull; {productBrands?.name}
                </p>
              </Card>
            </div>
            {/* ---- */}
            <div>
              <h2 className="text-xl font-semibold">Description</h2>
              <Collapse textLenght={1200}>
                <CollapseContant className="mt-16 text-lg">
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
  )
}
function CartDummy({ stock }: { stock: number }) {
  const [value, setValue] = useState(0)
  return (
    <motion.div className="item-center flex justify-end gap-2">
      <motion.div layout>
        <AnimatePresence>
          {value ? (
            <div className="flex items-center gap-2 overflow-hidden transition-opacity duration-300">
              <Button
                onClick={() => setValue((value) => value - 1)}
                size="sm"
                className="h-fit p-2"
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
                className="h-fit p-2"
                type="button"
              >
                <Plus size={17} />
              </Button>
            </div>
          ) : (
            <motion.button
              onClick={() => setValue(1)}
              className={
                "inline-flex h-8 items-center justify-center rounded-md bg-primary px-3 text-xs font-medium whitespace-nowrap text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
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
            className="inline-flex h-8 items-center justify-center rounded-md bg-secondary px-3 text-xs font-medium whitespace-nowrap text-secondary-foreground shadow transition-colors hover:bg-secondary/90 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          >
            <BsCartDash size={19} />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default StepThree
