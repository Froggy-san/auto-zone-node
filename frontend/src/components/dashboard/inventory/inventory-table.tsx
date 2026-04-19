"use client";
import React, { SetStateAction, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ClientWithPhoneNumbers,
  PhoneNumber,
  ProductBoughtData,
} from "@lib/types";
import { Button } from "@components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  CircleUser,
  Ellipsis,
  LoaderCircle,
  PackageMinus,
  PackagePlus,
  Pencil,
  ReceiptText,
  UserRoundMinus,
} from "lucide-react";
import { useToast } from "@hooks/use-toast";
import SuccessToastDescription, {
  ErorrToastDescription,
} from "@components/toast-items";
import Spinner from "@components/Spinner";

import { deleteClientByIdAction } from "@lib/actions/clientActions";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
// import useCarCountPerClient from "@lib/queries/useCarCountPerClient";
import Link from "next/link";
import {
  deleteRestockingBillAction,
  editRestockingBillAction,
} from "@lib/actions/restockingBillActions";
import { Input } from "@components/ui/input";
import { Switch } from "@components/ui/switch";
import { Label } from "@components/ui/label";
import { Checkbox } from "@components/ui/checkbox";
import { deleteProductsBoughtByIdAction } from "@lib/actions/productBoughtActions";
import { format, isEqual } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@components/ui/popover";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en", { style: "currency", currency: "egp" }).format(
    value
  );

const InventoryTable = ({
  productBought,
  currPage,
}: {
  currPage: string;
  productBought: ProductBoughtData[];
}) => {
  if (!productBought)
    return <p>Something went wrong while getting the client&apos;s data</p>;
  const currPageSize = productBought.length;

  return (
    <Table className=" mt-10">
      <TableCaption>
        {productBought.length
          ? "A list of all your inventory receipts."
          : "No receipts"}
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">ID</TableHead>
          <TableHead>SHOP NAME</TableHead>
          <TableHead className="text-right">DATE OF ORDER</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {productBought && productBought.length
          ? productBought.map((proBought, i) => (
              <Row
                proBought={proBought}
                key={i}
                currPage={currPage}
                currPageSize={currPageSize}
              />
            ))
          : null}
      </TableBody>
    </Table>
  );
};

function Row({
  proBought,
  currPage,
  currPageSize,
}: {
  currPage: string;
  proBought: ProductBoughtData;
  currPageSize: number;
}) {
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function handleClose() {
    setOpen(false);
  }
  return (
    <>
      <TableRow
        onClick={() => setOpen(true)}
        className={`${isLoading && "opacity-60  pointer-events-none"}`}
      >
        <TableCell className="font-medium">{proBought.id}</TableCell>
        <TableCell>{proBought.shopName}</TableCell>
        <TableCell className="text-right ">
          {format(proBought.created_at, "PPP")}
        </TableCell>

        <TableCell>
          {" "}
          <div className=" flex items-center gap-2 justify-end">
            {/* <ShowCars client={client} /> */}

            {/* <Button
      size="sm"
      className="   h-6 px-2 py-3 text-xs"
      variant="outline"
      >
      Show
      </Button> */}
            <TableActions
              currPage={currPage}
              proBought={proBought}
              currPageSize={currPageSize}
            />
          </div>
        </TableCell>
      </TableRow>
      <DeleteDialog
        currPage={currPage}
        pageSize={currPageSize}
        proBought={proBought}
        isDeleting={isLoading}
        setOpen={setDeleteOpen}
        setMainDialong={setOpen}
        setIsDeleting={setIsLoading}
        open={typeof deleteOpen === "number"}
        productBoughtId={deleteOpen}
        handleClose={handleClose}
      />
      <ProductsDialog
        proBought={proBought}
        open={open}
        handleClose={handleClose}
        setOpen={setOpen}
        setDeleteOpen={setDeleteOpen}
      />
    </>
  );
}

function ProductsDialog({
  proBought,
  open,
  setOpen,
  setDeleteOpen,
  handleClose,
}: {
  open: boolean;
  setDeleteOpen: React.Dispatch<SetStateAction<number | null>>;
  setOpen: React.Dispatch<SetStateAction<boolean>>;
  handleClose: () => void;
  proBought: ProductBoughtData;
}) {
  const [priceValue, setPriceValue] = useState("");
  const [discountValue, setDiscountValue] = useState("");
  const [countValue, setCountValue] = useState("");
  const [totalPriceAfterDiscountValue, setTotalPriceAfterDiscount] =
    useState("");
  const [nameValue, setNameValue] = useState("");
  const [hasReturnedValue, setHasReturnedValue] = useState<boolean>(false);
  const [checked, setChecked] = useState(false);
  const searchParam = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  let productsArr = proBought.productsBought;

  function handleOpenEdit(filter: string) {
    const params = new URLSearchParams(searchParam);
    params.set("edit", filter);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  productsArr = productsArr.filter((product) => {
    // const price = new RegExp(priceValue, "i");
    // const discount = new RegExp(discountValue, "i");
    // const count = new RegExp(countValue, "i");
    // const totalPriceAfterDiscount = new RegExp(
    //   totalPriceAfterDiscountValue,
    //   "i"
    // );
    const name = new RegExp(nameValue, "i"); // 'i' for case-insensitive
    const hasReturned = new RegExp(String(hasReturnedValue), "i");

    // let filterValue =
    //   price.test(String(product.pricePerUnit)) &&
    //   discount.test(String(product.discount)) &&
    //   count.test(String(product.count)) &&
    //   totalPriceAfterDiscount.test(String(product.totalPriceAfterDiscount)) &&
    //   name.test(product.productName);

    let filterValue = name.test(product.productName);
    if (checked)
      filterValue = filterValue && hasReturned.test(String(product.isReturned));

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

  const totals = productsArr.reduce(
    (acc, item) => {
      acc.totalDiscount += item.discount;
      acc.totalPrice += item.totalPriceAfterDiscount;
      return acc;
    },
    { totalDiscount: 0, totalPrice: 0 }
  );
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className=" border-none p-4  sm:p-6  !pb-0  flex flex-col  overflow-y-auto    max-h-[81vh]     max-w-[900px]">
        <DialogHeader className=" hidden  invisible">
          <DialogTitle>{`'s phome numbers`}</DialogTitle>
          <DialogDescription className=" hidden">
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>

        {/* <main className="  gap-6  flex flex-col max-h-[90%]  h-full relative   "> */}

        <div className="flex flex-wrap gap-2  xs:gap-3 bg-secondary/50  dark:bg-card/20 rounded-md  justify-center   p-3  text-sm">
          {/* <div className=" flex  flex-col sm:flex-row items-center  gap-3 "> */}
          <div className=" space-y-2  w-[48%] sm:w-[32%]  mb-auto">
            <label className=" text-xs " htmlFor="price">
              Price per unit
            </label>
            <Input
              id="price"
              placeholder="Price per unit"
              value={priceValue}
              onChange={(e) => setPriceValue(e.target.value)}
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
              onChange={(e) => setDiscountValue(e.target.value)}
            />
          </div>
          <div className=" space-y-2  w-[48%] sm:w-[32%]  mb-auto">
            <label className=" text-xs " htmlFor="count">
              Count
            </label>
            <Input
              id="count"
              placeholder="Count..."
              value={countValue}
              onChange={(e) => setCountValue(e.target.value)}
            />
          </div>
          <div className=" space-y-2  w-[48%] sm:w-[32%]  mb-auto">
            <label className=" text-xs " htmlFor="totalPrice">
              Total price after discount
            </label>
            <Input
              id="totalPrice"
              placeholder="Total price after discount..."
              value={totalPriceAfterDiscountValue}
              onChange={(e) => setTotalPriceAfterDiscount(e.target.value)}
            />
          </div>
          <div className=" space-y-2   w-[48%] sm:w-[32%]  mb-auto">
            <label className=" text-xs " htmlFor="name">
              Name
            </label>
            <Input
              id="name"
              placeholder="Total price after discount..."
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
            />
          </div>

          <div className="flex items-center  justify-end  space-x-2   w-[48%] sm:w-[32%] ">
            <Switch
              id="airplane-mode"
              checked={hasReturnedValue}
              // onChange={() => setHasReturnedValue((is) => !is)}
              onClick={() => setHasReturnedValue((is) => !is)}
              disabled={!checked}
            />
            <Label className=" text-xs " htmlFor="airplane-mode">
              Has it returned
            </Label>
            <Checkbox
              checked={checked}
              onClick={() => {
                if (hasReturnedValue) setHasReturnedValue(false);
                setChecked((is) => !is);
              }}
            />
          </div>
        </div>

        <div className=" space-y-4    sm:flex-1  sm:px-2   sm:overflow-y-auto">
          <div className=" flex items-center justify-between">
            <h2 className=" font-semibold text-xl  whitespace-nowrap">
              {proBought.productsBought.length} Products bought.
            </h2>
            <div className=" text-xs   justify-end flex items-center gap-y-1 gap-x-3 flex-wrap text-muted-foreground  ">
              <div>
                Shop: <span>{proBought.shopName}</span>
              </div>
              <div>
                Date: <span>{format(proBought.created_at, "PPP")}</span>
              </div>
            </div>
          </div>
          {productsArr.length ? (
            productsArr.map((product, i) => {
              console.log(product);

              return (
                <div
                  key={i}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground px-4 py-2"
                >
                  <Link
                    href={`/products/${product.productId}`}
                    className="flex text-sm  h-fit flex-wrap  font-semibold !text-green-400  !justify-start  items-center  max-w-full    gap-x-6 gap-y-3"
                  >
                    <div className=" ">
                      Product name:{" "}
                      <span className=" text-xs text-muted-foreground  break-all whitespace-normal">{` ${product.product?.name}`}</span>{" "}
                    </div>
                    <div className=" ">
                      Price:{" "}
                      <span className=" text-xs text-muted-foreground">{` ${formatCurrency(
                        product.pricePerUnit
                      )}`}</span>{" "}
                    </div>
                    <div>
                      {" "}
                      Discount:{" "}
                      <span className="text-xs text-muted-foreground">{` ${formatCurrency(
                        product.discount
                      )}`}</span>
                    </div>
                    <div>
                      Count:{" "}
                      <span className="text-xs text-muted-foreground">{` ${product.count}`}</span>
                    </div>
                    <div>
                      Has it been returned?:{" "}
                      <span className="text-xs text-muted-foreground">
                        {` ${product.isReturned ? "Yes" : "No"}`}
                      </span>
                    </div>
                    <div>
                      Total price after discount:{" "}
                      <span className="text-xs text-muted-foreground   break-all whitespace-normal">{` ${formatCurrency(
                        product.totalPriceAfterDiscount
                      )}`}</span>
                    </div>
                    <div className=" break-all  whitespace-normal">{`Note: ${product.note}`}</div>

                    <div className=" flex items-center gap-2 ml-auto">
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          e.preventDefault();
                          handleOpenEdit(String(product.id));
                          setOpen(false);
                        }}
                        className=" p-0 w-8 h-8"
                      >
                        <Pencil className=" h-4 w-4" />
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          setDeleteOpen(product.id);
                          setOpen(false);
                        }}
                        variant="destructive"
                        size="sm"
                        className=" p-0 w-8 h-8"
                      >
                        <PackageMinus className=" h-4 w-4" />
                      </Button>
                    </div>
                  </Link>
                </div>
              );
            })
          ) : (
            <p className=" text-center  py-3">No Products.</p>
          )}
        </div>
        {/* </main> */}
        <div className=" sticky pb-6 pt-4 sm:pt-0 bottom-0 left-0 bg-background  space-y-3">
          <DialogClose asChild>
            <Button size="sm" className=" w-full" variant="secondary">
              Close
            </Button>
          </DialogClose>
          <div className=" flex gap-x-10 gap-y-2 flex-wrap">
            <div>
              Total:{" "}
              <span className=" text-xs  text-muted-foreground">
                {formatCurrency(totals.totalPrice)}
              </span>
            </div>

            <div>
              Total discount:{" "}
              <span className=" text-xs  text-muted-foreground">
                {formatCurrency(totals.totalDiscount)}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TableActions({
  proBought,
  currPageSize,
  currPage,
}: {
  currPage: string;
  proBought: ProductBoughtData;
  currPageSize: number;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [open, setOpen] = useState<"delete" | "edit" | "">("");
  const [isLoading, setIsLoading] = useState(false);

  const searchParam = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  function handleClose() {
    setOpen("");
  }

  if (isLoading)
    return (
      <Spinner
        className="  w-4 h-4 flex items-center mr-1 justify-center "
        size={15}
      />
    );

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className=" p-0 h-6 w-6">
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
            <ReceiptText className=" w-4 h-4" /> Edit receipt
          </DropdownMenuItem>
          <DropdownMenuItem
            className=" gap-2"
            onClick={() => {
              const params = new URLSearchParams(searchParam);
              params.set("reStockingBillId", proBought.id.toString());
              router.replace(`${pathname}?${params.toString()}`, {
                scroll: false,
              });
            }}
          >
            <PackagePlus className=" w-4 h-4" /> Add more bought products
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={proBought.productsBought.length > 0}
            className=" gap-2"
            onClick={() => {
              setOpen("delete");
            }}
          >
            <UserRoundMinus className=" w-4 h-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {/* <ClientForm
        open={open === "edit"}
        handleClose={handleClose}
        client={client}
      /> */}

      <EditReceipt
        open={open === "edit"}
        handleClose={handleClose}
        restockingBill={proBought}
        isDeleting={isLoading}
        setIsDeleting={setIsLoading}
      />

      <DeleteRestockingDialog
        currPage={currPage}
        pageSize={currPageSize}
        restockingBill={proBought}
        isDeleting={isLoading}
        setIsDeleting={setIsLoading}
        open={open === "delete"}
        handleClose={handleClose}
      />
    </div>
  );
}

function EditReceipt({
  open,
  handleClose,
  isDeleting,
  setIsDeleting,
  restockingBill,
}: {
  open: boolean;
  isDeleting: boolean;
  setIsDeleting: React.Dispatch<SetStateAction<boolean>>;
  handleClose: () => void;
  restockingBill: ProductBoughtData;
}) {
  const { toast } = useToast();

  const billDate = new Date(restockingBill.created_at);
  const [shopName, setShopName] = useState(restockingBill.shopName);
  const [dateOfOrder, setSetDateOfOrder] = useState<Date | undefined>(billDate);
  const [errors, setErrors] = useState({
    shopNameError: "",
    dateOfOrderError: "",
  });
  const stripTime = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };

  // Check if the user changed anything about the original data.
  const hasNotChange =
    isEqual(stripTime(billDate), stripTime(dateOfOrder || new Date())) &&
    restockingBill.shopName === shopName;

  // Just to note, here we are not deleting anything but we are still using the isdeleting as an isLoading state.
  const disabled =
    hasNotChange ||
    errors.dateOfOrderError.trim() !== "" ||
    errors.shopNameError.trim() !== "" ||
    isDeleting;

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsDeleting(true);
      const restockingToEdit: { shopName: string; created_at?: Date } = {
        shopName,
      };
      if (dateOfOrder) restockingToEdit.created_at = dateOfOrder;
      await editRestockingBillAction({
        restockingToEdit,
        id: restockingBill.id,
      });

      setIsDeleting(false);
      handleClose();
      toast({
        className: "bg-primary  text-primary-foreground",
        title: `Data updated!`,
        description: (
          <SuccessToastDescription
            message={`A receipt related to the shop '${restockingBill.shopName}' has been updated.`}
          />
        ),
      });
    } catch (error: any) {
      setIsDeleting(false);
      toast({
        variant: "destructive",
        title: "Faild to edit inventory receipt data.",
        description: <ErorrToastDescription error={error.message} />,
      });
    }
  };

  useEffect(() => {
    if (!dateOfOrder) {
      setErrors((err) => ({ ...err, dateOfOrderError: "Date is required" }));
    } else {
      setErrors((err) => ({ ...err, dateOfOrderError: "" }));
    }
  }, [dateOfOrder]);

  useEffect(() => {
    const body = document.querySelector("body");
    // Reset form's data every time we open or close the dialog.
    setSetDateOfOrder(new Date(restockingBill.created_at));
    setShopName(restockingBill.shopName);
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
          <DialogTitle>Edit receipt.</DialogTitle>
          <DialogDescription>Edit receipt&apos;s data.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleEdit} className="  space-y-5 ">
          <div className="   space-y-2">
            <Label className={`${errors.shopNameError && "text-destructive"}`}>
              Shop name
            </Label>
            <Input
              value={shopName}
              onChange={(e) => {
                const value = e.target.value;
                setShopName(value);
                if (value.trim().length < 3) {
                  setErrors((err) => ({
                    ...err,
                    shopNameError: "Shop name has to be longer.",
                  }));
                } else {
                  setErrors((err) => ({ ...err, shopNameError: "" }));
                }
              }}
            />
            {errors.shopNameError && (
              <p className=" text-destructive">{errors.shopNameError}</p>
            )}
          </div>

          <div className="   space-y-2">
            <Label
              className={`${errors.dateOfOrderError && "text-destructive"}`}
            >
              Date of order
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant={"outline"}
                  className={cn(
                    " w-full justify-start text-left gap-4 items-center font-normal",
                    !dateOfOrder && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon />
                  {dateOfOrder ? (
                    format(dateOfOrder, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateOfOrder}
                  onSelect={setSetDateOfOrder}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.dateOfOrderError && (
              <p className=" text-destructive">{errors.dateOfOrderError}</p>
            )}
          </div>

          <div className="  flex  flex-col-reverse    gap-2 ">
            <DialogClose asChild>
              <Button size="sm" variant="secondary" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button disabled={disabled} size="sm" type="submit">
              {isDeleting ? <Spinner className=" h-full" /> : "Confrim"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteRestockingDialog({
  currPage,
  pageSize,
  open,
  handleClose,
  isDeleting,
  setIsDeleting,
  restockingBill,
}: {
  currPage: string;
  open: boolean;
  isDeleting: boolean;
  setIsDeleting: React.Dispatch<SetStateAction<boolean>>;
  handleClose: () => void;
  restockingBill: ProductBoughtData;
  pageSize: number;
}) {
  const { toast } = useToast();
  const searchParam = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  function checkIfLastItem() {
    const params = new URLSearchParams(searchParam);
    if (pageSize === 1) {
      if (Number(currPage) === 1 && pageSize === 1) {
        params.delete("dateOfOrderTo");
        params.delete("dateOfOrderFrom");
        params.delete("minTotalPrice");
        params.delete("maxTotalPrice");
        params.delete("shopName");
      }
      if (Number(currPage) > 1) {
        params.set("page", String(Number(currPage) - 1));
      }
      router.push(`${pathname}?${params.toString()}`);
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
          <DialogTitle>Delete receipt.</DialogTitle>
          <DialogDescription>
            {`You are about to delete a receipt dated '${restockingBill.created_at}', made at a shop called '${restockingBill.shopName}', along with all its associated data.`}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="   gap-2 sm:gap-0">
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
                await deleteRestockingBillAction(String(restockingBill.id));
                checkIfLastItem();
                setIsDeleting(false);
                handleClose();
                toast({
                  className: "bg-primary  text-primary-foreground",
                  title: `Data deleted!.`,
                  description: (
                    <SuccessToastDescription
                      message={`A receipt related to the shop '${restockingBill.shopName}' has been deleted.`}
                    />
                  ),
                });
              } catch (error: any) {
                toast({
                  variant: "destructive",
                  title: "Faild to delete inventory receipt data.",
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
  proBought,
}: {
  currPage: string;
  open: boolean;
  isDeleting: boolean;
  setOpen: React.Dispatch<SetStateAction<number | null>>;
  productBoughtId: number | null;
  setMainDialong: React.Dispatch<SetStateAction<boolean>>;
  setIsDeleting: React.Dispatch<SetStateAction<boolean>>;
  handleClose: () => void;
  proBought: ProductBoughtData;
  pageSize: number;
}) {
  const { toast } = useToast();

  const proToDelete = productBoughtId
    ? proBought.productsBought.find((pro) => pro.id === productBoughtId)
    : null;

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
          <DialogTitle>Delete inventory bought.</DialogTitle>
          <DialogDescription>
            {`You are about to delete the product '${proToDelete?.productName}' from a receipt dated '${proBought.created_at}', purchased from the shop '${proBought.shopName}'`}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="   gap-2 sm:gap-0">
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
              try {
                if (!proToDelete) throw new Error(`Something went wrong.`);
                setIsDeleting(true);
                const newStock = proToDelete.product.stock - proToDelete.count;
                const total =
                  proBought.totalPrice - proToDelete.totalPriceAfterDiscount;
                await deleteProductsBoughtByIdAction(
                  proToDelete.id,
                  total,
                  proBought.id,
                  { id: proToDelete.productId, stock: newStock }
                );
                // checkIfLastItem();
                setIsDeleting(false);
                setOpen(null);
                setMainDialong(true);
                // handleClose();
                toast({
                  className: "bg-primary  text-primary-foreground",
                  title: `Data deleted!.`,
                  description: (
                    <SuccessToastDescription
                      message={`A receipt related to the  '${proBought.shopName}' has been deleted.`}
                    />
                  ),
                });
              } catch (error: any) {
                toast({
                  variant: "destructive",
                  title: "Faild to delete inventory receipt data.",
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

export default InventoryTable;
