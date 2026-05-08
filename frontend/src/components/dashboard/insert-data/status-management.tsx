import { cn } from "@lib/utils"
import React, { useState } from "react"
import StatusFormDialog from "./status-form-dialog"
import { Button } from "@components/ui/button"

interface Props {
  className?: string
}

const StatusManagement = ({ className }: Props) => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <div
        className={cn(
          "flex flex-col justify-between gap-x-7 gap-y-2 rounded-lg border p-3 shadow-sm xs:flex-row xs:items-center",
          className
        )}
      >
        <div className="space-y-0.5">
          <label className="font-semibold">Status</label>
          <p className="text-sm text-muted-foreground">
            Create a service status badge.
          </p>
        </div>
        <div className="sm:pr-2">
          <Button
            onClick={() => setOpen((is) => !is)}
            size="sm"
            className="w-full sm:w-fit"
          >
            Create Service status{" "}
          </Button>
        </div>
      </div>
      <StatusFormDialog open={open} setOpen={setOpen} />
    </>
  )
}

export default StatusManagement
