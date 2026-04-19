import { Category, Service, ServiceFee } from "@lib/types";
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
import { HandPlatter, PackageMinus, Pencil } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@components/ui/tooltip";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import SuccessToastDescription, {
  ErorrToastDescription,
} from "@components/toast-items";
import { useToast } from "@hooks/use-toast";
import Spinner from "@components/Spinner";
import { deleteServiceFeeAction } from "@lib/actions/serviceFeeAction";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { formatCurrency } from "@lib/client-helpers";
import { cn } from "@lib/utils";
import TagCarousel from "@components/tag-carousel";
import ServiceDiaDetails from "./service-dia-details";

interface ServiceStates {
  priceValue: string;
  discountValue: string;
  totalPriceAfterDiscountValue: string;
  hasReturnedValue: boolean;
  checked: boolean;
  open: boolean;
  deleteOpen: ServiceFee | null;
}

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
  payload: ServiceFee | null;
};

type Reset = {
  type: "reset";
};
const initalState = {
  priceValue: "",
  discountValue: "",
  totalPriceAfterDiscountValue: "",
  hasReturnedValue: false,
  checked: false,
  open: false,
  deleteOpen: null,
};

type Action =
  | PriceAction
  | DiscountAction
  | TotalPriceAction
  | HasReturnedAction
  | Checked
  | Open
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
        hasReturnedValue: false,
        checked: false,
        deleteOpen: null,
      };
  }
}

function ServiceFeesDialog({
  isAdmin,
  service,
  categories,
  total,
}: {
  isAdmin: boolean;
  service: Service;
  categories: Category[];
  total: number;
}) {
  const [
    {
      deleteOpen,
      open,
      checked,
      hasReturnedValue,
      priceValue,
      discountValue,
      totalPriceAfterDiscountValue,
    },
    dispatch,
  ] = useReducer(reducer, initalState);

  const pathname = usePathname();
  const router = useRouter();
  const searchParam = useSearchParams();

  let servicesArr = service.servicesFee;

  servicesArr = servicesArr.filter((service) => {
    let filterValue = true;
    if (checked)
      filterValue = filterValue && service.isReturned === hasReturnedValue;

    if (priceValue !== "" && !isNaN(Number(priceValue)))
      filterValue = filterValue && service.price === Number(priceValue);

    if (discountValue !== "" && !isNaN(Number(discountValue)))
      filterValue = filterValue && service.discount === Number(discountValue);

    if (
      totalPriceAfterDiscountValue !== "" &&
      !isNaN(Number(totalPriceAfterDiscountValue))
    )
      filterValue =
        filterValue &&
        service.totalPriceAfterDiscount ===
          Number(totalPriceAfterDiscountValue);

    return filterValue;
  });

  const fees = servicesArr.filter((serivce) => !serivce.isReturned);
  const returnedFees = servicesArr.filter((serivce) => serivce.isReturned);

  function handleOpenEdit(filter: string) {
    const params = new URLSearchParams(searchParam);
    params.set("editFee", filter);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function handleOpenChange() {
    dispatch({ type: "reset" });
    dispatch({ type: "open" });
  }

  const totals = useMemo(() => {
    return fees.reduce(
      (acc, item) => {
        acc.totalDiscount += item.discount;
        acc.totalPriceBeforeDiscount += item.price;
        acc.totalPrice += item.totalPriceAfterDiscount;
        return acc;
      },
      { totalPriceBeforeDiscount: 0, totalDiscount: 0, totalPrice: 0 }
    );
  }, [fees]);

  const totalReturns = useMemo(() => {
    return returnedFees.reduce(
      (acc, item) => {
        acc.totalDiscount += item.discount;
        acc.totalPriceBeforeDiscount += item.price;
        acc.totalPrice += item.totalPriceAfterDiscount;
        return acc;
      },
      { totalPriceBeforeDiscount: 0, totalDiscount: 0, totalPrice: 0 }
    );
  }, [returnedFees]);

  if (!service.servicesFee.length)
    return (
      <TooltipProvider delayDuration={500}>
        <Tooltip>
          <TooltipTrigger>
            <span className="  inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring pointer-events-none opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground rounded-md h-6 px-2 py-3 text-xs">
              Show
            </span>
          </TooltipTrigger>
          <TooltipContent>No services were preformed.</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <Button
          onClick={handleOpenChange}
          size="sm"
          className="   h-6 px-2 py-3 text-xs"
          variant="outline"
        >
          Show
        </Button>

        <DialogContent className=" border-none p-4  sm:p-6  !pb-0  flex flex-col  overflow-y-auto max-h-[81vh]     max-w-[900px] !rounded-none lg:!rounded-lg">
          <DialogHeader className=" hidden  invisible">
            <DialogTitle>{`'s phome numbers`}</DialogTitle>
            <DialogDescription className=" hidden">
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </DialogDescription>
          </DialogHeader>

          {/* <main className="  gap-6  flex flex-col max-h-[90%]  h-full relative   "> */}

          <Accordion type="single" collapsible>
            <AccordionItem value="item-1" className=" border-none">
              <div className=" relative w-[98%] mx-auto">
                <AccordionTrigger className=" flex    rounded-full bg-secondary/50 dark:bg-card/20   gap-1 px-3  py-2 text-[.7rem] mb-1">
                  Filters
                </AccordionTrigger>
              </div>

              <AccordionContent className=" pb-0">
                <div className="   flex flex-wrap gap-2 xs:gap-3 bg-secondary/50 dark:bg-card/20 rounded-md  justify-center p-2 sm:p-3 text-sm">
                  {/* <div className=" flex  flex-col sm:flex-row items-center  gap-3 "> */}
                  <div className=" space-y-2  w-[48%] sm:w-[32%]  mb-auto">
                    <label className=" text-xs " htmlFor="price">
                      Price
                    </label>
                    <Input
                      id="price"
                      placeholder="Price..."
                      autoFocus
                      value={priceValue}
                      onChange={(e) =>
                        dispatch({ type: "price", payload: e.target.value })
                      }
                    />
                  </div>
                  <div className=" space-y-2  w-[48%] sm:w-[32%]  mb-auto">
                    <label className=" text-xs " htmlFor="discount">
                      Discount
                    </label>
                    <Input
                      id="discount"
                      placeholder="Discount..."
                      value={discountValue}
                      onChange={(e) =>
                        dispatch({ type: "discount", payload: e.target.value })
                      }
                    />
                  </div>

                  <div className=" space-y-2  w-[48%] sm:w-[32%]  mb-auto">
                    <label className=" text-xs " htmlFor="totalPrice">
                      Total after discount
                    </label>
                    <Input
                      id="totalPrice"
                      placeholder="Total price after discount..."
                      value={totalPriceAfterDiscountValue}
                      onChange={(e) =>
                        dispatch({
                          type: "total-price",
                          payload: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center   justify-end space-x-2    flex-1 ">
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
                      onClick={() => {
                        //   if (hasReturnedValue) setHasReturnedValue(false);
                        //   setChecked((is) => !is);
                        dispatch({ type: "checked" });
                      }}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className=" space-y-4    sm:flex-1  sm:px-2 pb-1   sm:overflow-y-auto">
            <div className=" flex items-center justify-between">
              <h2 className=" font-semibold text-xl   whitespace-nowrap">
                <span className=" text-primary"> {servicesArr.length}</span>{" "}
                Service Fees.
              </h2>
              <ServiceDiaDetails service={service} isAdmin={isAdmin} />
              {/* <div className=" text-xs   justify-end flex items-center gap-y-1 gap-x-3 flex-wrap text-muted-foreground  ">
                <div>
                  Car plate: <span>{service.cars.plateNumber}</span>
                </div>
                <div>
                  Date: <span>{service.created_at}</span>
                </div>
              </div> */}
            </div>

            {/* FEES --------------------------------------------------------------- FEES */}

            {fees.length ? (
              <ul className=" space-y-4">
                {fees.map((serviceFee, i) => (
                  <FeesItem
                    key={i}
                    isAdmin={isAdmin}
                    serviceFee={serviceFee}
                    dispatch={dispatch}
                    handleOpenEdit={handleOpenEdit}
                    category={
                      categories.find((cat) => cat.id === serviceFee.categoryId)
                        ?.name || ""
                    }
                  />
                ))}
              </ul>
            ) : hasReturnedValue ? null : (
              <div className="  flex items-center justify-center gap-2   py-3">
                {" "}
                <HandPlatter size={30} className=" text-primary" /> No service
                Fees.
              </div>
            )}
            {/* FEES --------------------------------------------------------------- FEES */}

            {returnedFees.length ? (
              <ul className="  space-y-4 p-3 rounded-xl border  ">
                <h2 className=" font-semibold text-xl   whitespace-nowrap">
                  <span className=" text-destructive">
                    {" "}
                    {returnedFees.length}
                  </span>{" "}
                  Returned Services.
                </h2>
                {returnedFees.map((returnedFees, i) => (
                  <FeesItem
                    returned
                    key={i}
                    isAdmin={isAdmin}
                    serviceFee={returnedFees}
                    dispatch={dispatch}
                    handleOpenEdit={handleOpenEdit}
                    category={
                      categories.find(
                        (cat) => cat.id === returnedFees.categoryId
                      )?.name || ""
                    }
                  />
                ))}
                <Accordion type="single" collapsible>
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Total returns:</AccordionTrigger>
                    <AccordionContent className="   flex text-xs gap-x-2 gap-y-2 flex-wrap items-center ">
                      <div className=" py-1 px-2 bg-chart-1  hover:opacity-90 transition-opacity text-[.7rem] flex items-center gap-1 justify-center rounded-full ">
                        Total Price:
                        <span>
                          {formatCurrency(
                            totalReturns.totalPriceBeforeDiscount
                          )}
                        </span>
                      </div>

                      <div className=" py-1 px-2 bg-chart-4 hover:opacity-90 transition-opacity rounded-full text-[.7rem] gap-1 flex items-center justify-center ">
                        Total discount:{" "}
                        <span>
                          {formatCurrency(totalReturns.totalDiscount)}
                        </span>
                      </div>

                      <div className=" py-1 px-2 bg-chart-5 rounded-full hover:opacity-90  transition-opacity  text-[.7rem] gap-1 flex items-center justify-center ">
                        Total after discount:{" "}
                        <span>{formatCurrency(totalReturns.totalPrice)}</span>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </ul>
            ) : null}
          </div>
          {/* </main> */}
          <div className=" sticky pb-6 pt-4 sm:pt-0 bottom-0 left-0 bg-background  space-y-3">
            <DialogClose asChild>
              <Button size="sm" className=" w-full" variant="secondary">
                Close
              </Button>
            </DialogClose>
            <Summary TotalNumFees={fees.length} totals={totals} />
          </div>
        </DialogContent>
      </Dialog>
      <DeleteFee
        deleteOpen={deleteOpen ? true : false}
        fee={deleteOpen}
        serviceId={service.id}
        total={total}
        handleClose={() => {
          dispatch({ type: "delete-open", payload: null });
          dispatch({ type: "open" });
        }}
      />
    </>
  );
}

function DeleteFee({
  deleteOpen,
  fee,
  handleClose,
  serviceId,
  total,
}: {
  deleteOpen: boolean;
  fee: ServiceFee | null;
  handleClose: () => void;
  serviceId: number;
  total: number;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const serviceTotalAfterDelete = fee ? total - fee.totalPriceAfterDiscount : 0;
  return (
    <Dialog open={deleteOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] border-none">
        <DialogHeader>
          <DialogTitle>Delete fee.</DialogTitle>
          <DialogDescription>
            {`You are about to delete a fee along with all its associated data.`}
          </DialogDescription>
        </DialogHeader>

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
                if (fee) {
                  const { error } = await deleteServiceFeeAction(
                    String(fee.id),
                    serviceTotalAfterDelete,
                    serviceId
                  );

                  if (error) throw new Error(error);
                }
                setIsDeleting(false);
                handleClose();
                toast({
                  className: "bg-primary  text-primary-foreground",
                  title: `Data deleted!.`,
                  description: (
                    <SuccessToastDescription
                      message={`Service fee has been deleted.`}
                    />
                  ),
                });
              } catch (error: any) {
                toast({
                  variant: "destructive",
                  title: "Faild to delete service fee data.",
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

function FeesItem({
  returned,
  isAdmin,
  serviceFee,
  category,
  handleOpenEdit,
  dispatch,
}: {
  returned?: boolean;
  isAdmin: boolean;
  serviceFee: ServiceFee;
  category: string;
  handleOpenEdit: (filter: string) => void;
  dispatch: React.Dispatch<Action>;
}) {
  return (
    <li
      className={cn(
        "inline-flex w-full items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground px-4 py-2",
        {
          " bg-accent hover:bg-muted-foreground/30  dark:bg-card/25 dark:hover:bg-card/10 border-none ":
            returned,
        }
      )}
    >
      <div
        // href={`/serviceFees/${serviceFee.serviceFeeId}`}
        className="flex text-sm  h-fit flex-wrap  font-semibold !text-primary  !justify-start  items-center  max-w-full    gap-x-6 gap-y-3"
      >
        <div>
          {" "}
          Category:{" "}
          <span className="text-xs text-muted-foreground">{category}</span>
        </div>
        <div className=" ">
          Price:{" "}
          <span className=" text-xs text-muted-foreground">{` ${formatCurrency(
            serviceFee.price
          )}`}</span>{" "}
        </div>
        <div>
          {" "}
          Discount:{" "}
          <span className="text-xs text-muted-foreground">{` ${formatCurrency(
            serviceFee.discount
          )}`}</span>
        </div>

        {/* <div>
          Has it been returned?:{" "}
          <span className="text-xs text-muted-foreground">
            {` ${serviceFee.isReturned ? "Yes" : "No"}`}
          </span>
        </div> */}
        <div>
          Total after discount:{" "}
          <span className="text-xs text-muted-foreground   break-all whitespace-normal">{` ${formatCurrency(
            serviceFee.totalPriceAfterDiscount
          )}`}</span>
        </div>

        {isAdmin && (
          <div className=" flex items-center gap-2 ml-auto">
            <Button
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                handleOpenEdit(String(serviceFee.id));
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
                  payload: serviceFee,
                });
                // setDeleteOpen(serviceFee.id);
                //   setOpen(false);
              }}
              variant="destructive"
              size="sm"
              className=" p-0 w-8 h-8"
            >
              <PackageMinus className=" h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </li>
  );
}

interface SummaryProps {
  totalPriceBeforeDiscount: number;
  totalDiscount: number;
  totalPrice: number;
}
function Summary({
  totals,
  TotalNumFees,
}: {
  totals: SummaryProps;
  TotalNumFees: number;
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
                  {TotalNumFees}
                </span>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Types of services provided.</p>
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
            <span>{formatCurrency(totals.totalPrice)}</span>
          </div>
        </div>
      </div>
    </TagCarousel>
  );
}

export default ServiceFeesDialog;
// <div
//   key={i}
//   className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground px-4 py-2"
// >
//   <div
//     // href={`/serviceFees/${serviceFee.serviceFeeId}`}
//     className="flex text-sm  h-fit flex-wrap  font-semibold !text-primary  !justify-start  items-center  max-w-full    gap-x-6 gap-y-3"
//   >
//     <div className=" ">
//       Price:{" "}
//       <span className=" text-xs text-muted-foreground">{` ${formatCurrency(
//         serviceFee.price
//       )}`}</span>{" "}
//     </div>
//     <div>
//       {" "}
//       Discount:{" "}
//       <span className="text-xs text-muted-foreground">{` ${formatCurrency(
//         serviceFee.discount
//       )}`}</span>
//     </div>

//     <div>
//       {" "}
//       Category:{" "}
//       <span className="text-xs text-muted-foreground">{` ${
//         categories?.find(
//           (category) => category.id === serviceFee.categoryId
//         )?.name || "Something went wrong!"
//       }`}</span>
//     </div>

//     <div>
//       Has it been returned?:{" "}
//       <span className="text-xs text-muted-foreground">
//         {` ${serviceFee.isReturned ? "Yes" : "No"}`}
//       </span>
//     </div>
//     <div>
//       Total price after discount:{" "}
//       <span className="text-xs text-muted-foreground   break-all whitespace-normal">{` ${formatCurrency(
//         serviceFee.totalPriceAfterDiscount
//       )}`}</span>
//     </div>

//     <div className=" flex items-center gap-2 ml-auto">
//       <Button
//         variant="outline"
//         onClick={(e) => {
//           e.preventDefault();
//           handleOpenEdit(String(serviceFee.id));
//           dispatch({ type: "open" });
//         }}
//         className=" p-0 w-8 h-8"
//       >
//         <Pencil className=" h-4 w-4" />
//       </Button>
//       <Button
//         onClick={(e) => {
//           e.preventDefault();
//           dispatch({ type: "open" });
//           dispatch({
//             type: "delete-open",
//             payload: serviceFee,
//           });
//           // setDeleteOpen(serviceFee.id);
//           //   setOpen(false);
//         }}
//         variant="destructive"
//         size="sm"
//         className=" p-0 w-8 h-8"
//       >
//         <PackageMinus className=" h-4 w-4" />
//       </Button>
//     </div>
//   </div>
// </div>
