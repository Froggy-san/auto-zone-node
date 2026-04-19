"use client";
import { cn } from "@lib/utils";
import React, { useState } from "react";
import StatusFormDialog from "./status-form-dialog";
import { Button } from "@components/ui/button";

interface Props {
  className?: string;
}

const StatusManagement = ({ className }: Props) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div
        className={cn(
          "flex  flex-col  gap-y-2 xs:flex-row xs:items-center justify-between rounded-lg border p-3 shadow-sm gap-x-7",
          className
        )}
      >
        <div className="space-y-0.5">
          <label className=" font-semibold">Status</label>
          <p className=" text-muted-foreground text-sm">
            Create a service status badge.
          </p>
        </div>
        <div className="  sm:pr-2">
          <Button
            onClick={() => setOpen((is) => !is)}
            size="sm"
            className=" w-full sm:w-fit"
          >
            Create Service status{" "}
          </Button>
        </div>
      </div>
      <StatusFormDialog open={open} setOpen={setOpen} />
    </>
  );
};

export default StatusManagement;
