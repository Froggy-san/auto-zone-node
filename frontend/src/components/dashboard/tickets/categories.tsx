"use client";
import React, { useCallback, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Category from "./category";
import { TicketCategory } from "@lib/types";
import TicketCategoryForm from "./ticket-category-form";
import { Button } from "@components/ui/button";
import { useToast } from "@hooks/use-toast";
import SuccessToastDescription, {
  ErorrToastDescription,
} from "@components/toast-items";
import { deleteTicketCategoryAction } from "@lib/actions/ticket-category-action";

const Categories = ({
  ticketCategories,
}: {
  ticketCategories: TicketCategory[] | null;
}) => {
  const [editCategoryId, setEditCategoryId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<number | null>(null);
  const { toast } = useToast();

  const categoryToEdit = ticketCategories?.find(
    (cat) => cat.id === editCategoryId
  );

  const categoryToDelete = ticketCategories?.find((cat) => cat.id === deleteId);

  const handleDelete = useCallback(async () => {
    try {
      setIsLoading(deleteId);

      if (!deleteId) return;

      const { error } = await deleteTicketCategoryAction(deleteId);

      if (error) throw new Error(error);
      setDeleteId(null);
      toast({
        className: "bg-primary  text-primary-foreground",
        title: "Done.",
        description: (
          <SuccessToastDescription message="Ticket status has been deleted." />
        ),
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: <ErorrToastDescription error={error.message} />,
      });
    } finally {
      setIsLoading(null);
    }
  }, [deleteId]);

  return (
    <div className=" mt-10">
      <h2 className="  font-semibold mb-6 text-xl underline">
        Ticket Categories
      </h2>
      {ticketCategories?.length ? (
        <ul className=" flex max-w-[600px] mx-auto w-full  max-h-[80vh]  sm:max-h-80 overflow-y-auto   gap-2  my-10 flex-wrap">
          {ticketCategories.map((category) => (
            <Category
              key={category.id}
              category={category}
              setEdit={setEditCategoryId}
              isLoading={isLoading === category.id}
              setDeleteId={setDeleteId}
              className=" px-4 py-2 justify-between flex items-center  rounded-[5px]  bg-secondary hover:bg-gray-200/80 text-sm dark:bg-card   dark:hover:bg-card/65 transition-colors    cursor-pointer w-full"
            />
          ))}
        </ul>
      ) : (
        <p className=" text-2xl my-20 w-full text-center font-semibold text-muted-foreground">
          No ticket status were posted.
        </p>
      )}

      <TicketCategoryForm
        // key={editCategoryId}
        isOpen={!!editCategoryId}
        setIsOpen={() => {
          setEditCategoryId(null);
        }}
        ticketCateogyEdit={categoryToEdit}
        showBtn={false}
      />

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete a
              ticket category &apos;{categoryToDelete?.name}&apos;.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className=" gap-y-2">
            <Button variant="secondary" size="sm">
              Cancel{" "}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDelete}
              disabled={!!isLoading}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Categories;
