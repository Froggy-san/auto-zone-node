import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AnimatePresence, motion } from "framer-motion"
import { PiSubtract } from "react-icons/pi"

import type { Category } from "@/types"

import { useNavigate } from "react-router"
import { BASE_URL } from "@/lib/constants"
import type { ProductType } from "@/types/productTypes"

const opacity = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

interface Props {
  category: Category | undefined
  setSelectedCategory: React.Dispatch<React.SetStateAction<string | undefined>>
}
const CategoryDetails = ({ category, setSelectedCategory }: Props) => {
  return (
    <Dialog
      open={!!category}
      onOpenChange={() => setSelectedCategory(undefined)}
    >
      <DialogContent className="sm:max-h-[76vh max-h-[65vh] max-w-[800px] overflow-y-auto p-3 sm:p-6">
        <DialogHeader>
          <AnimatePresence>
            {category?.productTypes.length && category.name ? (
              <motion.div
                key="header"
                variants={opacity}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <DialogTitle className="flex flex-col items-center justify-center gap-2 text-center text-muted-foreground sm:flex-row">
                  <PiSubtract className="h-10 w-10 text-muted-foreground sm:h-8 sm:w-8" />{" "}
                  Select a sub-category from &apos;
                  {category.name}&apos;
                </DialogTitle>
              </motion.div>
            ) : (
              <DialogTitle className="hidden"></DialogTitle>
            )}
          </AnimatePresence>
          <DialogDescription className="hidden">
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {category?.productTypes.length ? (
            <SubCategoryList
              productTypes={category.productTypes}
              categoryId={category._id}
            />
          ) : (
            <motion.p
              key="paragraph"
              variants={opacity}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="flex flex-col items-center justify-center gap-3 text-center"
            >
              {" "}
              <span className="font-semibold md:text-xl">
                No related sub-categories to{" "}
                <AnimatePresence mode="wait">
                  {category?.name && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.1 }}
                    >
                      &apos;{category.name}&apos;
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>
              <PiSubtract className="h-6 w-6 text-muted-foreground md:h-10 md:w-10" />
            </motion.p>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}

function SubCategoryList({
  productTypes,
  categoryId,
}: {
  productTypes: ProductType[]
  categoryId: string
}) {
  const [hovered, setHovered] = useState<number | null>(null)

  const navigate = useNavigate()
  function handleSelect(prodcutTypeId: string) {
    navigate(
      `/products?page=1&category=${categoryId}&productType=${prodcutTypeId}`
    )
  }
  return (
    <motion.ul
      key="list"
      variants={opacity}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="grid grid-cols-2 flex-wrap items-start gap-2 xs:my-5 xs:grid-cols-3 md:grid-cols-5"
      onMouseLeave={() => setHovered(null)}
    >
      {productTypes
        // .sort((a, b) => a._id - b._id)
        .map((item, i) => (
          <li
            key={item._id}
            onClick={() => handleSelect(item._id)}
            onMouseEnter={() => setHovered(i)}
            className={`relative flex cursor-pointer flex-col items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm`}
          >
            {item.image ? (
              <img
                loading="lazy"
                src={`${BASE_URL}${item.image}`}
                alt={item.name}
                className="block h-20 object-contain"
              />
            ) : null}
            <p className="text-center text-xs font-semibold sm:text-sm">
              {item.name}
            </p>
            {hovered === i && (
              <motion.div
                transition={{ duration: 0.2 }}
                layoutId="item-card"
                className="absolute top-0 left-0 z-[-1] h-full w-full rounded-lg bg-border/70 dark:bg-card"
              />
            )}
          </li>
        ))}
    </motion.ul>
  )
}

export default CategoryDetails
