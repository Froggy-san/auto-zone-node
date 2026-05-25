import React, { type SetStateAction, useEffect, useMemo, useState } from "react"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

import {
  ArrowDownToLine,
  Check,
  CircleUser,
  Download,
  Ellipsis,
  HandPlatter,
  LoaderCircle,
  NotepadTextDashed,
  PackageMinus,
  PackagePlus,
  Pencil,
  ReceiptText,
  Replace,
  Trash2,
  UserRoundMinus,
} from "lucide-react"

import Spinner from "@/components/Spinner"
import { FaArrowUpWideShort } from "react-icons/fa6"

// import StatusBadge from "../status-badge";
// const StatusBadge = dynamic(() => import("../status-badge"), {
//   loading: () => <Spinner className="h-fit w-fit" size={12} />,
//   ssr: false,
// })
import ServiceFeesDialog from "./service-Fee-dialog"
import ProductSoldDialog from "./products-sold-dialog"
import CarDialog from "./car-dialog"
import ClientDialog from "./client-dialog"
// import {
//   deleteServiceAction,
//   editServiceAction,
// } from "@lib/actions/serviceActions"
import EditServiceForm from "./edit-service-form"
import { formatCurrency } from "@/lib/client-helpers"
import NoteDialog from "@/components/garage/note-dialog"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
// import StatsRow from "./stats-row"
// import SearchDialog from "./search-dialog"

import downloadAsPdf from "@/lib/services/download-pdf"
import ServiceSelectControls from "./service-select-controls"
import { useQueryClient } from "@tanstack/react-query"
import { Priority } from "@/components/priority-select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import type { Car, Category, Service, ServiceStatus, User } from "@/types"
import StatusBadge from "../status-badge"
import { useLocation, useNavigate, useSearchParams } from "react-router"
import { updateService } from "@/services/servicesApi"
import { toast } from "sonner"
import SearchDialog from "./search-dialog"
interface Props {
  isClientPage?: boolean
  isAdmin: boolean
  categories: Category[]
  // cars: Car[]
  // clients: User[]
  status: ServiceStatus[]
  currPage: string
  services: Service[]
  className?: string
  dateFrom: string
  dateTo: string
  clientId: string
  carId: string
  serviceStatusId: string
  minPrice: string
  maxPrice: string
  pageNumber: string
}

const ServiceTable = ({
  isClientPage,
  isAdmin = false,
  categories,
  services,
  currPage,
  // cars,
  // clients,
  dateFrom,
  dateTo,
  carId,
  clientId,
  serviceStatusId,
  minPrice,
  maxPrice,
  status,
  pageNumber,
  className,
}: Props) => {
  const [loadingIds, setLoadingIds] = useState<string[]>([])
  const [selected, setSelected] = useState<string[]>([])
  if (!services)
    return <p>Something went wrong while getting the services&apos;s data</p>
  const currPageSize = services.length

  const nonCanceledService = services.filter(
    (serv) => serv.serviceStatus.name != "Canceled"
  )

  const fees = nonCanceledService
    .flatMap((service) => service.serviceFees)
    .filter((fee) => !fee.isReturned)
  const soldProducts = nonCanceledService
    .flatMap((service) => service.productsSold)
    .filter((pro) => !pro.isReturned)

  const totalFees = useMemo(() => {
    return fees.reduce((acc, item) => {
      acc += item.totalPriceAfterDiscount

      return acc
    }, 0)
  }, [fees])

  const totalSoldProducts = useMemo(() => {
    return soldProducts.reduce((acc, item) => {
      acc += item.totalPriceAfterDiscount

      return acc
    }, 0)
  }, [soldProducts])

  const totals = totalFees + totalSoldProducts
  return (
    <>
      <div className="flex flex-col-reverse items-center gap-x-2 gap-y-5 break-keep sm:flex-row">
        <ServiceSelectControls
          isAdmin={isAdmin}
          selected={selected}
          setSelected={setSelected}
          currentPage={Number(currPage)}
          pageSize={services.length}
          setLoadingIds={setLoadingIds}
        />

        <SearchDialog
          isAdmin={isAdmin}
          // cars={cars}
          // clients={clients}
          status={status || []}
          carId={carId}
          clientId={clientId}
          dateTo={dateTo}
          dateFrom={dateFrom}
          serviceStatusId={serviceStatusId}
          maxPrice={maxPrice}
          minPrice={minPrice}
          currPage={pageNumber}
        />
      </div>
      <div className="mt-10 rounded-3xl border p-3 shadow-lg">
        <Table className="min-w-[800px]">
          <TableCaption>
            {services.length
              ? "A list of all service receipts."
              : "No receipts"}
          </TableCaption>

          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[20px]">ID</TableHead>
              <TableHead>DATE</TableHead>
              <TableHead>CLIENT</TableHead>
              <TableHead>CAR</TableHead>
              <TableHead>STATUS</TableHead>
              <TableHead>FEES</TableHead>
              <TableHead className="whitespace-nowrap">SOLD PRODUCTS</TableHead>
              <TableHead className="">PRIORITY</TableHead>
              <TableHead className="text-right">TOTAL PRICE</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services && services.length
              ? services.map((service) => (
                  <Row
                    key={service.id}
                    isLoading={loadingIds.includes(service._id)}
                    selected={selected}
                    setSelected={setSelected}
                    isClientPage={isClientPage}
                    isAdmin={isAdmin}
                    categories={categories}
                    status={status}
                    service={service}
                    // cars={cars}
                    // clients={clients}
                    currPage={currPage}
                    currPageSize={currPageSize}
                  />
                ))
              : null}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={5}>Page-Total:</TableCell>

              <TableCell className="max-w-[120px] min-w-[100px]">
                {formatCurrency(totalFees)}
              </TableCell>

              <TableCell className="max-w-[120px] min-w-[100px]">
                {formatCurrency(totalSoldProducts)}
              </TableCell>

              <TableCell
                colSpan={3}
                className="max-w-[120px] min-w-[100px] text-right"
              >
                {formatCurrency(totals)}
              </TableCell>
            </TableRow>
            {/* <StatsRow
              carId={carId}
              clientId={clientId}
              dateTo={dateTo}
              dateFrom={dateFrom}
              serviceStatusId={serviceStatusId}
              maxPrice={maxPrice}
              minPrice={minPrice}
            /> */}
          </TableFooter>
        </Table>
      </div>
    </>
  )
}

function Row({
  selected,
  setSelected,
  isClientPage,
  isAdmin,
  categories,
  status,
  // clients,
  // cars,
  service,
  currPage,
  currPageSize,
  isLoading: loading,
}: {
  isLoading: boolean
  selected: string[]
  setSelected: React.Dispatch<React.SetStateAction<string[]>>
  isClientPage?: boolean
  isAdmin: boolean
  categories: Category[]
  // clients: User[]
  // cars: Car[]
  status: ServiceStatus[]
  currPage: string
  service: Service
  currPageSize: number
}) {
  const total = useMemo(() => {
    const totalFees = service.serviceFees
      .filter((fee) => !fee.isReturned)
      .reduce((sum, curr) => {
        sum += curr.totalPriceAfterDiscount
        return sum
      }, 0)
    const totalSold = service.productsSold
      .filter((pro) => !pro.isReturned)
      .reduce((sum, curr) => {
        sum += curr.totalPriceAfterDiscount
        return sum
      }, 0)
    const total = totalSold + totalFees
    return total
  }, [service])
  const item = selected.some((item) => item === service.id)
  return (
    <>
      <TableRow
        onClick={() => {
          setSelected((selected) => {
            if (item) return selected.filter((item) => item !== service.id)
            return [...selected, service.id]
          })
        }}
        className={` ${item && "bg-accent/60 hover:bg-accent/40"}`}
      >
        <TableCell className="font-medium"> {service.id}</TableCell>

        <TableCell className="whitespace-nowrap">
          {String(service.createdAt)}
        </TableCell>

        <TableCell>
          <ClientDialog service={service} />
        </TableCell>

        <TableCell>
          <CarDialog service={service} isAdmin={isAdmin} />
        </TableCell>

        <TableCell>
          <StatusBadge status={service.serviceStatus} />
        </TableCell>

        <TableCell>
          <ServiceFeesDialog
            isAdmin={isAdmin}
            categories={categories}
            service={service}
            total={total}
          />
        </TableCell>

        <TableCell className="min-w-[100px]">
          <ProductSoldDialog
            isAdmin={isAdmin}
            service={service}
            total={total}
          />
        </TableCell>
        <TableCell className="relative">
          <Priority priority={service.priority} />
        </TableCell>
        <TableCell className="text-right font-bold">
          <div className="flex items-center justify-end gap-3">
            <span className={` ${total === 0 && "text-muted-foreground"}`}>
              {" "}
              {formatCurrency(total)}{" "}
            </span>
            <TableActions
              loading={loading}
              isClientPage={isClientPage}
              isAdmin={isAdmin}
              // cars={cars}
              // clients={clients}
              status={status}
              service={service}
              currPage={currPage}
              currPageSize={currPageSize}
            />
          </div>
        </TableCell>

        {/* <TableCell>
          {" "}
          <div className=" flex items-center gap-2 justify-end">

       
          </div>
        </TableCell> */}
      </TableRow>
      {/* <DeleteDialog
        currPage={currPage}
        pageSize={currPageSize}
        service={service}
        isDeleting={isLoading}
        setOpen={setDeleteOpen}
        setMainDialong={setOpen}
        setIsDeleting={setIsLoading}
        open={typeof deleteOpen === "number"}
        productBoughtId={deleteOpen}
        handleClose={handleClose}
      /> */}
      {/* <ProductsDialog
        service={service}
        open={open}
        handleClose={handleClose}
        setOpen={setOpen}
        setDeleteOpen={setDeleteOpen}
      /> */}
    </>
  )
}

function TableActions({
  loading,
  isClientPage,
  isAdmin,
  status,
  service,
  currPageSize,
  currPage,
  // cars,
  // clients,
}: {
  loading: boolean
  isClientPage?: boolean
  isAdmin?: boolean
  // cars: Car[]
  // clients: User[]
  status: ServiceStatus[]
  currPage: string
  service: Service
  currPageSize: number
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [open, setOpen] = useState<"delete" | "edit" | "note" | "">("")

  // const [open, setOpen] = useState(false);
  // const [chosenStatus, setChosenStatus] = useState<number>(service.status.id);
  const [isLoading, setIsLoading] = useState(false)

  const [searchParam] = useSearchParams()
  const pathname = useLocation().pathname
  const navigate = useNavigate()
  const params = new URLSearchParams(searchParam)
  const currLoading = isLoading || loading

  const handleChangePriority = async (priority: "low" | "medium" | "high") => {
    setIsLoading(true)
    try {
      await updateService(
        {
          priority,
        },
        service.id
      )

      setIsLoading(false)
      // handleClose();
      toast.success(`Updated service's priority to ${priority}`)
    } catch (error: any) {
      setIsLoading(false)
      toast.error(`Failed to update service's priority to ${priority}`)
    }
  }

  const handleChangeStatus = async (id: string) => {
    setIsLoading(true)
    try {
      await updateService(
        {
          serviceStatus: id,
        },
        service.id
      )

      setIsLoading(false)
      // handleClose();
      toast.success(`Updated service's status`)
    } catch (error: any) {
      setIsLoading(false)
      toast.error("Failed to update service status")
    }
  }

  const handlePdf = async () => {
    setIsLoading(true)
    try {
      await downloadAsPdf([service.id])
      toast.success("PDF downloaded")
    } catch (error: any) {
      console.error(error)

      toast.error("Failed to download PDF")
    } finally {
      setIsLoading(false)
    }
  }

  // const handlePdf = async () => {
  //   setIsLoading(true);
  //   try {
  //     const response = await fetch(`/api/pdf?id=${service.id}`);

  //     if (!response.ok) {
  //       const error = await response.json();
  //       console.error(error.error);
  //       setIsLoading(false);
  //       toast({
  //         variant: "destructive",
  //         title: "Failed to download.",
  //         description: <ErorrToastDescription error={error.error} />,
  //       });
  //       return;
  //     }

  //     const blob = await response.blob();
  //     const url = window.URL.createObjectURL(blob);
  //     const a = document.createElement("a");
  //     a.href = url;
  //     a.download = `service_receipt_${service.id}.pdf`;
  //     document.body.appendChild(a);
  //     a.click();
  //     a.remove();
  //     window.URL.revokeObjectURL(url);
  //     setIsLoading(false);
  //     toast({
  //       className: "bg-primary  text-primary-foreground",
  //       title: `Done.`,
  //       description: (
  //         <SuccessToastDescription
  //           message={`Receipt data is ready to be downloaded as a PDF.`}
  //         />
  //       ),
  //     });
  //   } catch (error: any) {
  //     console.error(error);
  //     setIsLoading(false);
  //     toast({
  //       variant: "destructive",
  //       title: "Failed to download.",
  //       description: <ErorrToastDescription error={error.message} />,
  //     });
  //   }
  // };

  if (currLoading)
    return (
      <Spinner
        className="mx-1 flex h-4 w-4 items-center justify-center"
        size={15}
      />
    )

  return (
    <div onClick={(e) => e.stopPropagation()} className="w-fit">
      {isAdmin ? (
        <>
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-6 w-6 p-0">
                <Ellipsis className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mr-5 min-w-[200px]">
              {/* <DropdownMenuLabel>My Account</DropdownMenuLabel> */}
              {/* <DropdownMenuSeparator /> */}
              <DropdownMenuItem
                className="gap-2"
                onClick={() => {
                  setOpen("edit")
                }}
              >
                <ReceiptText className="h-4 w-4" /> Edit service receipt
              </DropdownMenuItem>

              <DropdownMenuItem
                disabled={!service.note}
                className="gap-2"
                onClick={() => {
                  setOpen("note")
                }}
              >
                <NotepadTextDashed className="h-4 w-4" /> View receipt note
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2"
                onClick={() => {
                  params.set("addFeeId", service.id.toString())
                  navigate(`${pathname}?${params.toString()}`)
                }}
              >
                <HandPlatter className="h-4 w-4" /> Add more service fees{" "}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2"
                onClick={() => {
                  const params = new URLSearchParams(searchParam)
                  params.set("addSoldId", service.id.toString())
                  navigate(`${pathname}?${params.toString()}`)
                }}
              >
                <PackagePlus className="h-4 w-4" /> Add more sold products
              </DropdownMenuItem>
              <DropdownMenuSub
              // disabled={isLoading}
              // className=" gap-2"
              // onClick={() => {
              //   setOpen("delete");
              // }}
              >
                <DropdownMenuSubTrigger className="gap-2">
                  {" "}
                  <FaArrowUpWideShort /> Change priority
                </DropdownMenuSubTrigger>

                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="max-h-[170px] overflow-y-auto">
                    <DropdownMenuItem
                      key="high"
                      className="justify-between gap-2"
                      onClick={async () => {
                        if (service.priority?.toLocaleLowerCase() === "high")
                          return
                        await handleChangePriority("high")
                      }}
                    >
                      <Priority priority="high" />
                      {service.priority?.toLocaleLowerCase() == "high" && (
                        <Check className="h-3 w-3" />
                      )}
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      key="medium"
                      className="justify-between gap-2"
                      onClick={async () => {
                        if (service.priority?.toLocaleLowerCase() === "medium")
                          return
                        await handleChangePriority("medium")
                      }}
                    >
                      <Priority priority="medium" />
                      {service.priority?.toLocaleLowerCase() == "medium" && (
                        <Check className="h-3 w-3" />
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      key="low"
                      className="justify-between gap-2"
                      onClick={async () => {
                        if (service.priority?.toLocaleLowerCase() === "low")
                          return
                        await handleChangePriority("low")
                      }}
                    >
                      <Priority priority="low" />
                      {(service.priority?.toLocaleLowerCase() == "low" ||
                        !service.priority) && <Check className="h-3 w-3" />}
                    </DropdownMenuItem>

                    {/* <DropdownMenuItem
                      key="normal"
                      className=" gap-2 justify-between "
                      onClick={async () => {
                        if (!service.priority) return;
                        await handleChangePriority("");
                      }}
                    >
                      <Priority priority="low" />
                      {!service.priority && <Check className=" w-3 h-3" />}
                    </DropdownMenuItem> */}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuSub
              // disabled={isLoading}
              // className=" gap-2"
              // onClick={() => {
              //   setOpen("delete");
              // }}
              >
                <DropdownMenuSubTrigger className="gap-2">
                  {" "}
                  <Replace className="h-4 w-4" /> Change status
                </DropdownMenuSubTrigger>

                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="max-h-[170px] overflow-y-auto">
                    {status.map((status, i) => (
                      <DropdownMenuItem
                        key={i}
                        className="justify-between gap-2"
                        onClick={async () => {
                          // setChosenStatus(status.id)
                          if (status.id === service.serviceStatus._id) return
                          await handleChangeStatus(status.id)
                        }}
                      >
                        <StatusBadge
                          disableToolTip
                          status={status}
                          className="py-[.1rem]"
                        />
                        {service.serviceStatus._id === status.id && (
                          <Check className="h-3 w-3" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              {/* <DropdownMenuSeparator /> */}
              <DropdownMenuItem
                className="gap-2"
                onClick={async () => {
                  await handlePdf()
                }}
              >
                <ArrowDownToLine className="h-4 w-4" />
                Download as PDF
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2 !text-red-900 hover:!bg-destructive/70 dark:!text-red-300"
                onClick={() => {
                  setOpen("delete")
                }}
              >
                <Trash2 className="h-4 w-4" />
                Delete service receipt
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* <ClientForm
        open={open === "edit"}
        handleClose={handleClose}
        client={client}
        />  */}

          <EditServiceForm
            // cars={cars}
            // clients={clients}
            open={open === "edit"}
            setIsLoading={setIsLoading}
            setOpen={setOpen}
            status={status}
            service={service}
          />

          <DeleteService
            currPage={currPage}
            pageSize={currPageSize}
            service={service}
            isDeleting={currLoading}
            setIsDeleting={setIsLoading}
            open={open === "delete"}
            handleClose={() => setOpen("")}
          />

          <NoteDialog
            description={`Note related to a car with the plate number '${service.car.plateNumber}' belonging to '${service.user.username}', with a service date of '2024-11-06.'`}
            className="hidden"
            open={open === "note"}
            onOpenChange={() => setOpen("")}
            content={service.note}
          />

          {/* <EditReceipt
        open={open === "edit"}
        handleClose={handleClose}
        service={service}
        isDeleting={isLoading}
        setIsDeleting={setIsLoading}
      /> */}
        </>
      ) : (
        <TooltipProvider delayDuration={500}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 p-1"
                onClick={async () => await handlePdf()}
              >
                <Download className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Download as pdf</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}

function DeleteService({
  currPage,
  pageSize,
  open,
  handleClose,
  isDeleting,
  setIsDeleting,
  service,
}: {
  currPage: string
  open: boolean
  isDeleting: boolean
  setIsDeleting: React.Dispatch<SetStateAction<boolean>>
  handleClose: () => void
  service: Service
  pageSize: number
}) {
  const [checked, setChecked] = useState(true)

  const [searchParam] = useSearchParams()
  const navigate = useNavigate()
  const pathname = useLocation().pathname
  const queryClient = useQueryClient()

  function checkIfLastItem() {
    const params = new URLSearchParams(searchParam)
    if (pageSize === 1) {
      if (Number(currPage) === 1 && pageSize === 1) {
        params.delete("dateFrom")
        params.delete("dateTo")
        params.delete("clientId")
        params.delete("carId")
        params.delete("serviceStatusId")
        params.delete("minPrice")
        params.delete("maxPrice")
      }
      if (Number(currPage) > 1) {
        params.set("page", String(Number(currPage) - 1))
      }
      navigate(`${pathname}?${params.toString()}`)
    }
  }

  useEffect(() => {
    const body = document.querySelector("body")

    if (body) {
      body.style.pointerEvents = "auto"
    }
    return () => {
      if (body) body.style.pointerEvents = "auto"
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="border-none sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete service receipt.</DialogTitle>
          <DialogDescription>
            {`You are about to delete a receipt dated '${service.createdAt}', issued to the client '${service.user.username}', along with all its associated data.`}
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2">
          {" "}
          <Checkbox
            checked={checked}
            onClick={() => setChecked((c) => !c)}
            id="should-restock"
            name="should-restock"
          />
          <Label htmlFor="should-restock">
            Restock all the products deleted within the service
          </Label>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button onClick={handleClose} size="sm" variant="secondary">
            Cancel
          </Button>

          <Button
            disabled={isDeleting}
            variant="destructive"
            size="sm"
            onClick={async () => {
              setIsDeleting(true)
              try {
                const productsIds = Array.from(
                  new Set(service.productsSold.map((p) => p.product))
                )

                const productsToRestock = checked
                  ? productsIds.map((id) =>
                      service.productsSold
                        .filter((product) => product.product === id)
                        .reduce(
                          (acc, currPro) => {
                            acc.quantity += currPro.count
                            return acc
                          },
                          { id, quantity: 0 }
                        )
                    )
                  : undefined

                // const { error } = await deleteServiceAction(
                //   service.id.toString(),
                //   productsToRestock
                // )
                // if (error) throw new Error(error)
                checkIfLastItem()
                setIsDeleting(false)
                handleClose()
                queryClient.removeQueries({ queryKey: ["servicesStats"] })
                toast.success("Service has been deleted")
              } catch (error: any) {
                setIsDeleting(false)
                toast.error("Failed to delete service")
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

function DeleteDialog({
  currPage,
  pageSize,
  open,
  handleClose,
  isDeleting,
  setMainDialong,
  productBoughtId,
  setOpen,
  setIsDeleting,
  service,
}: {
  currPage: string
  open: boolean
  isDeleting: boolean
  setOpen: React.Dispatch<SetStateAction<number | null>>
  productBoughtId: number | null
  setMainDialong: React.Dispatch<SetStateAction<boolean>>
  setIsDeleting: React.Dispatch<SetStateAction<boolean>>
  handleClose: () => void
  service: Service
  pageSize: number
}) {
  //   const proTodelete = productBoughtId
  //     ? proBought.productsBought.find((pro) => pro.id === productBoughtId)
  //     : null;

  useEffect(() => {
    const body = document.querySelector("body")

    if (body) {
      body.style.pointerEvents = "auto"
    }
    return () => {
      if (body) body.style.pointerEvents = "auto"
    }
  }, [open])

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        handleClose()
        setOpen(null)
        setMainDialong(true)
      }}
    >
      <DialogContent className="border-none sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete service.</DialogTitle>
          <DialogDescription>
            {`You are about to delete a service receipt dated '${service.createdAt}', isussed to the cutomer '${service.user.username}', along with all it's related data.`}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose>
            Cancel
            {/* <Button size="sm" variant="secondary">
              Cancel
            </Button> */}
          </DialogClose>
          <Button
            disabled={isDeleting}
            variant="destructive"
            size="sm"
            onClick={async () => {
              try {
                setIsDeleting(true)
                // if (proTodelete)
                // await deleteServiceAction(service.id.toString())
                // checkIfLastItem();
                setIsDeleting(false)
                setOpen(null)
                setMainDialong(true)
                // handleClose();
                toast.success("service has been deleted")
              } catch (error: any) {
                toast.error("Failed to delete service")
              }
              setIsDeleting(false)
            }}
          >
            {isDeleting ? <Spinner className="h-full" /> : "Confrim"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ServiceTable
