import React, { useMemo, useReducer, useState } from "react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { HandPlatter, PackageMinus, Pencil } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import Spinner from "@/components/Spinner"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { formatCurrency } from "@/lib/client-helpers"
import { cn } from "@/lib/utils"
import TagCarousel from "@/components/tag-carousel"
import ServiceDiaDetails from "./service-dia-details"
import type { Category, Service, ServiceFee } from "@/types"
import { useLocation, useNavigate, useSearchParams } from "react-router"
import { deleteServiceFee } from "@/services/serviceFeesApi"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import useDeleteServiceFee from "@/features/services/useDeleteServiceFee"

interface ServiceStates {
  priceValue: string
  discountValue: string
  totalPriceAfterDiscountValue: string
  hasReturnedValue: boolean
  checked: boolean
  open: boolean
  deleteOpen: ServiceFee | null
}

type PriceAction = {
  type: "price"
  payload: string
}

type DiscountAction = {
  type: "discount"
  payload: string
}
type TotalPriceAction = {
  type: "total-price"
  payload: string
}

type HasReturnedAction = {
  type: "has-returned"
}

type Checked = {
  type: "checked"
}

type Open = {
  type: "open"
}

type DeleteOpen = {
  type: "delete-open"
  payload: ServiceFee | null
}

type Reset = {
  type: "reset"
}
const initalState = {
  priceValue: "",
  discountValue: "",
  totalPriceAfterDiscountValue: "",
  hasReturnedValue: false,
  checked: false,
  open: false,
  deleteOpen: null,
}

type Action =
  | PriceAction
  | DiscountAction
  | TotalPriceAction
  | HasReturnedAction
  | Checked
  | Open
  | DeleteOpen
  | Reset

function reducer(state: ServiceStates, action: Action) {
  switch (action.type) {
    case "price":
      return { ...state, priceValue: action.payload }

    case "discount":
      return { ...state, discountValue: action.payload }

    case "total-price":
      return { ...state, totalPriceAfterDiscountValue: action.payload }

    case "open":
      return { ...state, open: !state.open }

    case "delete-open":
      return { ...state, deleteOpen: action.payload }

    case "checked":
      return { ...state, checked: !state.checked, hasReturnedValue: false }

    case "has-returned":
      return { ...state, hasReturnedValue: !state.hasReturnedValue }

    case "reset":
      return {
        ...state,
        priceValue: "",
        discountValue: "",
        totalPriceAfterDiscountValue: "",
        hasReturnedValue: false,
        checked: false,
        deleteOpen: null,
      }
  }
}

function ServiceFeesDialog({
  isAdmin,
  service,
  categories,
  total,
}: {
  isAdmin: boolean
  service: Service
  categories: Category[]
  total: number
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
  ] = useReducer(reducer, initalState)

  const pathname = useLocation().pathname
  const navigate = useNavigate()
  const [searchParam] = useSearchParams()
  const serviceTaxRate = service.taxRate
  let servicesArr = service.serviceFees

  servicesArr = servicesArr.filter((service) => {
    let filterValue = true
    if (checked)
      filterValue = filterValue && service.isReturned === hasReturnedValue

    if (priceValue !== "" && !isNaN(Number(priceValue)))
      filterValue = filterValue && service.price === Number(priceValue)

    if (discountValue !== "" && !isNaN(Number(discountValue)))
      filterValue = filterValue && service.discount === Number(discountValue)

    if (
      totalPriceAfterDiscountValue !== "" &&
      !isNaN(Number(totalPriceAfterDiscountValue))
    )
      filterValue =
        filterValue &&
        Math.ceil(
          service.totalPriceAfterDiscount +
            service.totalPriceAfterDiscount * serviceTaxRate
        ) === Number(totalPriceAfterDiscountValue)

    return filterValue
  })

  const fees = servicesArr.filter((serivce) => !serivce.isReturned)
  const returnedFees = servicesArr.filter((serivce) => serivce.isReturned)

  function handleOpenEdit(filter: string) {
    const params = new URLSearchParams(searchParam)
    params.set("editFee", filter)
    navigate(`${pathname}?${params.toString()}`)
  }

  function handleOpenChange() {
    dispatch({ type: "reset" })
    dispatch({ type: "open" })
  }

  const totals = useMemo(() => {
    return fees.reduce(
      (acc, item) => {
        acc.totalDiscount += item.discount
        acc.totalPriceBeforeDiscount += item.price
        acc.totalPrice += item.totalPriceAfterDiscount
        return acc
      },
      {
        totalPriceBeforeDiscount: 0,
        totalDiscount: 0,
        totalPrice: 0,
        serviceTaxRate,
      }
    )
  }, [fees])

  const totalReturns = useMemo(() => {
    return returnedFees.reduce(
      (acc, item) => {
        acc.totalDiscount += item.discount
        acc.totalPriceBeforeDiscount += item.price
        acc.totalPrice += item.totalPriceAfterDiscount
        return acc
      },
      { totalPriceBeforeDiscount: 0, totalDiscount: 0, totalPrice: 0 }
    )
  }, [returnedFees])

  if (!service.serviceFees.length)
    return (
      <TooltipProvider delayDuration={500}>
        <Tooltip>
          <TooltipTrigger>
            <span className="pointer-events-none inline-flex h-6 items-center justify-center rounded-md border border-input bg-background px-2 py-3 text-xs font-medium whitespace-nowrap opacity-50 shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none">
              Show
            </span>
          </TooltipTrigger>
          <TooltipContent>No services were preformed.</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

  return (
    <div onClick={(e) => e.stopPropagation()} className="w-fit">
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <Button
          onClick={handleOpenChange}
          size="sm"
          className="h-6 px-2 py-3 text-xs"
          variant="outline"
        >
          Show
        </Button>

        <DialogContent className="flex max-h-[81vh] !max-w-[900px] flex-col overflow-y-auto !rounded-none border-none p-4 !pb-0 sm:p-6 lg:!rounded-lg">
          <DialogHeader className="invisible hidden">
            <DialogTitle>{`'s phome numbers`}</DialogTitle>
            <DialogDescription className="hidden">
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </DialogDescription>
          </DialogHeader>

          {/* <main className="  gap-6  flex flex-col max-h-[90%]  h-full relative   "> */}

          <Accordion type="single" collapsible>
            <AccordionItem value="item-1" className="border-none">
              <div className="relative mx-auto w-[98%]">
                <AccordionTrigger className="mb-1 flex gap-1 rounded-full bg-secondary/50 px-3 py-2 text-[.7rem] dark:bg-card/20">
                  Filters
                </AccordionTrigger>
              </div>

              <AccordionContent className="pb-0">
                <div className="flex flex-wrap justify-center gap-2 rounded-md bg-secondary/50 p-2 text-sm xs:gap-3 sm:p-3 dark:bg-card/20">
                  {/* <div className=" flex  flex-col sm:flex-row items-center  gap-3 "> */}
                  <div className="mb-auto w-[48%] sm:w-[32%]">
                    <label className="text-xs" htmlFor="price">
                      Price
                    </label>
                    <Input
                      id="price"
                      placeholder="Price.."
                      className="mt-2"
                      autoFocus
                      value={priceValue}
                      onChange={(e) =>
                        dispatch({ type: "price", payload: e.target.value })
                      }
                    />
                  </div>
                  <div className="mb-auto w-[48%] sm:w-[32%]">
                    <label className="text-xs" htmlFor="discount">
                      Discount
                    </label>
                    <Input
                      id="discount"
                      placeholder="Discount.."
                      className="mt-2"
                      value={discountValue}
                      onChange={(e) =>
                        dispatch({ type: "discount", payload: e.target.value })
                      }
                    />
                  </div>

                  <div className="mb-auto w-[48%] !space-y-2 sm:w-[32%]">
                    <label className="text-xs" htmlFor="grand-total">
                      Grand total
                    </label>
                    <Input
                      id="grand-total"
                      placeholder="Grand total.."
                      className="mt-2"
                      value={totalPriceAfterDiscountValue}
                      onChange={(e) =>
                        dispatch({
                          type: "total-price",
                          payload: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="flex flex-1 items-center justify-end space-x-2">
                    <Switch
                      id="airplane-mode"
                      checked={hasReturnedValue}
                      // onChange={() => setHasReturnedValue((is) => !is)}
                      onClick={() => dispatch({ type: "has-returned" })}
                      disabled={!checked}
                    />
                    <Label className="text-xs" htmlFor="airplane-mode">
                      Has it returned
                    </Label>
                    <Checkbox
                      checked={checked}
                      onClick={() => {
                        //   if (hasReturnedValue) setHasReturnedValue(false);
                        //   setChecked((is) => !is);
                        dispatch({ type: "checked" })
                      }}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="space-y-4 pb-1 sm:flex-1 sm:overflow-y-auto sm:px-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold whitespace-nowrap">
                <span className="text-primary"> {servicesArr.length}</span>{" "}
                Service Fees.
              </h2>
              <ServiceDiaDetails service={service} isAdmin={isAdmin} />
            </div>

            {/* FEES --------------------------------------------------------------- FEES */}

            {fees.length ? (
              <ul className="space-y-4">
                {fees.map((serviceFee, i) => (
                  <FeesItem
                    key={i}
                    serviceTaxRate={serviceTaxRate}
                    isAdmin={isAdmin}
                    serviceFee={serviceFee}
                    dispatch={dispatch}
                    handleOpenEdit={handleOpenEdit}
                    // category={
                    //   categories.find((cat) => cat.id === serviceFee.categoryId)
                    //     ?.name || ""
                    // }
                  />
                ))}
              </ul>
            ) : hasReturnedValue ? null : (
              <div className="flex items-center justify-center gap-2 py-3">
                {" "}
                <HandPlatter size={30} className="text-primary" /> No service
                Fees.
              </div>
            )}
            {/* FEES --------------------------------------------------------------- FEES */}

            {returnedFees.length ? (
              <ul className="space-y-4 rounded-xl border p-3">
                <h2 className="text-xl font-semibold whitespace-nowrap">
                  <span className="text-destructive">
                    {" "}
                    {returnedFees.length}
                  </span>{" "}
                  Returned Services.
                </h2>
                {returnedFees.map((returnedFees, i) => (
                  <FeesItem
                    key={i}
                    returned
                    serviceTaxRate={serviceTaxRate}
                    isAdmin={isAdmin}
                    serviceFee={returnedFees}
                    dispatch={dispatch}
                    handleOpenEdit={handleOpenEdit}
                    // category={
                    //   categories.find(
                    //     (cat) => cat.id === returnedFees.categoryId
                    //   )?.name || ""
                    // }
                  />
                ))}
                <Accordion type="single" collapsible>
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Total returns:</AccordionTrigger>
                    <AccordionContent className="flex flex-wrap items-center gap-x-2 gap-y-2 text-xs">
                      <div className="flex items-center justify-center gap-1 rounded-full bg-chart-1 px-2 py-1 text-[.7rem] transition-opacity hover:opacity-90">
                        Sub Total:
                        <span>
                          {formatCurrency(
                            totalReturns.totalPriceBeforeDiscount
                          )}
                        </span>
                      </div>

                      <div className="flex items-center justify-center gap-1 rounded-full bg-chart-2 px-2 py-1 text-[.7rem] transition-opacity hover:opacity-90">
                        Total Discount:{" "}
                        <span>
                          {formatCurrency(totalReturns.totalDiscount)}
                        </span>
                      </div>

                      <div className="flex items-center justify-center gap-1 rounded-full bg-chart-4 px-2 py-1 text-[.7rem] transition-opacity hover:opacity-90">
                        Net Revenue:{" "}
                        <span>{formatCurrency(totalReturns.totalPrice)}</span>
                      </div>
                      <div className="flex items-center justify-center gap-1 rounded-full bg-chart-1 px-2 py-1 text-[.7rem] transition-opacity hover:opacity-90">
                        Tax Rate:{" "}
                        <span>{(serviceTaxRate * 100).toFixed()}%</span>
                      </div>
                      <div className="flex items-center justify-center gap-1 rounded-full bg-chart-5 px-2 py-1 text-[.7rem] transition-opacity hover:opacity-90">
                        Grand Total:{" "}
                        <span>
                          {formatCurrency(
                            totalReturns.totalPrice +
                              totalReturns.totalPrice * serviceTaxRate
                          )}
                        </span>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </ul>
            ) : null}
          </div>
          {/* </main> */}
          <div className="sticky bottom-0 left-0 space-y-3 bg-popover pt-4 pb-6 sm:pt-0">
            <DialogClose asChild>
              <Button size="sm" className="w-full" variant="secondary">
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
        // serviceId={service.id}
        total={total}
        handleClose={() => {
          dispatch({ type: "delete-open", payload: null })
          dispatch({ type: "open" })
        }}
      />
    </div>
  )
}

function DeleteFee({
  deleteOpen,
  fee,
  handleClose,
  // serviceId,
  total,
}: {
  deleteOpen: boolean
  fee: ServiceFee | null
  handleClose: () => void
  // serviceId: number
  total: number
}) {
  const { mutate: deleteServiceFee, isPending: isDeleting } =
    useDeleteServiceFee()

  return (
    <Dialog open={deleteOpen} onOpenChange={handleClose}>
      <DialogContent className="border-none sm:max-w-[425px]">
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
            onClick={() => {
              if (fee) {
                deleteServiceFee(fee.id)
                handleClose()
              }
            }}
          >
            {isDeleting ? <Spinner className="h-full" /> : "Confrim"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function FeesItem({
  returned,
  isAdmin,
  serviceFee,
  // category,
  serviceTaxRate,
  handleOpenEdit,
  dispatch,
}: {
  returned?: boolean
  isAdmin: boolean
  serviceFee: ServiceFee
  // category: string
  serviceTaxRate: number
  handleOpenEdit: (filter: string) => void
  dispatch: React.Dispatch<Action>
}) {
  return (
    <li
      className={cn(
        "inline-flex w-full items-center justify-center rounded-md border border-input bg-secondary px-4 py-2 text-sm font-medium whitespace-nowrap shadow-sm transition-all hover:bg-accent hover:text-accent-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
        {
          "border-none bg-accent hover:bg-muted-foreground/30 dark:bg-card/25 dark:hover:bg-card/10":
            returned,
        }
      )}
    >
      <div
        // href={`/serviceFees/${serviceFee.serviceFeeId}`}
        className="flex h-fit max-w-full flex-wrap items-center !justify-start gap-x-6 gap-y-3 text-sm font-semibold !text-primary"
      >
        <div>
          {" "}
          Category:{" "}
          <span className="text-xs text-muted-foreground">
            {serviceFee.category.name}
          </span>
        </div>
        <div className=" ">
          Price:{" "}
          <span className="text-xs text-muted-foreground">{` ${formatCurrency(
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
          Subtotal:{" "}
          <span className="text-xs break-all whitespace-normal text-muted-foreground">{` ${formatCurrency(
            serviceFee.totalPriceAfterDiscount
          )}`}</span>
        </div>
        <div>
          Tax:{" "}
          <span className="text-xs break-all whitespace-normal text-muted-foreground">
            {Math.floor(serviceTaxRate * 100)}%
          </span>
        </div>
        <div>
          Grand total:{" "}
          <span className="text-xs break-all whitespace-normal text-muted-foreground">{` ${formatCurrency(
            Math.ceil(
              serviceFee.totalPriceAfterDiscount +
                serviceFee.totalPriceAfterDiscount * serviceTaxRate
            )
          )}`}</span>
        </div>
        {isAdmin && (
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              onClick={(e) => {
                e.preventDefault()
                handleOpenEdit(String(serviceFee.id))
                dispatch({ type: "open" })
              }}
              className="h-8 w-8 p-0"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              onClick={(e) => {
                e.preventDefault()
                dispatch({ type: "open" })
                dispatch({
                  type: "delete-open",
                  payload: serviceFee,
                })
                // setDeleteOpen(serviceFee.id);
                //   setOpen(false);
              }}
              variant="destructive"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <PackageMinus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </li>
  )
}

interface SummaryProps {
  totalPriceBeforeDiscount: number
  totalDiscount: number
  totalPrice: number
  serviceTaxRate: number
}
function Summary({
  totals,
  TotalNumFees,
}: {
  totals: SummaryProps
  TotalNumFees: number
}) {
  return (
    <TagCarousel>
      <TooltipProvider delayDuration={500}>
        <Tooltip>
          <TooltipTrigger className="hover:cursor-default">
            {" "}
            <div className="relative h-fit w-fit text-xs">
              <div className="embla__slide">
                {" "}
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-chart-5">
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

      <div className="relative">
        <div className="embla__slide">
          {" "}
          <div className="flex items-center justify-center gap-1 rounded-full bg-chart-1 px-2 py-1 text-[.7rem] text-nowrap break-keep transition-opacity hover:opacity-90">
            Total Price:
            <span>{formatCurrency(totals.totalPriceBeforeDiscount)}</span>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="embla__slide">
          {" "}
          <div className="flex items-center justify-center gap-1 rounded-full bg-chart-2 px-2 py-1 text-[.7rem] text-nowrap break-keep transition-opacity hover:opacity-90">
            Total discount: <span>{formatCurrency(totals.totalDiscount)}</span>
          </div>
        </div>
      </div>
      <div className="relative">
        <div className="embla__slide">
          {" "}
          <div className="flex items-center justify-center gap-1 rounded-full bg-chart-4 px-2 py-1 text-[.7rem] text-nowrap break-keep transition-opacity hover:opacity-90">
            Subtotal: <span>{formatCurrency(totals.totalPrice)}</span>
          </div>
        </div>
      </div>
      <div className="relative">
        <div className="embla__slide">
          {" "}
          <div className="flex items-center justify-center gap-1 rounded-full bg-chart-1 px-2 py-1 text-[.7rem] text-nowrap break-keep transition-opacity hover:opacity-90">
            Tax rate: <span>{Math.floor(totals.serviceTaxRate * 100)}%</span>
          </div>
        </div>
      </div>
      <div className="relative">
        <div className="embla__slide">
          {" "}
          <div className="flex items-center justify-center gap-1 rounded-full bg-chart-5 px-2 py-1 text-[.7rem] text-nowrap transition-opacity hover:opacity-90">
            Grand total:{" "}
            <span>
              {formatCurrency(
                Math.ceil(
                  totals.totalPrice + totals.totalPrice * totals.serviceTaxRate
                )
              )}
            </span>
          </div>
        </div>
      </div>
    </TagCarousel>
  )
}

export default ServiceFeesDialog
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
