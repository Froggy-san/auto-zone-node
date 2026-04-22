"use client";
import React, { SetStateAction, useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CarItem,
  Category,
  CategoryProps,
  ClientWithPhoneNumbers,
  Service,
  ServiceStatus,
} from "@lib/types";
import { Button } from "@components/ui/button";
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
} from "@/components/ui/dropdown-menu";
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
} from "lucide-react";
import { useToast } from "@hooks/use-toast";
import SuccessToastDescription, {
  ErorrToastDescription,
} from "@components/toast-items";
import Spinner from "@components/Spinner";
import { FaArrowUpWideShort } from "react-icons/fa6";

import { deleteClientByIdAction } from "@lib/actions/clientActions";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

// import StatusBadge from "../status-badge";
const StatusBadge = dynamic(() => import("../status-badge"), {
  loading: () => <Spinner className="  w-fit h-fit" size={12} />,
  ssr: false,
});
import ServiceFeesDialog from "./service-Fee-dialog";
import ProductSoldDialog from "./products-sold-dialog";
import CarDialog from "./car-dialog";
import ClientDialog from "./client-dialog";
import {
  deleteServiceAction,
  editServiceAction,
} from "@lib/actions/serviceActions";
import EditServiceForm from "./edit-service-form";
import { formatCurrency } from "@lib/client-helpers";
import NoteDialog from "@components/garage/note-dialog";
import dynamic from "next/dynamic";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@components/ui/tooltip";
import StatsRow from "./stats-row";
import SearchDialog from "./search-dialog";
import { AnimatePresence, motion } from "framer-motion";
import downloadAsPdf from "@lib/services/download-pdf";
import ServiceSelectControls from "./service-select-controls";
import { useQueryClient } from "@tanstack/react-query";
import { Priority } from "@components/priority-select";
import { Checkbox } from "@components/ui/checkbox";
import { Label } from "@components/ui/label";
interface Props {
  isClientPage?: boolean;
  isAdmin: boolean;
  categories: CategoryProps[];
  cars: CarItem[];
  clients: ClientWithPhoneNumbers[];
  status: ServiceStatus[];
  currPage: string;
  services: Service[];
  className?: string;
  dateFrom: string;
  dateTo: string;
  clientId: string;
  carId: string;
  serviceStatusId: string;
  minPrice: string;
  maxPrice: string;
  pageNumber: string;
}

const ServiceTable = ({
  isClientPage,
  isAdmin = false,
  categories,
  services,
  currPage,
  cars,
  clients,
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
  const [loadingIds, setLoadingIds] = useState<number[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  if (!services)
    return <p>Something went wrong while getting the services&apos;s data</p>;
  const currPageSize = services.length;

  const nonCanceledService = services.filter(
    (serv) => serv.serviceStatuses.name != "Canceled",
  );

  const fees = nonCanceledService
    .flatMap((service) => service.servicesFee)
    .filter((fee) => !fee.isReturned);
  const soldProducts = nonCanceledService
    .flatMap((service) => service.productsToSell)
    .filter((pro) => !pro.isReturned);

  const totalFees = fees.reduce((acc, item) => {
    acc += item.totalPriceAfterDiscount;

    return acc;
  }, 0);

  const totalSoldProducts = soldProducts.reduce((acc, item) => {
    acc += item.totalPriceAfterDiscount;

    return acc;
  }, 0);

  const totals = totalFees + totalSoldProducts;
  return (
    <>
      <div className=" flex    break-keep flex-col-reverse sm:flex-row gap-x-2 gap-y-5 items-center ">
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
          cars={cars}
          clients={clients}
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
      <div className="mt-10 p-3 border rounded-3xl shadow-lg ">
        <Table className=" min-w-[800px]">
          <TableCaption>
            {services.length
              ? "A list of all service receipts."
              : "No receipts"}
          </TableCaption>

          <TableHeader>
            <TableRow>
              <TableHead className=" min-w-[20px]">ID</TableHead>
              <TableHead>DATE</TableHead>
              <TableHead>CLIENT</TableHead>
              <TableHead>CAR</TableHead>
              <TableHead>STATUS</TableHead>
              <TableHead>FEES</TableHead>
              <TableHead className=" whitespace-nowrap">
                SOLD PRODUCTS
              </TableHead>
              <TableHead className="">PRIORITY</TableHead>
              <TableHead className="text-right">TOTAL PRICE</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services && services.length
              ? services.map((service) => (
                  <Row
                    key={service.id}
                    isLoading={loadingIds.includes(service.id)}
                    selected={selected}
                    setSelected={setSelected}
                    isClientPage={isClientPage}
                    isAdmin={isAdmin}
                    categories={categories}
                    status={status}
                    service={service}
                    cars={cars}
                    clients={clients}
                    currPage={currPage}
                    currPageSize={currPageSize}
                  />
                ))
              : null}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={5}>Page-Total:</TableCell>

              <TableCell className="   min-w-[100px] max-w-[120px] ">
                {formatCurrency(totalFees)}
              </TableCell>

              <TableCell className="   min-w-[100px] max-w-[120px] ">
                {formatCurrency(totalSoldProducts)}
              </TableCell>

              <TableCell
                colSpan={3}
                className=" text-right   min-w-[100px] max-w-[120px] "
              >
                {formatCurrency(totals)}
              </TableCell>
            </TableRow>
            <StatsRow
              carId={carId}
              clientId={clientId}
              dateTo={dateTo}
              dateFrom={dateFrom}
              serviceStatusId={serviceStatusId}
              maxPrice={maxPrice}
              minPrice={minPrice}
            />
          </TableFooter>
        </Table>
      </div>
    </>
  );
};

function Row({
  selected,
  setSelected,
  isClientPage,
  isAdmin,
  categories,
  status,
  clients,
  cars,
  service,
  currPage,
  currPageSize,
  isLoading: loading,
}: {
  isLoading: boolean;
  selected: number[];
  setSelected: React.Dispatch<React.SetStateAction<number[]>>;
  isClientPage?: boolean;
  isAdmin: boolean;
  categories: CategoryProps[];
  clients: ClientWithPhoneNumbers[];
  cars: CarItem[];
  status: ServiceStatus[];
  currPage: string;
  service: Service;
  currPageSize: number;
}) {
  const total = useMemo(() => {
    const totalFees = service.servicesFee
      .filter((fee) => !fee.isReturned)
      .reduce((sum, curr) => {
        sum += curr.totalPriceAfterDiscount;
        return sum;
      }, 0);
    const totalSold = service.productsToSell
      .filter((pro) => !pro.isReturned)
      .reduce((sum, curr) => {
        sum += curr.totalPriceAfterDiscount;
        return sum;
      }, 0);
    const total = totalSold + totalFees;
    return total;
  }, [service]);
  const item = selected.some((item) => item === service.id);
  return (
    <>
      <TableRow
        onClick={() => {
          setSelected((selected) => {
            if (item) return selected.filter((item) => item !== service.id);
            return [...selected, service.id];
          });
        }}
        className={` ${item && "bg-accent/60 hover:bg-accent/40"}`}
      >
        <TableCell className="font-medium"> {service.id}</TableCell>

        <TableCell className=" whitespace-nowrap">
          {service.created_at}
        </TableCell>

        <TableCell>
          <ClientDialog service={service} />
        </TableCell>

        <TableCell>
          <CarDialog service={service} isAdmin={isAdmin} />
        </TableCell>

        <TableCell>
          <StatusBadge status={service.serviceStatuses} />
        </TableCell>

        <TableCell>
          <ServiceFeesDialog
            isAdmin={isAdmin}
            categories={categories}
            service={service}
            total={total}
          />
        </TableCell>

        <TableCell className=" min-w-[100px]">
          <ProductSoldDialog
            isAdmin={isAdmin}
            service={service}
            total={total}
          />
        </TableCell>
        <TableCell className=" relative">
          <Priority priority={service.priority} />
        </TableCell>
        <TableCell className=" font-bold text-right ">
          <div className=" flex   items-center justify-end gap-3">
            <span className={` ${total === 0 && " text-muted-foreground"}`}>
              {" "}
              {formatCurrency(total)}{" "}
            </span>
            <TableActions
              loading={loading}
              isClientPage={isClientPage}
              isAdmin={isAdmin}
              cars={cars}
              clients={clients}
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
  );
}

function TableActions({
  loading,
  isClientPage,
  isAdmin,
  status,
  service,
  currPageSize,
  currPage,
  cars,
  clients,
}: {
  loading: boolean;
  isClientPage?: boolean;
  isAdmin?: boolean;
  cars: CarItem[];
  clients: ClientWithPhoneNumbers[];
  status: ServiceStatus[];
  currPage: string;
  service: Service;
  currPageSize: number;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [open, setOpen] = useState<"delete" | "edit" | "note" | "">("");

  // const [open, setOpen] = useState(false);
  // const [chosenStatus, setChosenStatus] = useState<number>(service.status.id);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const searchParam = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const params = new URLSearchParams(searchParam);
  const currLoading = isLoading || loading;

  const handleChangePriority = async (
    priority: "Low" | "Medium" | "High" | string,
  ) => {
    setIsLoading(true);
    try {
      await editServiceAction({
        priority,
        id: service.id,
      });

      setIsLoading(false);
      // handleClose();
      toast({
        className: "bg-primary  text-primary-foreground",
        title: `Data updated!.`,
        description: (
          <SuccessToastDescription
            message={`Service priority has been uptated.'`}
          />
        ),
      });
    } catch (error: any) {
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Faild to update the service priority.",
        description: <ErorrToastDescription error={error.message} />,
      });
    }
  };

  const handleChangeStatus = async (id: number) => {
    setIsLoading(true);
    try {
      await editServiceAction({
        serviceStatusId: id,
        id: service.id,
      });

      setIsLoading(false);
      // handleClose();
      toast({
        className: "bg-primary  text-primary-foreground",
        title: `Data updated!.`,
        description: (
          <SuccessToastDescription
            message={`Service status has been uptated.'`}
          />
        ),
      });
    } catch (error: any) {
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Faild to update the service status.",
        description: <ErorrToastDescription error={error.message} />,
      });
    }
  };

  const handlePdf = async () => {
    setIsLoading(true);
    try {
      await downloadAsPdf([service.id]);
      toast({
        className: "bg-primary  text-primary-foreground",
        title: `Done.`,
        description: (
          <SuccessToastDescription
            message={`Receipt data is ready to be downloaded as a PDF.`}
          />
        ),
      });
    } catch (error: any) {
      console.error(error);

      toast({
        variant: "destructive",
        title: "Failed to download.",
        description: <ErorrToastDescription error={error.message} />,
      });
    } finally {
      setIsLoading(false);
    }
  };

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
        className="  w-4 h-4 flex items-center mx-1 justify-center  "
        size={15}
      />
    );

  return (
    <div onClick={(e) => e.stopPropagation()} className=" w-fit ">
      {isAdmin ? (
        <>
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="     p-0 h-6 w-6"
              >
                <Ellipsis className=" w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className=" min-w-[200px] mr-5 ">
              {/* <DropdownMenuLabel>My Account</DropdownMenuLabel> */}
              {/* <DropdownMenuSeparator /> */}
              <DropdownMenuItem
                className=" gap-2"
                onClick={() => {
                  setOpen("edit");
                }}
              >
                <ReceiptText className=" w-4 h-4" /> Edit service receipt
              </DropdownMenuItem>

              <DropdownMenuItem
                disabled={!service.note}
                className=" gap-2"
                onClick={() => {
                  setOpen("note");
                }}
              >
                <NotepadTextDashed className=" w-4 h-4" /> View receipt note
              </DropdownMenuItem>
              <DropdownMenuItem
                className=" gap-2"
                onClick={() => {
                  params.set("addFeeId", service.id.toString());
                  router.push(`${pathname}?${params.toString()}`, {
                    scroll: false,
                  });
                }}
              >
                <HandPlatter className=" w-4 h-4" /> Add more service fees{" "}
              </DropdownMenuItem>
              <DropdownMenuItem
                className=" gap-2"
                onClick={() => {
                  const params = new URLSearchParams(searchParam);
                  params.set("addSoldId", service.id.toString());
                  router.push(`${pathname}?${params.toString()}`, {
                    scroll: false,
                  });
                }}
              >
                <PackagePlus className=" w-4 h-4" /> Add more sold products
              </DropdownMenuItem>
              <DropdownMenuSub
              // disabled={isLoading}
              // className=" gap-2"
              // onClick={() => {
              //   setOpen("delete");
              // }}
              >
                <DropdownMenuSubTrigger className=" gap-2">
                  {" "}
                  <FaArrowUpWideShort /> Change priority
                </DropdownMenuSubTrigger>

                <DropdownMenuPortal>
                  <DropdownMenuSubContent className=" max-h-[170px] overflow-y-auto">
                    <DropdownMenuItem
                      key="high"
                      className=" gap-2 justify-between"
                      onClick={async () => {
                        if (service.priority?.toLocaleLowerCase() === "high")
                          return;
                        await handleChangePriority("High");
                      }}
                    >
                      <Priority priority="high" />
                      {service.priority?.toLocaleLowerCase() == "high" && (
                        <Check className=" w-3 h-3" />
                      )}
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      key="medium"
                      className=" gap-2 justify-between"
                      onClick={async () => {
                        if (service.priority?.toLocaleLowerCase() === "medium")
                          return;
                        await handleChangePriority("Medium");
                      }}
                    >
                      <Priority priority="medium" />
                      {service.priority?.toLocaleLowerCase() == "medium" && (
                        <Check className=" w-3 h-3" />
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      key="low"
                      className=" gap-2 justify-between"
                      onClick={async () => {
                        if (service.priority?.toLocaleLowerCase() === "low")
                          return;
                        await handleChangePriority("Low");
                      }}
                    >
                      <Priority priority="low" />
                      {(service.priority?.toLocaleLowerCase() == "low" ||
                        !service.priority) && <Check className=" w-3 h-3" />}
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
                <DropdownMenuSubTrigger className=" gap-2">
                  {" "}
                  <Replace className=" w-4 h-4" /> Change status
                </DropdownMenuSubTrigger>

                <DropdownMenuPortal>
                  <DropdownMenuSubContent className=" max-h-[170px] overflow-y-auto">
                    {status.map((status, i) => (
                      <DropdownMenuItem
                        key={i}
                        className=" gap-2 justify-between"
                        onClick={async () => {
                          // setChosenStatus(status.id)
                          if (status.id === service.serviceStatuses.id) return;
                          await handleChangeStatus(status.id);
                        }}
                      >
                        <StatusBadge
                          disableToolTip
                          status={status}
                          className=" py-[.1rem]"
                        />
                        {service.serviceStatuses.id === status.id && (
                          <Check className=" w-3 h-3" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              {/* <DropdownMenuSeparator /> */}
              <DropdownMenuItem
                className=" gap-2  "
                onClick={async () => {
                  await handlePdf();
                }}
              >
                <ArrowDownToLine className=" w-4 h-4" />
                Download as PDF
              </DropdownMenuItem>
              <DropdownMenuItem
                className=" gap-2  !text-red-900  dark:!text-red-300 hover:!bg-destructive/70"
                onClick={() => {
                  setOpen("delete");
                }}
              >
                <Trash2 className=" w-4 h-4" />
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
            cars={cars}
            clients={clients}
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
            description={`Note related to a car with the plate number '${service.cars.plateNumber}' belonging to '${service.clients.name}', with a service date of '2024-11-06.'`}
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
                className="     p-1 h-6 w-6"
                onClick={async () => await handlePdf()}
              >
                <Download className=" w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Download as pdf</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
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
  currPage: string;
  open: boolean;
  isDeleting: boolean;
  setIsDeleting: React.Dispatch<SetStateAction<boolean>>;
  handleClose: () => void;
  service: Service;
  pageSize: number;
}) {
  const [checked, setChecked] = useState(true);
  const { toast } = useToast();
  const searchParam = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  function checkIfLastItem() {
    const params = new URLSearchParams(searchParam);
    if (pageSize === 1) {
      if (Number(currPage) === 1 && pageSize === 1) {
        params.delete("dateFrom");
        params.delete("dateTo");
        params.delete("clientId");
        params.delete("carId");
        params.delete("serviceStatusId");
        params.delete("minPrice");
        params.delete("maxPrice");
      }
      if (Number(currPage) > 1) {
        params.set("page", String(Number(currPage) - 1));
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }

  useEffect(() => {
    const body = document.querySelector("body");

    if (body) {
      body.style.pointerEvents = "auto";
    }
    return () => {
      if (body) body.style.pointerEvents = "auto";
    };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] border-none">
        <DialogHeader>
          <DialogTitle>Delete service receipt.</DialogTitle>
          <DialogDescription>
            {`You are about to delete a receipt dated '${service.created_at}', issued to the client '${service.clients.name}', along with all its associated data.`}
          </DialogDescription>
        </DialogHeader>
        <div className=" flex items-center gap-2">
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
        <DialogFooter className="   gap-2 sm:gap-0">
          <Button onClick={handleClose} size="sm" variant="secondary">
            Cancel
          </Button>

          <Button
            disabled={isDeleting}
            variant="destructive"
            size="sm"
            onClick={async () => {
              setIsDeleting(true);
              try {
                const productsIds = Array.from(
                  new Set(service.productsToSell.map((p) => p.productId)),
                );

                const productsToRestock = checked
                  ? productsIds.map((id) =>
                      service.productsToSell
                        .filter((product) => product.productId === id)
                        .reduce(
                          (acc, currPro) => {
                            acc.quantity += currPro.count;
                            return acc;
                          },
                          { id, quantity: 0 },
                        ),
                    )
                  : undefined;

                const { error } = await deleteServiceAction(
                  service.id.toString(),
                  productsToRestock,
                );
                if (error) throw new Error(error);
                checkIfLastItem();
                setIsDeleting(false);
                handleClose();
                queryClient.removeQueries({ queryKey: ["servicesStats"] });
                toast({
                  className: "bg-primary  text-primary-foreground",
                  title: `Data deleted!.`,
                  description: (
                    <SuccessToastDescription
                      message={`Service data has been deleted.`}
                    />
                  ),
                });
              } catch (error: any) {
                setIsDeleting(false);
                toast({
                  variant: "destructive",
                  title: "Faild to delete Service data",
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
  currPage: string;
  open: boolean;
  isDeleting: boolean;
  setOpen: React.Dispatch<SetStateAction<number | null>>;
  productBoughtId: number | null;
  setMainDialong: React.Dispatch<SetStateAction<boolean>>;
  setIsDeleting: React.Dispatch<SetStateAction<boolean>>;
  handleClose: () => void;
  service: Service;
  pageSize: number;
}) {
  const { toast } = useToast();

  //   const proTodelete = productBoughtId
  //     ? proBought.productsBought.find((pro) => pro.id === productBoughtId)
  //     : null;

  useEffect(() => {
    const body = document.querySelector("body");

    if (body) {
      body.style.pointerEvents = "auto";
    }
    return () => {
      if (body) body.style.pointerEvents = "auto";
    };
  }, [open]);

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        handleClose();
        setOpen(null);
        setMainDialong(true);
      }}
    >
      <DialogContent className="sm:max-w-[425px] border-none">
        <DialogHeader>
          <DialogTitle>Delete service.</DialogTitle>
          <DialogDescription>
            {`You are about to delete a service receipt dated '${service.created_at}', isussed to the cutomer '${service.clients.name}', along with all it's related data.`}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="   gap-2 sm:gap-0">
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
                setIsDeleting(true);
                // if (proTodelete)
                await deleteServiceAction(service.id.toString());
                // checkIfLastItem();
                setIsDeleting(false);
                setOpen(null);
                setMainDialong(true);
                // handleClose();
                toast({
                  className: "bg-primary  text-primary-foreground",
                  title: `Data deleted!`,
                  description: (
                    <SuccessToastDescription
                      message={`Service data has been deleted`}
                    />
                  ),
                });
              } catch (error: any) {
                toast({
                  variant: "destructive",
                  title: "Faild to delete client's data",
                  description: <ErorrToastDescription error={error.message} />,
                });
              }
              setIsDeleting(false);
            }}
          >
            {isDeleting ? <Spinner className=" h-full" /> : "Confrim"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ServiceTable;
