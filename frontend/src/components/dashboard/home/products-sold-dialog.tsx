import { ProductToSell, Service } from "@lib/types";
import React, { useMemo, useReducer, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@components/ui/input";
import { Switch } from "@components/ui/switch";
import { Checkbox } from "@components/ui/checkbox";
import { Label } from "@components/ui/label";
import { Button } from "@components/ui/button";
import { PackageMinus, PackageSearch, Pencil } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { LinkPreview } from "@components/link-preview";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import SuccessToastDescription, {
  ErorrToastDescription,
} from "@components/toast-items";
import { deleteProductToSellAction } from "@lib/actions/product-sold-actions";
import { useToast } from "@hooks/use-toast";
import Spinner from "@components/Spinner";
import { DEFAULT_CAR_LOGO, DEFAULT_PRODUCT_PIC } from "@lib/constants";
import Link from "next/link";
import { formatCurrency } from "@lib/client-helpers";
import ServiceDiaDetails from "./service-dia-details";
import { cn } from "@lib/utils";
import TagCarousel from "@components/tag-carousel";
import CurrencyInput from "react-currency-input-field";

interface ServiceStates {
  priceValue: string;
  discountValue: string;
  nameValue: string;
  countValue: string;
  totalPriceAfterDiscountValue: string;
  hasReturnedValue: boolean;
  checked: boolean;
  open: boolean;
  deleteOpen: ProductToSell | null;
}

const initalState = {
  priceValue: "",
  discountValue: "",
  totalPriceAfterDiscountValue: "",
  nameValue: "",
  hasReturnedValue: false,
  checked: false,
  countValue: "",
  open: false,
  deleteOpen: null,
};

type PriceAction = {
  type: "price";
  payload: string;
};

type DiscountAction = {
  type: "discount";
  payload: string;
};
type TotalPriceAction = {
  type: "total-price";
  payload: string;
};

type CountAction = {
  type: "count";
  payload: string;
};

type NameAction = {
  type: "name";
  payload: string;
};

type HasReturnedAction = {
  type: "has-returned";
};

type Checked = {
  type: "checked";
};

type Open = {
  type: "open";
};
type DeleteOpen = {
  type: "delete-open";
  payload: ProductToSell | null;
};
type Reset = {
  type: "reset";
};

type Action =
  | PriceAction
  | DiscountAction
  | TotalPriceAction
  | HasReturnedAction
  | Checked
  | Open
  | CountAction
  | NameAction
  | DeleteOpen
  | Reset;

function reducer(state: ServiceStates, action: Action) {
  switch (action.type) {
    case "price":
      return { ...state, priceValue: action.payload };

    case "discount":
      return { ...state, discountValue: action.payload };

    case "total-price":
      return { ...state, totalPriceAfterDiscountValue: action.payload };

    case "count":
      return { ...state, countValue: action.payload };

    case "name":
      return { ...state, nameValue: action.payload };

    case "open":
      return { ...state, open: !state.open };

    case "delete-open":
      return { ...state, deleteOpen: action.payload };

    case "checked":
      return { ...state, checked: !state.checked, hasReturnedValue: false };

    case "has-returned":
      return { ...state, hasReturnedValue: !state.hasReturnedValue };

    case "reset":
      return {
        ...state,
        priceValue: "",
        discountValue: "",
        totalPriceAfterDiscountValue: "",
        nameValue: "",
        hasReturnedValue: false,
        checked: false,
        countValue: "",
        deleteOpen: null,
      };
  }
}

const ProductSoldDialog = ({
  isAdmin,
  service,
  total,
}: {
  isAdmin: boolean;
  service: Service;
  total: number;
}) => {
  const [
    {
      deleteOpen,
      open,
      priceValue,
      discountValue,
      totalPriceAfterDiscountValue,
      nameValue,
      checked,
      hasReturnedValue,
      countValue,
    },
    dispatch,
  ] = useReducer(reducer, initalState);

  const pathname = usePathname();
  const router = useRouter();
  const searchParam = useSearchParams();
  const soldProducts = service.productsToSell;

  function handleOpenChange() {
    dispatch({ type: "reset" });
    dispatch({ type: "open" });
  }

  function handleOpenEdit(filter: string) {
    const params = new URLSearchParams(searchParam);
    params.set("editSold", filter);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  //   const [priceValue, setPriceValue] = useState("");
  //   const [discountValue, setDiscountValue] = useState("");
  //   const [countValue, setCountValue] = useState("");
  //   const [totalPriceAfterDiscountValue, setTotalPriceAfterDiscount] =
  //     useState("");
  //   const [nameValue, setNameValue] = useState("");
  //   const [hasReturnedValue, setHasReturnedValue] = useState<boolean>(false);
  //   const [checked, setChecked] = useState(false);
  //   const searchParam = useSearchParams();
  //   const router = useRouter();
  //   const pathname = usePathname();

  let productsArr = soldProducts;

  productsArr = productsArr.filter((product) => {
    const name = new RegExp(nameValue, "i"); // 'i' for case-insensitive

    let filterValue = name.test(product.product.name);
    if (checked)
      filterValue = filterValue && product.isReturned === hasReturnedValue;

    if (Number(priceValue))
      filterValue = filterValue && product.pricePerUnit === Number(priceValue);

    if (Number(discountValue))
      filterValue = filterValue && product.discount === Number(discountValue);

    if (Number(countValue))
      filterValue = filterValue && product.count === Number(countValue);

    if (Number(totalPriceAfterDiscountValue))
      filterValue =
        filterValue &&
        product.totalPriceAfterDiscount ===
          Number(totalPriceAfterDiscountValue);

    return filterValue;
  });

  const productsSold = productsArr.filter((pro) => !pro.isReturned);
  const returnedPro = productsArr.filter((pro) => pro.isReturned);

  //  const totals = productsArr.reduce(
  //     (acc, item) => {
  //       acc.totalDiscount += item.discount;
  //       acc.totalPriceBeforeDiscount += item.pricePerUnit * item.count;
  //       acc.totalPriceAfterDiscount += item.totalPriceAfterDiscount;
  //       return acc;
  //     },
  //     {
  //       totalDiscount: 0,
  //       totalPriceAfterDiscount: 0,
  //       totalPriceBeforeDiscount: 0,
  //     }
  //   );
  const totals = useMemo(() => {
    return productsSold.reduce(
      (acc, item) => {
        acc.units += item.count;
        acc.totalDiscount += item.discount;
        acc.totalPriceBeforeDiscount += item.pricePerUnit * item.count;
        acc.totalPriceAfterDiscount += item.totalPriceAfterDiscount;
        return acc;
      },
      {
        units: 0,
        totalDiscount: 0,
        totalPriceAfterDiscount: 0,
        totalPriceBeforeDiscount: 0,
      },
    );
  }, [productsSold]);

  const totalReturns = useMemo(() => {
    return returnedPro.reduce(
      (acc, item) => {
        acc.units += item.count;
        acc.totalDiscount += item.discount;
        acc.totalPriceBeforeDiscount += item.pricePerUnit * item.count;
        acc.totalPriceAfterDiscount += item.totalPriceAfterDiscount;
        return acc;
      },
      {
        units: 0,
        totalDiscount: 0,
        totalPriceAfterDiscount: 0,
        totalPriceBeforeDiscount: 0,
      },
    );
  }, [returnedPro]);

  if (!soldProducts.length)
    return (
      <TooltipProvider delayDuration={500}>
        <Tooltip>
          <TooltipTrigger>
            <span className="  inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring pointer-events-none opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground rounded-md h-6 px-2 py-3  text-xs ">
              Show
            </span>
          </TooltipTrigger>
          <TooltipContent>No products were sold.</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

  return (
    <div onClick={(e) => e.stopPropagation()} className=" w-fit">
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <Button
          onClick={handleOpenChange}
          size="sm"
          className="   h-6 px-2 py-3 text-xs"
          variant="outline"
        >
          Show
        </Button>
        <DialogContent className=" border-none p-4  sm:p-6  !pb-0  overflow-y-auto sm:overflow-y-visible  flex flex-col  max-h-[81vh]     max-w-[900px] !rounded-none lg:!rounded-lg">
          <DialogHeader className=" hidden  invisible">
            <DialogTitle>{`'s phome numbers`}</DialogTitle>
            <DialogDescription className=" hidden">
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </DialogDescription>
          </DialogHeader>

          <Accordion type="single" collapsible>
            <AccordionItem value="item-1" className=" border-none">
              <div className=" relative w-[98%] mx-auto">
                <AccordionTrigger className=" flex    rounded-full bg-secondary/50 dark:bg-card/20   gap-1 px-3  py-2 text-[.7rem] mb-1">
                  Filters
                </AccordionTrigger>
              </div>
              <AccordionContent className=" pb-0">
                <div className=" flex flex-wrap gap-2  xs:gap-3 bg-secondary/50  dark:bg-card/20 rounded-md  justify-center   p-3  text-sm">
                  <div className=" space-y-2  w-full xxs:w-[48%] sm:w-[31%]  md:w-[32%]   mb-auto">
                    <label className=" text-xs " htmlFor="price">
                      Price per unit
                    </label>
                    <CurrencyInput
                      autoFocus
                      name="price"
                      id="price"
                      placeholder="Price per unit"
                      decimalsLimit={2} // Max number of decimal places
                      prefix="EGP " // Currency symbol (e.g., Egyptian Pound)
                      decimalSeparator="." // Use dot for decimal
                      groupSeparator="," // Use comma for thousands
                      value={priceValue}
                      onValueChange={(formattedValue, name, value) => {
                        dispatch({
                          type: "price",
                          payload: formattedValue || "",
                        });
                      }}
                      className="input-field "
                    />{" "}
                  </div>
                  <div className=" space-y-2  w-full xxs:w-[48%] sm:w-[31%]  md:w-[32%]  mb-auto">
                    <label className=" text-xs " htmlFor="discount">
                      Discount
                    </label>
                    <CurrencyInput
                      name="discount"
                      id="discount"
                      placeholder="Discount..."
                      decimalsLimit={2} // Max number of decimal places
                      prefix="EGP " // Currency symbol (e.g., Egyptian Pound)
                      decimalSeparator="." // Use dot for decimal
                      groupSeparator="," // Use comma for thousands
                      value={discountValue}
                      onValueChange={(formattedValue, name, value) => {
                        dispatch({
                          type: "discount",
                          payload: formattedValue || "",
                        });
                      }}
                      className="input-field "
                    />
                  </div>
                  <div className=" space-y-2  w-full xxs:w-[48%] sm:w-[31%]  md:w-[32%]  mb-auto">
                    <label className=" text-xs " htmlFor="count">
                      Count
                    </label>
                    <CurrencyInput
                      id="count"
                      name="Count"
                      placeholder="Available Stock"
                      decimalsLimit={2} // Max number of decimal places
                      prefix="UNITS " // Currency symbol (e.g., Egyptian Pound)
                      decimalSeparator="." // Use dot for decimal
                      groupSeparator="," // Use comma for thousands
                      value={countValue}
                      onValueChange={(formattedValue, name, value) => {
                        dispatch({
                          type: "count",
                          payload: formattedValue || "",
                        });
                      }}
                      className="input-field  "
                    />
                  </div>
                  <div className=" space-y-2  w-full xxs:w-[48%] sm:w-[31%]  md:w-[32%]  mb-auto">
                    <label className=" text-xs " htmlFor="totalPrice">
                      Total price after discount
                    </label>
                    <CurrencyInput
                      id="total-price-after-dis"
                      name="discount"
                      placeholder="Total price after discount"
                      decimalsLimit={2}
                      prefix="EGP "
                      decimalSeparator="."
                      groupSeparator=","
                      value={totalPriceAfterDiscountValue}
                      onValueChange={(formattedValue, name, value) => {
                        dispatch({
                          type: "total-price",
                          payload: formattedValue || "",
                        });
                      }}
                      className="input-field "
                    />
                  </div>
                  <div className=" space-y-2   w-full xxs:w-[48%] sm:w-[31%]  md:w-[32%]  mb-auto">
                    <label className=" text-xs " htmlFor="name">
                      Name
                    </label>
                    <Input
                      id="name"
                      placeholder="Total price after discount..."
                      value={nameValue}
                      onChange={(e) =>
                        dispatch({ type: "name", payload: e.target.value })
                      }
                    />
                  </div>

                  <div className="flex items-center  justify-center  space-x-2   w-full xxs:w-[48%] sm:w-[31%]  md:w-[32%] ">
                    <Switch
                      id="airplane-mode"
                      checked={hasReturnedValue}
                      // onChange={() => setHasReturnedValue((is) => !is)}
                      onClick={() => dispatch({ type: "has-returned" })}
                      disabled={!checked}
                    />
                    <Label className=" text-xs " htmlFor="airplane-mode">
                      Has it returned
                    </Label>
                    <Checkbox
                      checked={checked}
                      onClick={() => dispatch({ type: "checked" })}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className=" space-y-4    sm:flex-1  sm:px-2  pb-2   sm:overflow-y-auto">
            <div className=" flex items-center gap-5 flex-wrap-reverse  justify-between">
              <h2 className=" font-semibold text-xl  whitespace-nowrap">
                <span className=" text-primary">{productsArr.length}</span>{" "}
                Products sold.
              </h2>

              <ServiceDiaDetails service={service} isAdmin={isAdmin} />
              {/* <div className=" text-xs   justify-end flex items-center gap-y-1 gap-x-3 flex-wrap text-muted-foreground  ">
                <Link
                  prefetch={false}
                  href={
                    isAdmin
                      ? `/dashboard/customers?name=${service.clients.name}`
                      : ""
                  }
                >
                  Client: <span>{service.clients.name}</span>
                </Link>
                <div>
                  Date: <span>{service.created_at}</span>
                </div>
              </div> */}
            </div>
            {productsSold.length ? (
              <ul className=" space-y-4">
                {productsSold.map((product, i) => (
                  <ProItem
                    key={i}
                    isAdmin={isAdmin}
                    product={product}
                    dispatch={dispatch}
                    handleOpenEdit={handleOpenEdit}
                  />
                ))}
              </ul>
            ) : (
              <p className="  flex items-center justify-center gap-3  py-3  ">
                {" "}
                <PackageSearch size={30} className="text-primary" /> No
                Products.
              </p>
            )}

            {returnedPro.length ? (
              <ul className="  space-y-4 p-3 rounded-xl border  ">
                <h2 className=" font-semibold text-xl   whitespace-nowrap">
                  <span className=" text-destructive">
                    {" "}
                    {returnedPro.length}
                  </span>{" "}
                  Returned Services.
                </h2>
                {returnedPro.map((returnedPro, i) => (
                  <ProItem
                    returned
                    key={i}
                    isAdmin={isAdmin}
                    product={returnedPro}
                    dispatch={dispatch}
                    handleOpenEdit={handleOpenEdit}
                  />
                ))}
                <Accordion type="single" collapsible>
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Total returns:</AccordionTrigger>
                    <AccordionContent className="   flex text-xs gap-x-2 gap-y-2 flex-wrap items-center ">
                      <Summary
                        totalProSold={returnedPro.length}
                        totals={totalReturns}
                      />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </ul>
            ) : null}
          </div>
          {/* </main> */}
          <div className=" sticky sm:static sm: pb-6 pt-4 sm:pt-0 bottom-0 left-0 bg-background  space-y-3">
            <DialogClose asChild>
              <Button size="sm" className=" w-full" variant="secondary">
                Close
              </Button>
            </DialogClose>

            <Summary totalProSold={productsSold.length} totals={totals} />
          </div>
        </DialogContent>
      </Dialog>

      <DeleteProSold
        deleteOpen={deleteOpen ? true : false}
        proSold={deleteOpen}
        serviceId={service.id}
        total={total}
        handleClose={() => {
          dispatch({ type: "delete-open", payload: null });
          dispatch({ type: "open" });
        }}
      />
    </div>
  );
};

function DeleteProSold({
  deleteOpen,
  proSold,
  handleClose,
  total,
  serviceId,
}: {
  deleteOpen: boolean;
  proSold: ProductToSell | null;
  handleClose: () => void;
  total: number;
  serviceId: number;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [shouldUpdateStock, setShouldUpdateStock] = useState(true);
  const { toast } = useToast();

  return (
    <Dialog open={deleteOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] border-none">
        <DialogHeader>
          <DialogTitle>Delete product sold.</DialogTitle>
          <DialogDescription>
            {`You are about to delete a product receipt along with all its associated data.`}
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-3">
          <Checkbox
            id="stockUpdate"
            checked={shouldUpdateStock}
            onClick={() => setShouldUpdateStock((is) => !is)}
          />
          <Label
            htmlFor="stockUpdate"
            className=" text-xs text-muted-foreground"
          >
            Update product stock
          </Label>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button size="sm" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button
            disabled={isDeleting}
            variant="destructive"
            size="sm"
            onClick={async () => {
              setIsDeleting(true);
              try {
                if (proSold) {
                  const { error } = await deleteProductToSellAction({
                    proSold,
                    serviceId,
                    totalPrice: total - proSold.totalPriceAfterDiscount,
                    shouldUpdateStock,
                  });
                  if (error) throw new Error(error);
                }
                setIsDeleting(false);
                handleClose();
                toast({
                  className: "bg-primary  text-primary-foreground",
                  title: `Data deleted!.`,
                  description: (
                    <SuccessToastDescription
                      message={`Sold product receipt has been deleted.`}
                    />
                  ),
                });
              } catch (error: any) {
                toast({
                  variant: "destructive",
                  title: "Faild to delete client's data.",
                  description: <ErorrToastDescription error={error.message} />,
                });
              }
            }}
          >
            {isDeleting ? <Spinner className=" h-full" /> : "Confrim"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ProItem {
  product: ProductToSell;
  returned?: boolean;
  isAdmin: boolean;
  dispatch: React.Dispatch<Action>;
  handleOpenEdit: (param: string) => void;
}

function ProItem({
  product,
  returned,
  isAdmin,
  dispatch,
  handleOpenEdit,
}: ProItem) {
  const productImages = product.product.productImages;
  const image =
    productImages.length &&
    (productImages.find((image) => image.isMain)?.imageUrl ||
      product.product.productImages[0].imageUrl);
  return (
    <li
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground px-4 py-2",
        {
          " bg-accent hover:bg-muted-foreground/30  dark:bg-card/25 dark:hover:bg-card/10 border-none ":
            returned,
        },
      )}
    >
      <LinkPreview
        url={`/products/${product.product.id}`}
        isStatic
        imageSrc={image || DEFAULT_PRODUCT_PIC}
      >
        <div
          //   href={`/products/${product.product.id}`}
          className="flex text-sm  h-fit flex-wrap  font-semibold !text-primary !justify-start  items-center  max-w-full    gap-x-6 gap-y-3"
        >
          <div className="   pointer-events-none">
            Product name:{" "}
            <span className=" text-xs text-muted-foreground  break-all whitespace-normal">{` ${product.product.name}`}</span>{" "}
          </div>

          <div className="   pointer-events-none">
            Count:{" "}
            <span className="text-xs text-muted-foreground">{` ${product.count}`}</span>
          </div>
          <div className="   pointer-events-none">
            Price per unit:{" "}
            <span className=" text-xs text-muted-foreground">{` ${formatCurrency(
              product.pricePerUnit,
            )}`}</span>{" "}
          </div>
          <div className="   pointer-events-none">
            {" "}
            Discount per unit:{" "}
            <span className="text-xs text-muted-foreground">{` ${formatCurrency(
              product.discount,
            )}`}</span>
          </div>

          <div className="   pointer-events-none">
            Total price after discount:{" "}
            <span className="text-xs text-muted-foreground   break-all whitespace-normal">{` ${formatCurrency(
              product.totalPriceAfterDiscount,
            )}`}</span>
          </div>
          {isAdmin && product.note.length > 0 && (
            <div className=" break-all  whitespace-normal pointer-events-none">{`Note: ${product.note}`}</div>
          )}

          {isAdmin && (
            <div className=" flex items-center gap-2 ml-auto">
              <Button
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  handleOpenEdit(String(product.id));
                  dispatch({ type: "open" });
                }}
                className=" p-0 w-8 h-8"
              >
                <Pencil className=" h-4 w-4" />
              </Button>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  dispatch({ type: "open" });
                  dispatch({
                    type: "delete-open",
                    payload: product,
                  });
                }}
                variant="destructive"
                size="sm"
                className=" p-0 w-8 h-8"
              >
                <PackageMinus className=" h-4 w-4 " />
              </Button>
            </div>
          )}
        </div>
      </LinkPreview>
    </li>
  );
}

interface SummaryProps {
  units: number;
  totalDiscount: number;
  totalPriceAfterDiscount: number;
  totalPriceBeforeDiscount: number;
}

function Summary({
  totals,
  totalProSold,
}: {
  totals: SummaryProps;
  totalProSold: number;
}) {
  return (
    <TagCarousel>
      <TooltipProvider delayDuration={500}>
        <Tooltip>
          <TooltipTrigger className=" hover:cursor-default">
            {" "}
            <div className=" relative h-fit w-fit text-xs">
              <div className="embla__slide">
                {" "}
                <span className=" h-5 w-5 bg-chart-5 rounded-full flex items-center justify-center">
                  {totalProSold}
                </span>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Types of products sold.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider delayDuration={500}>
        <Tooltip>
          <TooltipTrigger className=" hover:cursor-default">
            {" "}
            <div className=" relative">
              <div className="embla__slide">
                {" "}
                <div className="py-[.21rem] px-2 bg-chart-1  break-keep   hover:opacity-90 transition-opacity text-[.7rem] flex items-center gap-1 justify-center rounded-full">
                  <span className=" inline-flex items-center   px-[0.3rem] py-0.1   shrink-0  bg-chart-5 rounded-full justify-center">
                    {totals.units}
                  </span>
                  Units
                </div>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Total units sold.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className=" relative">
        <div className="embla__slide">
          {" "}
          <div className=" py-1 px-2 bg-chart-1  text-nowrap break-keep   hover:opacity-90 transition-opacity text-[.7rem] flex items-center gap-1 justify-center rounded-full ">
            Total Price:
            <span>{formatCurrency(totals.totalPriceBeforeDiscount)}</span>
          </div>
        </div>
      </div>

      <div className=" relative">
        <div className="embla__slide">
          {" "}
          <div className=" py-1 px-2 bg-chart-4  text-nowrap break-keep  hover:opacity-90 transition-opacity rounded-full text-[.7rem] gap-1 flex items-center justify-center ">
            Total discount: <span>{formatCurrency(totals.totalDiscount)}</span>
          </div>
        </div>
      </div>

      <div className=" relative">
        <div className="embla__slide">
          {" "}
          <div className=" py-1 px-2 bg-chart-5 rounded-full text-nowrap  hover:opacity-90  transition-opacity  text-[.7rem] gap-1 flex items-center justify-center ">
            Total after discount:{" "}
            <span>{formatCurrency(totals.totalPriceAfterDiscount)}</span>
          </div>
        </div>
      </div>
    </TagCarousel>
  );
}

export default ProductSoldDialog;

// <div
//                 key={i}
//                 className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground px-4 py-2"
//               >
//                 <LinkPreview
//                   url={`/products/${product.product.id}`}
//                   isStatic
//                   imageSrc={image || DEFAULT_PRODUCT_PIC}
//                 >
//                   <div
//                     //   href={`/products/${product.product.id}`}
//                     className="flex text-sm  h-fit flex-wrap  font-semibold !text-primary !justify-start  items-center  max-w-full    gap-x-6 gap-y-3"
//                   >
//                     <div className="   pointer-events-none">
//                       Product name:{" "}
//                       <span className=" text-xs text-muted-foreground  break-all whitespace-normal">{` ${product.product.name}`}</span>{" "}
//                     </div>
//                     <div className="   pointer-events-none">
//                       Price:{" "}
//                       <span className=" text-xs text-muted-foreground">{` ${formatCurrency(
//                         product.pricePerUnit
//                       )}`}</span>{" "}
//                     </div>
//                     <div className="   pointer-events-none">
//                       {" "}
//                       Discount:{" "}
//                       <span className="text-xs text-muted-foreground">{` ${formatCurrency(
//                         product.discount
//                       )}`}</span>
//                     </div>
//                     <div className="   pointer-events-none">
//                       Count:{" "}
//                       <span className="text-xs text-muted-foreground">{` ${product.count}`}</span>
//                     </div>
//                     <div className="   pointer-events-none">
//                       Has it been returned?:{" "}
//                       <span className="text-xs text-muted-foreground">
//                         {` ${product.isReturned ? "Yes" : "No"}`}
//                       </span>
//                     </div>
//                     <div className="   pointer-events-none">
//                       Total price after discount:{" "}
//                       <span className="text-xs text-muted-foreground   break-all whitespace-normal">{` ${formatCurrency(
//                         product.totalPriceAfterDiscount
//                       )}`}</span>
//                     </div>
//                     <div className=" break-all  whitespace-normal pointer-events-none">{`Note: ${product.note}`}</div>

//                     <div className=" flex items-center gap-2 ml-auto">
//                       <Button
//                         variant="outline"
//                         onClick={(e) => {
//                           e.preventDefault();
//                           handleOpenEdit(String(product.id));
//                           dispatch({ type: "open" });
//                         }}
//                         className=" p-0 w-8 h-8"
//                       >
//                         <Pencil className=" h-4 w-4" />
//                       </Button>
//                       <Button
//                         onClick={(e) => {
//                           e.preventDefault();
//                           dispatch({ type: "open" });
//                           dispatch({
//                             type: "delete-open",
//                             payload: product,
//                           });
//                         }}
//                         variant="destructive"
//                         size="sm"
//                         className=" p-0 w-8 h-8"
//                       >
//                         <PackageMinus className=" h-4 w-4 " />
//                       </Button>
//                     </div>
//                   </div>
//                 </LinkPreview>
//               </div>
