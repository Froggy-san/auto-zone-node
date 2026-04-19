import React, { SetStateAction } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ServiceStatusForm from "./service-status-form";
import { ServiceStatus } from "@lib/types";

interface Props {
  open: boolean;
  setOpen: React.Dispatch<SetStateAction<boolean>>;
  statusToEdit?: ServiceStatus;
}
const StatusFormDialog = ({ open, setOpen, statusToEdit }: Props) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className=" max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Service status</DialogTitle>
          <DialogDescription>
            Create and design a service status badge.
          </DialogDescription>
        </DialogHeader>

        <ServiceStatusForm
          open={open}
          setOpen={setOpen}
          statusToEdit={statusToEdit}
        />
      </DialogContent>
    </Dialog>
  );
};

export default StatusFormDialog;
