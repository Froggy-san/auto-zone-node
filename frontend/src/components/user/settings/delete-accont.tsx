"use client";
import { Button } from "@components/ui/button";
import React from "react";
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

const DeleteAccount = () => {
  return (
    <section className="space-y-5 max-w-[760px] mt-20  w-full p-6 rounded-xl bg-destructive/30  dark:bg-destructive/10 border border-destructive shadow-lg">
      <h2 className=" text-xl sm:text-base font-semibold border-b border-b-destructive pb-2">
        Delete account
      </h2>
      <div className=" flex flex-col  sm:flex-row items-center justify-between gap-5">
        <p className=" dark:text-muted-foreground text-center sm:text-left text-sm">
          Once deleting your account all your data will be lost for ever and
          can&apos;t be retrieved again.
        </p>{" "}
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="destructive"
              size="sm"
              className=" w-full sm:w-fit "
            >
              Delete
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete account</DialogTitle>
              <DialogDescription>
                The decision to delete your account will take effect after 30
                days. You can cancel this deletion at any time before then.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" size="sm">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" size="sm" variant="destructive">
                Save changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default DeleteAccount;
