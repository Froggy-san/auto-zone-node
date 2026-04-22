"use client";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { PackageSearch } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import { Input } from "@components/ui/input";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@components/ui/button";
import { cn } from "@lib/utils";
import useSearchCategories from "@lib/queries/categories/useSearchCategory";
import { categoryResult, Product } from "@lib/types";
import { ClickAwayListener, useMediaQuery } from "@mui/material";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CloseButton from "@components/close-button";

interface Props {
  className?: string;
}

const Search = ({ className }: Props) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [show, setShow] = useState(false);
  const isSmallScreen = useMediaQuery("(max-width: 839px)");
  const divRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { categories, productTypes, products, error, isLoading } =
    useSearchCategories(searchTerm);

  function handleCategory(url: string) {
    router.push(url);
  }

  // const show = focused && searchTerm.length > 0;

  return (
    <>
      <div
        className={cn(
          "  absolute  transition-all duration-300 lg:absolute left-1/2  px-2 sm:px-6   top-14  w-full   mid:w-[400px]  lg:w-[500px] z-50  flex-1 -translate-x-1/2  mid:-translate-x-1/3 mid:left-1/2  mid:top-[unset]   lg:left-1/2 lg:top-[unset] lg:-translate-x-1/2",
          { "mid:w-full mid:-translate-x-1/2": show }
        )}
      >
        {isSmallScreen ? (
          <SearchBarOnSmScreens
            isLoading={isLoading}
            isSmallScreen={isSmallScreen}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            show={show}
            setShow={setShow}
            categories={categories}
            products={products}
            productTypes={productTypes}
            handleCategory={handleCategory}
          />
        ) : (
          <SearchBarOnBigScreens
            isLoading={isLoading}
            isSmallScreen={isSmallScreen}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            show={show}
            setShow={setShow}
            categories={categories}
            products={products}
            productTypes={productTypes}
            handleCategory={handleCategory}
          />
        )}
      </div>
    </>
  );
};

interface SearchProps {
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  className?: string;
  isLoading: boolean;
  show: boolean;
  isSmallScreen: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  categories: categoryResult[] | undefined | null;
  productTypes:
    | { id: number; image: string | null; name: string; categoryId: number }[]
    | undefined
    | null;
  products: Product[] | undefined | null;
  handleCategory: (url: string) => void;
}

function SearchBarOnBigScreens({
  searchTerm,
  setSearchTerm,
  isLoading,
  show,
  setShow,
  categories,
  products,
  productTypes,
  className,
  isSmallScreen,
  handleCategory,
}: SearchProps) {
  const divRef = useRef<HTMLDivElement>(null);

  //! There was an issue with making the element scroll it's height when we have the flex direction set to "flex-col-reverse" becasue we were calling the "scrollTo(x:0,y:0) thinking it would scorll to the top just like it normally would if the flex direction was not set, but that was wrong when it's set to "flex-col-reverse" it reverses the whole element upside down, which means in order to scroll to the top of the element in question you need to scroll all the way down.
  useLayoutEffect(() => {
    if (divRef.current) {
      const element = divRef.current;

      // Check if there's actual scrollable content
      if (element.scrollHeight > element.clientHeight) {
        // Determine scroll position based on flex direction
        element.scrollTo(0, 0);
        // if (!isSmallScreen) {
        //   // This corresponds to flex-col-reverse
        //   // For flex-col-reverse, "scrolling to top" visually means scrolling to max position
        //   element.scrollTo(0, -element.scrollHeight);
        // } else {
        //   // This corresponds to md:flex-row
        //   // For flex-row, "scrolling to top" visually means scrolling to 0
        // }
      }
    }
  }, [searchTerm]);
  return (
    <ClickAwayListener
      onClickAway={() => {
        setShow(false);
      }}
    >
      <Command
        // value={searchTerm}

        onValueChange={setSearchTerm}
        shouldFilter={false}
        className={cn(
          "rounded-lg border shadow-md w-full my-2  overflow-visible  relative ",
          className,

          { "animate-pulse": isLoading }
        )}
      >
        {/* <CommandInput placeholder="Type a command or search..." /> */}
        <div className=" relative ">
          <Input
            onFocus={() => {
              // if (isSmallScreen) return;
              setShow(true);
            }}
            onBlur={() => {
              // if (isSmallScreen) return;
              // setShow(false);
            }}
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
          {show && (
            <motion.div
              ref={divRef}
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
                width: 800,
                // scale: 1,

                maxHeight: 300, // Change height to maxHeight
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
              className="absolute w-full flex p-2    gap-2 flex-row  overscroll-contain overflow-y-scroll bg-card z-40 rounded-xl border"
            >
              <CommandList className=" overflow-visible max-h-full  flex-1">
                {/* <h3 className=" text-sm text-muted-foreground mb-3">
                Categories
                </h3>
                {isLoading ? (
                  <p className=" text-center">Loading...</p>
                  ) : (
                    <CommandEmpty>No results found.</CommandEmpty>
                    )} */}
                <>
                  <CommandGroup heading="Categories">
                    {categories?.length ? (
                      categories?.map((cat) => (
                        <CommandItem
                          key={cat.id}
                          value={cat.name}
                          onClick={() => {
                            setShow(false);

                            // handleCategory(
                            //   `/products?page=1&categoryId=${cat.id}`
                            // );
                          }}
                          onSelect={() => {
                            setShow(false);
                            handleCategory(
                              `/products?page=1&categoryId=${cat.id}`
                            );
                          }}
                          className="  font-semibold"
                        >
                          <span>{cat.name}</span>
                        </CommandItem>
                      ))
                    ) : (
                      <p className="  text-sm pl-3">
                        No categoy results found.
                      </p>
                    )}
                  </CommandGroup>
                  <CommandGroup heading="Sub-Categories">
                    {productTypes?.length ? (
                      productTypes.map((type) => (
                        <CommandItem
                          key={type.id}
                          value={type.name}
                          onClick={() =>
                            handleCategory(
                              `/products?page=1&categoryId=${type.categoryId}&productTypeId=${type.id}`
                            )
                          }
                          onSelect={() =>
                            handleCategory(
                              `/products?page=1&categoryId=${type.categoryId}&productTypeId=${type.id}`
                            )
                          }
                          className=" font-semibold"
                        >
                          {type.image ? (
                            <img
                              src={type.image}
                              alt={`${type.name} image`}
                              className="  max-w-16   h-12 pr-2 object-contain"
                            />
                          ) : null}{" "}
                          <span>{type.name}</span>
                        </CommandItem>
                      ))
                    ) : (
                      <p className="  text-sm pl-3">
                        No sub-category results found.
                      </p>
                    )}
                  </CommandGroup>
                </>
              </CommandList>
              {products?.length ? (
                <ProductList
                  isSmallScreen={isSmallScreen}
                  products={products}
                />
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </Command>
    </ClickAwayListener>
  );
}

function SearchBarOnSmScreens({
  searchTerm,
  setSearchTerm,
  isLoading,
  isSmallScreen,
  show,
  setShow,
  categories,
  products,
  productTypes,
  className,
  handleCategory,
}: SearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [handleOnly, setHandleOnly] = useState(false);

  const handleDisableDrag = () => {
    setHandleOnly(true);
  };

  const handleEnableDrag = () => setHandleOnly(false);

  useEffect(() => {
    let focusTimeout: NodeJS.Timeout;
    if (show) {
      // Set a timeout to allow the drawer's open animation to complete
      focusTimeout = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 300); // Adjust this delay (milliseconds) based on your drawer's animation duration
    } else {
      // Optional: blur on close if you want, but often not necessary
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }

    return () => {
      clearTimeout(focusTimeout); // Clean up the timeout
    };
  }, [show]); // Only re-run when the 'show' prop changes;

  return (
    <Drawer
      handleOnly={handleOnly}
      open={show}
      onOpenChange={setShow}
      direction="right"
    >
      <DrawerTrigger asChild>
        <div className=" relative  hover:cursor-pointer  bg-popover hover:bg-popover/80  mt-2 transition-all rounded-lg ">
          <Input className="   pointer-events-none    w-full  " />
          <Button
            size="sm"
            className=" absolute right-2 top-1/2  p-0 h-7 w-7  -translate-y-1/2"
          >
            <PackageSearch className=" h-4 w-4  " />
          </Button>
        </div>
      </DrawerTrigger>
      <DrawerContent className=" max-h-full h-full  overflow-y-auto overflow-x-hidden ">
        <DrawerHeader className=" bg-primary py-1 ">
          <DrawerTitle className=" flex items-center justify-between text-sm text-primary-foreground ">
            SEARCH
            <CloseButton onClick={() => setShow(false)} className="  static " />
          </DrawerTitle>
          <DrawerDescription className=" hidden">
            This action cannot be undone.
          </DrawerDescription>
        </DrawerHeader>
        <div className=" p-2 space-y-6 ">
          <Input
            ref={inputRef}
            id="Search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
            className=" w-full bg-popover"
          />
          <div className=" space-y-3 max-h-full  overflow-y-scroll overflow-x-hidden">
            {products && products.length ? (
              <ProductList
                isSmallScreen={isSmallScreen}
                onMouseEnter={handleDisableDrag}
                onMouseLeave={handleEnableDrag}
                onTouchStart={handleDisableDrag}
                onTouchEnd={handleEnableDrag}
                products={products}
              />
            ) : null}
            <ul>
              <h3 className=" text-muted-foreground text-sm  mb-3 ">
                Category
              </h3>
              {categories?.map((cat) => (
                <li
                  key={cat.id}
                  onClick={() =>
                    handleCategory(`/products?page=1&categoryId=${cat.id}`)
                  }
                  className=" relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none hover:bg-accent hover::text-accent-foreground data-[disabled=true]:opacity-50"
                >
                  {cat.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <DrawerFooter>
          <DrawerClose>
            <Button variant="outline" className=" w-full">
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

interface ProductListProps extends React.HTMLAttributes<HTMLUListElement> {
  products: Product[];
  isSmallScreen: boolean;
}

function ProductList({
  products,
  className,
  isSmallScreen,
  ...props
}: ProductListProps) {
  return (
    <div
      className={cn(
        " flex-shrink-0 w-full    overflow-hidden h-full max-h-full max-w-full sm:border-l p-2",
        className,
        { "w-[50%]": !isSmallScreen }
      )}
    >
      <h3 className=" text-muted-foreground text-sm  mb-3 ">Products</h3>
      <ul
        className={cn(
          "flex   flex-row pb-3   overflow-x-auto   w-full max-w-full     gap-y-3 gap-x-4",
          { "flex-col pb-0": !isSmallScreen }
        )}
        {...props}
      >
        {products.map((pro) => (
          <ProductItem
            key={pro.id}
            product={pro}
            isSmallScreen={isSmallScreen}
          />
        ))}
      </ul>
    </div>
  );
}
function ProductItem({
  product,
  isSmallScreen,
}: {
  product: Product;
  isSmallScreen?: boolean;
}) {
  const image = product.productImages.length
    ? product.productImages.find((image) => image.isMain)?.imageUrl ||
      product.productImages[0].imageUrl
    : null;
  return (
    <li
      className={cn(
        " relative select-none w-[250px]   bg-accent shadow-md flex items-center  shrink-0  rounded-sm px-3 py-3  text-sm outline-none  hover:bg-accent/50  hover:text-accent-foreground transition-all  ",
        { "w-full ": !isSmallScreen }
      )}
    >
      <Link
        href={`/products/${product.id}`}
        className=" flex cursor-default gap-2   justify-center   items-center"
      >
        {image && (
          <img
            src={image}
            alt={`${product.name} image`}
            className="  h-10 w-11 object-contain"
          />
        )}{" "}
        <p className="  line-clamp-2 ">{product.name}</p>
      </Link>
    </li>
  );
}
export default Search;
