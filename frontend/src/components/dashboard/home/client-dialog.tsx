import { Service } from "@lib/types";
import React, { useReducer, useState } from "react";
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
import { Input } from "@components/ui/input";
import { Switch } from "@components/ui/switch";
import { Checkbox } from "@components/ui/checkbox";
import { Label } from "@components/ui/label";
import { Button } from "@components/ui/button";
import { PackageMinus, Pencil } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@components/ui/tooltip";
import Link from "next/link";

const ClientDialog = ({ service }: { service: Service }) => {
  const client = service.clients;

  return (
    <TooltipProvider delayDuration={500}>
      <Tooltip>
        <TooltipTrigger>
          <Link
            prefetch={false}
            href={`/dashboard/customers?name=${client.name}`}
          >
            {client.name}
          </Link>
        </TooltipTrigger>
        <TooltipContent>View {client.name}&apos;s details.</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ClientDialog;
