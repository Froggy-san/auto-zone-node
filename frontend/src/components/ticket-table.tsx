"use client";

import {
  Ticket,
  TicketCategory,
  TicketPriority,
  TicketStatus as TicketStatusType,
} from "@lib/types";
import React, { useCallback, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "date-fns";

import { Priority } from "./priority-select";
import { copyTextToClipboard } from "@lib/client-helpers";
import {
  ArrowDownToLine,
  Check,
  Copy,
  Ellipsis,
  HandPlatter,
  MessagesSquare,
  NotepadTextDashed,
  PackagePlus,
  ReceiptText,
  Replace,
  TicketIcon,
  Ticket as ticketIcon,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "@hooks/use-toast";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  deleteTicketAction,
  editTicketAction,
} from "@lib/actions/tickets-actions";
import SuccessToastDescription, { ErorrToastDescription } from "./toast-items";
import Spinner from "./Spinner";
import { Button } from "./ui/button";
import { FaArrowUpWideShort } from "react-icons/fa6";
import TicketStatus from "./ticket-status";
import TicketForm from "./dashboard/tickets/ticket-form";
import NoteDialog from "./garage/note-dialog";
import { TbFileDescription } from "react-icons/tb";
import ImageView from "./image-view";
import TicketDetails from "./ticket-details";
import { cn } from "@lib/utils";

interface Props {
  tickets: Ticket[];
  ticketStatuses: TicketStatusType[];
  ticketCategories: TicketCategory[];
  ticketPriorities: TicketPriority[];
  isAdmin?: boolean;
}

type Selected = number | null;
type SetSelected = React.Dispatch<React.SetStateAction<Selected>>;
type Open = "edit" | "delete" | "description" | null;
type SetOpen = React.Dispatch<React.SetStateAction<Open>>;
type HandleOpen = (open: Open, selected?: Selected) => void;
const TicketTable = ({
  tickets,
  ticketCategories,
  ticketPriorities,
  ticketStatuses,
  isAdmin = false,
}: Props) => {
  const [open, setOpen] = useState<Open>(null);
  const [selectedId, setSelectedId] = useState<Selected>(null);
  const [isLoading, setIsLoading] = useState<number | false>(false);
  const [image, setImage] = useState<string | null>(null);

  const selectedTicket = tickets.find((ticket) => ticket.id === selectedId);
  const searchParam = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const params = new URLSearchParams(searchParam);

  const handleDetails = useCallback(
    (id: number) => {
      params.set("ticket", String(id));
      router.push(`${pathname}?${params.toString()}`, {
        scroll: false,
      });
    },
    [params, router]
  );
  const handleOpen = useCallback((open: Open, selected?: Selected) => {
    setOpen(open);
    setSelectedId(selected || null);
  }, []);

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
    <div
      className={cn(
        "mt-10 p-3 border rounded-3xl shadow-lg "
        //    {
        //   " max-w-[1200px] mx-auto": !isAdmin,
        // }
      )}
    >
      <Table>
        <TableCaption>A list of the tickets issues.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="text-nowrap min-w-36">SUBJECT</TableHead>
            <TableHead className="text-nowrap  min-w-36">CATEGORY</TableHead>
            <TableHead className="w-[100px] text-nowrap">ID</TableHead>
            {isAdmin && (
              <TableHead className=" min-w-36 text-nowrap">CLIENT</TableHead>
            )}

            <TableHead className="text-nowrap">STATUS</TableHead>
            {isAdmin && <TableHead className="text-nowrap">PRIORITY</TableHead>}
            <TableHead className="text-nowrap">ISSUE DATE</TableHead>
            <TableHead
              className={cn("text-nowrap", { " text-right": !isAdmin })}
            >
              UPDATED AT
            </TableHead>
            {isAdmin && (
              <TableHead className="text-right text-nowrap  w-11 ">
                ASSIGNED TO
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => (
            <Row
              key={ticket.id}
              isAdmin={isAdmin}
              handleDetails={handleDetails}
              ticket={ticket}
              open={open}
              setOpen={setOpen}
              setSelected={setSelectedId}
              isLoading={isLoading === ticket.id}
              handleOpen={handleOpen}
              setImage={setImage}
              setIsLoading={setIsLoading}
              ticketStatuses={ticketStatuses}
              priorities={ticketPriorities}
            />
          ))}
        </TableBody>
      </Table>

      <TicketForm
        showBtn={false}
        isOpen={open === "edit"}
        setIsOpen={() => setOpen(null)}
        ticketToEdit={selectedTicket}
        ticketCategories={ticketCategories}
        ticketPriorities={ticketPriorities}
        ticketStatus={ticketStatuses}
      />

      <NoteDialog
        description={`Viewing the description of the ticket '#${selectedTicket?.id}', client '${selectedTicket?.client?.name}'.`}
        className="hidden"
        title="Description"
        open={open === "description"}
        onOpenChange={() => setOpen(null)}
        content={selectedTicket?.description}
      />

      <DeleteDialog
        open={open === "delete"}
        handleOpen={handleOpen}
        ticket={selectedTicket}
        isLoading={isLoading === selectedId}
        setIsLoading={setIsLoading}
      />
      <ImageView image={image} handleClose={() => setImage(null)} />
      <TicketDetails
        ticket={selectedTicket}
        ticketStatus={ticketStatuses}
        ticketPriorities={ticketPriorities}
      />
    </div>
  );
};

interface RowProps {
  isAdmin: boolean;
  ticket: Ticket;
  ticketStatuses: TicketStatusType[];
  setSelected: SetSelected;
  open: Open;
  setOpen: SetOpen;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<number | false>>;
  handleOpen: HandleOpen;
  setImage: React.Dispatch<React.SetStateAction<string | null>>;
  priorities: TicketPriority[];
  handleDetails: (id: number) => void;
}
function Row({
  ticket,
  ticketStatuses,
  open,
  setOpen,
  isLoading,
  setIsLoading,
  setSelected,
  handleOpen,
  priorities,
  setImage,
  handleDetails,
  isAdmin,
}: RowProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;

    const timer = setTimeout(() => {
      setCopied(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, [copied]);

  async function handleCopy() {
    await copyTextToClipboard(`${ticket.id}`);
    setCopied(true);
  }

  return (
    <TableRow className=" background-transition ">
      <TableCell
        onClick={() => handleDetails(ticket.id)}
        className="  font-semibold underline underline-offset-4 cursor-pointer"
      >
        <p className=" line-clamp-3"> {ticket.subject}</p>
      </TableCell>
      <TableCell>{ticket.ticketCategory_id.name}</TableCell>
      <TableCell>
        <div
          className="font-medium hover:cursor-copy flex items-center justify-start relative"
          onClick={handleCopy}
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.span
                key="copy-logo"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.2, type: "spring" }}
                className=" pl-1"
              >
                <Copy
                  className=" w-[19px] h-[19px]
                "
                />
              </motion.span>
            ) : (
              <motion.span
                key="id"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.2, type: "spring" }}
              >
                {" "}
                <span className=" text-muted-foreground">#</span>
                {ticket.id}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </TableCell>
      {isAdmin && (
        <TableCell>
          <div className=" flex items-center  gap-2">
            {ticket?.client?.picture && (
              <img
                onClick={() => setImage(ticket?.client?.picture || null)}
                src={ticket.client.picture}
                alt="img"
                className=" w-7  h-7 object-cover rounded-full hover:opacity-90 hover:contrast-75 transition-all"
              />
            )}
            <span
              className={cn(" text-nowrap text-sm text-muted-foreground", {
                "text-wrap ": ticket.client && ticket.client.name.length > 10,
              })}
            >
              {ticket.client?.name}
            </span>
          </div>
        </TableCell>
      )}
      <TableCell>
        <TicketStatus ticketStatus={ticket.ticketStatus_id} />
      </TableCell>
      {isAdmin && (
        <TableCell>
          <Priority priority={ticket.ticketPriority_id.name} />
        </TableCell>
      )}
      <TableCell className=" text-nowrap">
        {formatDate(ticket.created_at, "MMMM d, yyyy h:mm aa")}
      </TableCell>
      <TableCell className={cn("text-nowrap", { " text-right": !isAdmin })}>
        {formatDate(ticket.updated_at, "MMMM d, yyyy h:mm aa")}
      </TableCell>
      {isAdmin && (
        <TableCell>
          <div
            className={`text-right flex items-center   gap-2 ${
              !ticket.admin_assigned_to && "text-muted-foreground"
            }`}
          >
            <span>{ticket.admin_assigned_to?.name || "Unassigned"}</span>{" "}
            <TableActions
              ticket={ticket}
              open={open}
              handleDetails={handleDetails}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              handleOpen={handleOpen}
              setOpen={setOpen}
              status={ticketStatuses}
              setSelected={setSelected}
              priorities={priorities}
            />
          </div>
        </TableCell>
      )}
    </TableRow>
  );
}

function TableActions({
  isClientPage,
  isAdmin,
  status,
  ticket,
  currPageSize,
  currPage,
  handleOpen,
  setSelected,
  isLoading,
  setIsLoading,
  handleDetails,
  priorities,
}: {
  ticket: Ticket;
  isClientPage?: boolean;
  open: Open;
  setOpen: SetOpen;
  isAdmin?: boolean;
  setSelected: SetSelected;
  handleOpen: HandleOpen;
  status: TicketStatusType[];
  currPage?: string;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<number | false>>;
  currPageSize?: number;
  handleDetails: (id: number) => void;
  priorities: TicketPriority[];
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const { toast } = useToast();
  // const searchParam = useSearchParams();
  // const pathname = usePathname();
  // const router = useRouter();
  // const params = new URLSearchParams(searchParam);

  const handleChangePriority = async (id: number) => {
    setIsLoading(ticket.id);
    try {
      await editTicketAction({
        ticketPriority_id: id,
        id: ticket.id,
      });

      toast({
        className: "bg-primary  text-primary-foreground",
        title: `Data updated!.`,
        description: (
          <SuccessToastDescription
            message={`Service priority has been uptated.'`}
          />
        ),
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Faild to update the service priority.",
        description: <ErorrToastDescription error={error.message} />,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeStatus = async (id: number) => {
    setIsLoading(ticket.id);
    try {
      const { error } = await editTicketAction({
        id: ticket.id,
        ticketStatus_id: id,
      });

      if (error) throw new Error(error.message);
      // handleClose();
      toast({
        className: "bg-primary  text-primary-foreground",
        title: `Data updated!.`,
        description: (
          <SuccessToastDescription
            message={`Service status has been uptated.'`}
          />
        ),
      });
    } catch (error: any) {
      console.log(error);
      toast({
        variant: "destructive",
        title: "Faild to update the service status.",
        description: <ErorrToastDescription error={error.message} />,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading)
    return (
      <Spinner className="  w-4 h-4 flex items-center  mr-1 justify-center  ml-auto" />
    );

  return (
    <div onClick={(e) => e.stopPropagation()} className=" w-fit ml-auto ">
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="     p-0 h-6 w-6">
            <Ellipsis className=" w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className=" min-w-[200px] mr-5 ">
          {/* <DropdownMenuLabel>My Account</DropdownMenuLabel> */}
          {/* <DropdownMenuSeparator /> */}
          <DropdownMenuItem
            className=" gap-2"
            onClick={(e) => {
              e.stopPropagation();
              handleOpen("edit", ticket.id);
            }}
          >
            <TicketIcon className="w-4 h-4" />
            Edit Ticket
          </DropdownMenuItem>

          <DropdownMenuItem
            disabled={!ticket.description}
            className=" gap-2"
            onClick={(e) => {
              e.stopPropagation();
              handleOpen("description", ticket.id);
            }}
          >
            <TbFileDescription className=" w-4 h-4" /> View description
          </DropdownMenuItem>

          <DropdownMenuSub
          // disabled={isLoading}
          // className=" gap-2"
          // onClick={() => {
          //   setOpen("delete");
          // }}
          >
            <DropdownMenuSubTrigger className=" gap-2">
              {" "}
              <FaArrowUpWideShort /> Change priority
            </DropdownMenuSubTrigger>

            <DropdownMenuPortal>
              <DropdownMenuSubContent className=" max-h-[170px] overflow-y-auto">
                {priorities.length ? (
                  priorities.map((prio) => (
                    <DropdownMenuItem
                      key={prio.id}
                      className=" gap-2 justify-between"
                      onClick={async () => {
                        if (ticket.ticketPriority_id.id === prio.id) return;
                        await handleChangePriority(prio.id);
                      }}
                    >
                      <Priority priority={prio.name} />
                    </DropdownMenuItem>
                  ))
                ) : (
                  <p className=" text-center text-sm text-muted-foreground">
                    No priorities.
                  </p>
                )}

                {/* <DropdownMenuItem
                      key="normal"
                      className=" gap-2 justify-between "
                      onClick={async () => {
                        if (!service.priority) return;
                        await handleChangePriority("");
                      }}
                    >
                      <Priority priority="low" />
                      {!service.priority && <Check className=" w-3 h-3" />}
                    </DropdownMenuItem> */}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className=" gap-2">
              {" "}
              <Replace className=" w-4 h-4" /> Change status
            </DropdownMenuSubTrigger>

            <DropdownMenuPortal>
              <DropdownMenuSubContent className=" max-h-[170px] overflow-y-auto">
                {status.map((status, i) => (
                  <DropdownMenuItem
                    key={i}
                    className=" gap-2 justify-between"
                    onClick={async () => {
                      // setChosenStatus(status.id)
                      // if (status.id === service.serviceStatuses.id) return;
                      await handleChangeStatus(status.id);
                    }}
                  >
                    <TicketStatus
                      ticketStatus={status}
                      className=" py-[.1rem]"
                    />
                    {ticket.ticketStatus_id.id === status.id && (
                      <Check className=" w-3 h-3" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            className=" gap-2  "
            onClick={() => handleDetails(ticket.id)}
          >
            <MessagesSquare className=" w-4 h-4" />
            Address ticket
          </DropdownMenuItem>
          <DropdownMenuItem
            className=" gap-2  !text-red-900  dark:!text-red-300 hover:!bg-destructive/70"
            onClick={(e) => {
              e.stopPropagation();
              handleOpen("delete", ticket.id);
            }}
          >
            <Trash2 className=" w-4 h-4" />
            Delete Ticket
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {/* <ClientForm
        open={open === "edit"}
        handleClose={handleClose}
        client={client}
        />  */}

      {/* <EditServiceForm
            cars={cars}
            clients={clients}
            open={open === "edit"}
            setIsLoading={setIsLoading}
            setOpen={setOpen}
            status={status}
            service={service}
          />

          <DeleteService
            currPage={currPage}
            pageSize={currPageSize}
            service={service}
            isDeleting={isLoading}
            setIsDeleting={setIsLoading}
            open={open === "delete"}
            handleClose={() => setOpen("")}
          /> */}

      {/* <EditReceipt
        open={open === "edit"}
        handleClose={handleClose}
        service={service}
        isDeleting={isLoading}
        setIsDeleting={setIsLoading}
      /> */}
    </div>
  );
}

interface DeleteProps {
  open: boolean;

  handleOpen: HandleOpen;
  ticket?: Ticket;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<number | false>>;
}

function DeleteDialog({
  open,
  handleOpen,

  isLoading,
  setIsLoading,
  ticket,
}: DeleteProps) {
  const { toast } = useToast();

  async function handelDelete() {
    if (!ticket) return;
    setIsLoading(ticket.id);
    try {
      await deleteTicketAction(ticket.id);

      handleOpen(null);
      toast({
        className: "bg-primary  text-primary-foreground",
        title: `Data updated!.`,
        description: (
          <SuccessToastDescription
            message={`Service status has been uptated.'`}
          />
        ),
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Faild to update the service status.",
        description: <ErorrToastDescription error={error.message} />,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => handleOpen(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently a ticket &apos;#
            {ticket?.id}&apos;.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className=" gap-y-2">
          <Button variant="secondary" size="sm">
            Close
          </Button>

          <Button
            size="sm"
            variant="destructive"
            onClick={handelDelete}
            disabled={isLoading}
          >
            {isLoading ? <Spinner /> : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default TicketTable;
