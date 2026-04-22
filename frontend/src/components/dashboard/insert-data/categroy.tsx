import { CategoryProps } from "@lib/types";
import { cn } from "@lib/utils";
import { EllipsisVertical, LayoutTemplate, X } from "lucide-react";
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
import React, { useEffect, useState } from "react";
import { Button } from "@components/ui/button";
import Spinner from "@components/Spinner";
import SuccessToastDescription, {
  ErorrToastDescription,
} from "@components/toast-items";
import { useToast } from "@hooks/use-toast";
import { deleteCategoryAction } from "@lib/actions/categoriesAction";

interface Props {
  category: CategoryProps;
  setCatToEdit: () => void;
  setOpenDetails: () => void;
}

const Category = ({ category, setCatToEdit, setOpenDetails }: Props) => {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  return (
    <li
      onClick={() => {
        setOpenDetails();
      }}
      className={cn(
        `relative  h-fit   px-3 py-2 flex flex-col  items-center justify-between    hover:bg-accent/30  transition-all cursor-pointer  gap-2 text-sm border rounded-lg    `,
        { "px-3 py-[0.4rem] ": !category.image }
      )}
    >
      {category.image ? (
        <img
          src={category.image}
          alt={`${category.name} image`}
          className="  w-28  max-h-24 block  object-contain"
        />
      ) : null}

      <div className="flex items-center  w-full   justify-center gap-2 ">
        <p
          className={cn("    pr-6  text-center", {
            "max-w-[98%]   text-wrap px-3": category.image,
          })}
        >
          {category.name}
        </p>

        <div
          onClick={(e) => e.stopPropagation()}
          className={cn(
            `flex items-center absolute right-1 top-1/2 -translate-y-1/2 `,
            {
              "right-1 top-[unset] -translate-y-[unset] bottom-[0.3rem]":
                category.image,
            }
          )}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className=" p-0 h-7 w-7">
                <EllipsisVertical className=" w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className=" mt-3">
              <DropdownMenuItem onClick={setCatToEdit} className=" gap-2">
                <LayoutTemplate className=" w-4 h-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeleteOpen(true)}
                className=" text-red-700 gap-2  hover:!text-red-700 hover:!bg-destructive/20"
              >
                <X className=" w-4 h-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <Delete
        open={deleteOpen}
        setOpen={setDeleteOpen}
        isDeleting={isDeleting}
        setIsDeleting={setIsDeleting}
        category={category}
      />
    </li>
  );
};

function Delete({
  category,
  open,
  setOpen,
  isDeleting,
  setIsDeleting,
}: {
  category: CategoryProps;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  isDeleting: boolean;
  setIsDeleting: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { toast } = useToast();
  //   const { deleteGeneration, isDeleting } = useDeleteCarGenerations();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    return () => {
      const body = document.querySelector("body");
      if (body) body.style.pointerEvents = "auto";
    };
  }, [open]);
  return (
    <div onClick={(e) => e.stopPropagation()} className=" absolute">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px] border-none">
          <DialogHeader>
            <DialogTitle>
              Delete categroy &apos;{category.name}&apos;
            </DialogTitle>
            <DialogDescription>
              This action can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="   gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button size="sm" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                try {
                  setIsDeleting(true);
                  const { error } = await deleteCategoryAction(category);

                  if (error) throw new Error(error);

                  setOpen?.(false);

                  toast({
                    className: "bg-primary  text-primary-foreground",
                    title: "Deleted.",
                    description: (
                      <SuccessToastDescription message="Car generation has been deleted." />
                    ),
                  });
                } catch (error: any) {
                  toast({
                    variant: "destructive",
                    title: "Something went wrong.",
                    description: (
                      <ErorrToastDescription error={error.message} />
                    ),
                  });
                } finally {
                  setIsDeleting(false);
                }
              }}
            >
              {isDeleting ? <Spinner className=" h-full" /> : "Confrim"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Category;
