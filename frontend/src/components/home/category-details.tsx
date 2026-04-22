import { CategoryProps, ProductType } from "@lib/types";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AnimatePresence, motion } from "framer-motion";
import { PiSubtract } from "react-icons/pi";
import { useRouter } from "next/navigation";

const opacity = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

interface Props {
  category: CategoryProps | undefined;
  setSelectedCategory: React.Dispatch<React.SetStateAction<number | undefined>>;
}
const CategoryDetails = ({ category, setSelectedCategory }: Props) => {
  return (
    <Dialog
      open={!!category}
      onOpenChange={() => setSelectedCategory(undefined)}
    >
      <DialogContent className="  p-3 sm:p-6  max-h-[65vh] overflow-y-auto  sm:max-h-[76vh max-w-[800px]">
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
                <DialogTitle className=" flex flex-col sm:flex-row text-center justify-center items-center text-muted-foreground gap-2">
                  <PiSubtract className=" w-10 h-10  sm:w-8 sm:h-8 text-muted-foreground" />{" "}
                  Select a sub-category from &apos;
                  {category.name}&apos;
                </DialogTitle>
              </motion.div>
            ) : (
              <DialogTitle className="  hidden"></DialogTitle>
            )}
          </AnimatePresence>
          <DialogDescription className=" hidden">
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {category?.productTypes.length ? (
            <SubCategoryList
              productTypes={category.productTypes}
              categoryId={category.id}
            />
          ) : (
            <motion.p
              key="paragraph"
              variants={opacity}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className=" flex flex-col gap-3 justify-center text-center items-center "
            >
              {" "}
              <span className="  font-semibold md:text-xl">
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
              <PiSubtract className=" md:h-10 md:w-10 w-6 h-6 text-muted-foreground" />
            </motion.p>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

function SubCategoryList({
  productTypes,
  categoryId,
}: {
  productTypes: ProductType[];
  categoryId: number;
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  const router = useRouter();
  function handleSelect(prodcutTypeId: number) {
    router.push(
      `/products?page=1&categoryId=${categoryId}&productTypeId=${prodcutTypeId}`
    );
  }
  return (
    <motion.ul
      key="list"
      variants={opacity}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className=" grid  items-start  grid-cols-2 xs:grid-cols-3  md:grid-cols-5  gap-2  xs:my-5  flex-wrap"
      onMouseLeave={() => setHovered(null)}
    >
      {productTypes
        .sort((a, b) => a.id - b.id)
        .map((item, i) => (
          <li
            key={item.id}
            onClick={() => handleSelect(item.id)}
            onMouseEnter={() => setHovered(i)}
            className={`relative   px-3 py-2 flex flex-col  items-center justify-between    cursor-pointer  gap-2 text-sm   rounded-xl `}
          >
            {item.image ? (
              <img
                loading="lazy"
                src={item.image}
                alt={item.name}
                className="  h-20 block  object-contain"
              />
            ) : null}
            <p className=" font-semibold text-center text-xs sm:text-sm">
              {item.name}
            </p>
            {hovered === i && (
              <motion.div
                transition={{ duration: 0.2 }}
                layoutId="item-card"
                className=" absolute left-0 top-0 w-full h-full rounded-lg  bg-border/70  dark:bg-card   z-[-1]"
              />
            )}
          </li>
        ))}
    </motion.ul>
  );
}

export default CategoryDetails;
