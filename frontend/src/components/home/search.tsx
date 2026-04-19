"use client";
import React, { useState } from "react";
import {
  Calculator,
  Calendar,
  CreditCard,
  PackageSearch,
  Settings,
  Smile,
  User,
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Input } from "@components/ui/input";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@components/ui/button";
import { cn } from "@lib/utils";
import useSearchCategories from "@lib/queries/categories/useSearchCategory";
import { Product } from "@lib/types";

interface Props {
  className?: string;
}

const Search = ({ className }: Props) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [focused, setFocused] = useState(false);
  const { categories, products, error, isLoading } =
    useSearchCategories(searchTerm);

  console.log(products, "PRO");
  const show = focused && searchTerm.length > 0;
  return (
    <Command
      // value={searchTerm}
      onValueChange={setSearchTerm}
      shouldFilter={false}
      className={cn(
        "rounded-lg border shadow-md w-full my-2  overflow-visible  relative mx-auto max-w-[450px]",
        className,

        { "animate-pulse": isLoading }
      )}
    >
      {/* <CommandInput placeholder="Type a command or search..." /> */}
      <div className=" relative ">
        <Input
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="    w-full pr-4 focus-visible:ring-2"
        />
        <Button
          size="sm"
          className=" absolute right-2 top-1/2  p-0 h-7 w-7  -translate-y-1/2"
        >
          <PackageSearch className=" h-4 w-4  " />
        </Button>
      </div>

      <AnimatePresence>
        {true && (
          <motion.div
            initial={{
              y: 70,
              left: "50%",
              translateX: "-50%",
              width: 350,
              // scale: 0.9,
              maxHeight: 120, // Change height to maxHeight
              opacity: 0,
            }}
            animate={{
              y: 50,
              left: "50%",
              translateX: "-50%",
              width: 700,
              // scale: 1,

              maxHeight: 250, // Change height to maxHeight
              opacity: 1,
              transition: { type: "spring", stiffness: 300, damping: 15 },
            }}
            exit={{
              y: 70,
              left: "50%",
              translateX: "-50%",
              width: 350,
              // scale: 0.9,

              maxHeight: 120, // Change height to maxHeight
              opacity: 0,
              transition: { duration: 0.2 },
            }}
            className="absolute w-full flex p-2 max-h-72  flex-col-reverse md:flex-row  overscroll-contain overflow-y-scroll bg-card z-40 rounded-xl border"
          >
            <CommandList className=" overflow-visible md:h-full max-h-full flex-1">
              {isLoadingg ? (
                <p className=" text-center">Loading...</p>
              ) : (
                <CommandEmpty>No results found.</CommandEmpty>
              )}

              {categories?.map((cat, i) => (
                <CommandItem key={cat.id} value={cat.name}>
                  <span>{cat.name}</span>
                </CommandItem>
              ))}
            </CommandList>
            {products?.length ? <ProductList products={products} /> : null}
          </motion.div>
        )}
      </AnimatePresence>
    </Command>
  );
};

function ProductList({ products }: { products: Product[] }) {
  return (
    <ul className=" flex   h-[350px]  md:h-full max-h-full max-w-full overflow-x-auto border-l  p-2  md:flex-col    md:w-[40%]   md:overflow-hidden gap-4  ">
      {products.map((pro) => (
        <ProductItem key={pro.id} product={pro} />
      ))}
    </ul>
  );
}
function ProductItem({ product }: { product: Product }) {
  const image = product.productImages.length
    ? product.productImages.find((image) => image.isMain)?.imageUrl ||
      product.productImages[0].imageUrl
    : null;
  return (
    <li className=" relative flex cursor-default gap-2 select-none  shrink-0 max-w-40 w-fit items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent hover:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 h-12 ">
      {image && (
        <img
          src={image}
          alt={`${product.name} image`}
          className=" h-full w-11"
        />
      )}{" "}
      <p className="  line-clamp-2 ">{product.name}</p>
    </li>
  );
}
export default Search;
