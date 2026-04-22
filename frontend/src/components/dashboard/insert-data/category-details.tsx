import React, { useEffect, useState } from "react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AnimatePresence, motion } from "framer-motion";
import { CategoryProps, ProductType } from "@lib/types";
import { cn } from "@lib/utils";
import { Button } from "@components/ui/button";
import { EllipsisVertical, Trash2, X } from "lucide-react";
import ProductTypeForm from "./prodcut-type-form";
import Spinner from "@components/Spinner";
import { deleteProductTypeAction } from "@lib/actions/productTypeActions";
import { useToast } from "@hooks/use-toast";
import SuccessToastDescription, {
  ErorrToastDescription,
} from "@components/toast-items";
import { PiSubtract } from "react-icons/pi";
import { Switch } from "@components/ui/switch";

interface Props {
  open: boolean;
  setOpen: () => void;
  category: CategoryProps | undefined;
}

const animation = {
  visible: { y: 0, opacity: 1 },
  hidden: { y: 2, opacity: 0.3 },
};

const opacity = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
};
const CategoryDetails = ({ open, setOpen, category }: Props) => {
  const [subCatToEdit, setSubCatToEdit] = useState<number | undefined>();
  const [subCatToDelete, setSubCatToDelete] = useState<number[]>([]); // An array of all the items the user wants to delete.
  const [isDeleteMoreThanOne, setIsDeleteMoreThanOne] = useState(false); // Toggle delete than one item mode.
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number[]>([]); // An array to track the current items that are being deleted.
  const [addTypeOpen, setAddTypeOpen] = useState(false);
  const subCategoryToEdit = category?.productTypes.find(
    (pro) => pro.id === subCatToEdit
  );
  const subCategoryDelete = subCatToDelete
    .map((id) => category?.productTypes.find((item) => item.id === id))
    .filter((item) => item !== undefined);

  useEffect(() => {
    setIsDeleteMoreThanOne(false);
  }, [open, setIsDeleteMoreThanOne]);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="  sm:p-14 p-3  max-h-[76vh] overflow-y-auto  rounded-none sm:rounded-none  lg:rounded-lg space-y-4  max-w-[1000px]">
        <DialogHeader>
          <DialogTitle>
            All sub-category of <span>&#40;</span>
            <AnimatePresence>
              {category?.name && (
                <motion.span
                  variants={opacity}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  transition={{ duration: 0.1 }}
                >
                  {category.name}
                </motion.span>
              )}
            </AnimatePresence>
            <span>&#41;</span>
          </DialogTitle>
          <DialogDescription className=" hidden">.</DialogDescription>
        </DialogHeader>
        <AnimatePresence>
          {category?.productTypes.length ? (
            <motion.div
              key="delete-controls"
              variants={opacity}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className=" w-full px-4 py-2 rounded-lg bg-card flex items-center gap-2 justify-between"
            >
              <p className=" text-xs text-muted-foreground">
                Delete multiple items at once by toggling the delete button on
                and selecting the items to delete
              </p>{" "}
              <Switch
                checked={isDeleteMoreThanOne}
                onCheckedChange={(isDeleting) => {
                  setIsDeleteMoreThanOne(isDeleting);
                  setSubCatToDelete([]);
                }}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
        <div className=" my-12">
          <AnimatePresence mode="wait">
            {category?.productTypes.length ? (
              <motion.ul
                key="list"
                variants={animation}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className=" flex gap-3 items-start justify-between flex-wrap"
              >
                {category.productTypes
                  .sort((a, b) => a.id - b.id)
                  .map((subCat) => (
                    <SubCategory
                      key={subCat.id}
                      subCat={subCat}
                      isDeleting={isDeleting.includes(subCat.id)}
                      setSubCatToEdit={setSubCatToEdit}
                      setDeleteOpen={setDeleteOpen}
                      isDeleteMoreThanOne={isDeleteMoreThanOne}
                      selected={subCatToDelete.includes(subCat.id)}
                      setSubCatToDelete={() =>
                        setSubCatToDelete((prev) => {
                          if (prev.includes(subCat.id)) {
                            return prev.filter((id) => id !== subCat.id);
                          } else return [...prev, subCat.id];
                        })
                      }
                    />
                  ))}
              </motion.ul>
            ) : (
              <motion.p
                key="paragraph"
                variants={animation}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className=" flex flex-col gap-3 justify-center items-center "
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
        </div>
        <div className="flex  flex-col  gap-y-2 xs:flex-row xs:items-center justify-between rounded-lg border p-3 shadow-sm gap-x-7">
          <div className="space-y-0.5   ">
            <label className=" font-semibold">Add car models</label>
            <p className=" text-muted-foreground text-sm">
              Add a new car model to {category?.name}&apos;s list.
            </p>
          </div>
          <div className="  sm:pr-2">
            <Button
              size="sm"
              className=" w-full"
              onClick={() => setAddTypeOpen(true)}
            >
              Create Sub-category
            </Button>

            {category && (
              <ProductTypeForm
                productTypeToEdit={subCategoryToEdit}
                open={addTypeOpen || !!subCategoryToEdit}
                relatedCategory={category}
                setOpen={() => {
                  setAddTypeOpen(false);
                  setSubCatToEdit(undefined);
                }}
              />
            )}
            <DeleteProType
              isDeleting={isDeleting.length > 0}
              setIsDeleting={setIsDeleting}
              productTypesToDelete={subCategoryDelete}
              subCatToDelete={subCatToDelete}
              setSubCatToDelete={setSubCatToDelete}
              setIsDeleteMoreThanOne={setIsDeleteMoreThanOne}
              open={deleteOpen}
              setOpen={setDeleteOpen}
            />
          </div>
        </div>
        <AnimatePresence>
          {isDeleteMoreThanOne && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className=" sticky  flex items-center justify-center px-5  py-3 w-full rounded-2xl  -bottom-1  sm:-bottom-10 bg-accent/25 backdrop-grayscale backdrop-brightness-75   backdrop-blur-xl  gap-2"
            >
              <Button
                className=" w-full"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setIsDeleteMoreThanOne(false);
                  setSubCatToDelete([]);
                }}
              >
                Cancel
              </Button>
              <Button
                disabled={!subCatToDelete.length}
                variant="outline"
                size="sm"
                className=" w-full"
                onClick={() => setSubCatToDelete([])}
              >
                Reset
              </Button>
              <Button
                disabled={!subCatToDelete.length}
                variant="destructive"
                size="sm"
                className=" w-full"
                onClick={() => setDeleteOpen(true)}
              >
                Detele {subCatToDelete.length}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

function SubCategory({
  subCat,
  isDeleting,
  setDeleteOpen,
  setSubCatToEdit,
  isDeleteMoreThanOne,
  selected,
  setSubCatToDelete,
}: // setIsDeleteMoreThanOne,
{
  subCat: ProductType;
  isDeleting: boolean;
  isDeleteMoreThanOne: boolean;
  selected: boolean;
  setDeleteOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSubCatToEdit: React.Dispatch<React.SetStateAction<number | undefined>>;
  setSubCatToDelete: () => void;
  // setIsDeleteMoreThanOne: React.Dispatch<React.SetStateAction<number[]>>;
}) {
  return (
    <li
      onClick={() => {
        if (isDeleteMoreThanOne) {
          setSubCatToDelete();
        } else setSubCatToEdit(subCat.id);
      }}
      className={cn(
        `relative   w-fit  min-w-[120px]   sm:min-w-[150px]   md:min-w-[170px]   px-3 py-2 flex flex-col  items-center  justify-between    hover:bg-accent/30  transition-all cursor-pointer  gap-2 text-sm   rounded-xl  flex-1 `,
        {
          "px-3 py-[0.4rem] ": !subCat.image,
          "bg-destructive/40 hover:bg-destructive/30": selected,
        }
      )}
    >
      {subCat.image ? (
        <img
          src={subCat.image}
          alt={`${subCat.name} image`}
          className=" h-16  sm:h-20 block  object-contain"
        />
      ) : null}

      <div className="flex items-center  w-full  justify-center gap-2 ">
        <p
          className={cn("   w-full  pr-6 text-xs xs:text-base  text-center", {
            "   w-[99%]   text-wrap   px-[14%] ": subCat.image,
          })}
        >
          {subCat.name}
        </p>

        {isDeleting ? (
          <Spinner className="  h-4 w-4 absolute right-3  bottom-2" />
        ) : (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setSubCatToDelete();
              if (!isDeleteMoreThanOne) {
                setDeleteOpen(true);
              }
            }}
            variant="destructive"
            className=" absolute right-2  bottom-[0.3rem]  p-0 h-6 w-6"
          >
            <Trash2 className=" w-4 h-4" />
          </Button>
        )}
      </div>
    </li>
  );
}

function DeleteProType({
  productTypesToDelete,
  open,
  setOpen,
  isDeleting,
  setIsDeleting,
  subCatToDelete,
  setSubCatToDelete,
  setIsDeleteMoreThanOne,
}: {
  isDeleting: boolean;
  productTypesToDelete: ProductType[];
  open: boolean;
  subCatToDelete: number[];
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsDeleteMoreThanOne: React.Dispatch<React.SetStateAction<boolean>>;
  setIsDeleting: React.Dispatch<React.SetStateAction<number[]>>;
  setSubCatToDelete: React.Dispatch<React.SetStateAction<number[]>>;
}) {
  const { toast } = useToast();
  useEffect(() => {
    if (!open) setSubCatToDelete([]);
  }, [open]);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            You are about to delete
            <AnimatePresence>
              {productTypesToDelete && productTypesToDelete.length > 1 ? (
                <motion.span
                  key="multi-del"
                  variants={opacity}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  transition={{ duration: 0.1 }}
                >
                  {" "}
                  {subCatToDelete.length} sub-categories.
                </motion.span>
              ) : (
                <motion.span
                  key="single-del"
                  variants={opacity}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  transition={{ duration: 0.1 }}
                >
                  sub-category
                  {productTypesToDelete?.[0]?.name}
                </motion.span>
              )}
            </AnimatePresence>
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
                if (!productTypesToDelete?.length) return;
                setIsDeleting(productTypesToDelete.map((subCat) => subCat.id));
                const { error } = await deleteProductTypeAction(
                  productTypesToDelete
                );

                if (error) throw new Error(error);
                setOpen(false);
                setSubCatToDelete([]);
                setIsDeleteMoreThanOne(false);
                toast({
                  className: "bg-primary  text-primary-foreground",
                  title: "Done.",
                  description: (
                    <SuccessToastDescription message="A new category has been created." />
                  ),
                });
              } catch (error: any) {
                toast({
                  variant: "destructive",
                  title: "Something went wrong.",
                  description: <ErorrToastDescription error={error.message} />,
                });
              } finally {
                setIsDeleting([]);
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

export default CategoryDetails;
