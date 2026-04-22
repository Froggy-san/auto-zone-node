"use client";
import { Button } from "@components/ui/button";
import React, { useState } from "react";
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
import { User } from "@lib/types";
import { deleteAccountTimerAction } from "@lib/actions/authActions";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@hooks/use-toast";
import SuccessToastDescription, {
  ErorrToastDescription,
} from "@components/toast-items";
import Spinner from "@components/Spinner";
import {
  differenceInDays,
  differenceInSeconds,
  format,
  formatDate,
  formatDistance,
  formatDistanceStrict,
  formatDistanceToNow,
  formatDuration,
  intervalToDuration,
  isPast,
} from "date-fns";
import { DEL_ACC_DAYS } from "@lib/constants";

interface Props {
  userData: {
    isAdmin: boolean;
    isCurrUser: boolean;
    user: User;
  };
}

const DeleteAccount = ({ userData: { isAdmin, isCurrUser, user } }: Props) => {
  // const fromDate2 = new Date();
  // const toDate2 = new Date();
  // toDate2.setDate(fromDate2.getDate() + DEL_ACC_DAYS);

  // console.log(fromDate2, toDate2.toISOString());
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const full_name = user.user_metadata?.full_name || "";
  const userRole = user.user_metadata?.role || "User";
  const deleteDate = user.user_metadata?.deleteDate || "";

  // Date ="Sun Sep 21 2025 08:34:43 GMT+0300 (Eastern European Summer Time)-Mon Sep 22 2025 08:34:43 GMT+0300 (Eastern European Summer Time)"
  const date: string[] = deleteDate !== "" ? deleteDate.split("&") : [];
  const today = new Date();
  const fromDate = new Date(date[0]);
  const toDate = new Date(date[1]);

  const daysRemanining = date.length ? formatDistanceToNow(date[1]) : null;
  const secondsPast =
    toDate && fromDate ? differenceInSeconds(today, fromDate) : 0;
  const totalSeconds =
    toDate && fromDate ? differenceInSeconds(toDate, fromDate) : 0;
  const isDatePast = isPast(toDate);
  const daysLeftPercent = (secondsPast / totalSeconds) * 100;

  console.log(isDatePast);
  async function handleDelete() {
    try {
      setIsLoading(true);
      const { error } = await deleteAccountTimerAction(
        {
          id: user.id,
          username: full_name,
          role: userRole,
          isCurrUser,
        },
        deleteDate
      );

      if (error) throw new Error(error);
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast({
        className: "bg-primary  text-primary-foreground",
        title: `Done.`,
        description: (
          <SuccessToastDescription
            message={
              date.length
                ? "Account deletion has been canceled."
                : `Your account will be deleted in ${DEL_ACC_DAYS} days.`
            }
          />
        ),
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Something went wrong.",
        description: <ErorrToastDescription error={error.message} />,
      });
    } finally {
      setIsLoading(false);
    }
  }

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
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              disabled={isLoading}
              variant={daysRemanining ? "outline" : "destructive"}
              size="sm"
              className=" w-full sm:w-fit relative overflow-hidden "
            >
              {!isDatePast && (
                <span
                  className=" h-full   -skew-x-[20deg]  absolute  bg-destructive animate-pulse    w-full"
                  style={{ left: `${daysLeftPercent - 100}%` }}
                />
              )}
              {daysRemanining && !isDatePast ? (
                <span className=" z-20">{daysRemanining} left</span>
              ) : (
                <span className=" z-20">Delete</span>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete account</DialogTitle>
              <DialogDescription>
                {daysRemanining ? (
                  <span>
                    Your account is {daysRemanining} away from deletion, feel
                    free to cancel it before{" "}
                    <span className=" text-destructive">
                      &apos;{format(toDate, "dd MMM yyy")}&apos;
                    </span>
                  </span>
                ) : (
                  `    The decision to delete your account will take effect after ${DEL_ACC_DAYS}
                days. You can cancel this deletion at any time before then.`
                )}
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" size="sm">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                disabled={isLoading}
                type="submit"
                size="sm"
                variant={date.length ? "secondary" : "destructive"}
                onClick={handleDelete}
              >
                {isLoading ? (
                  <Spinner />
                ) : date.length ? (
                  "Cancel account deletion"
                ) : (
                  "Save changes"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default DeleteAccount;
