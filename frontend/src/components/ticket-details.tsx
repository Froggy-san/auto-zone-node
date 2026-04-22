import {
  EditMessageProps,
  FileWithPreview,
  Message,
  OptimisticAction,
  Ticket,
  TicketHistory,
  TicketHistoryAction,
  TicketPriority,
  TicketStatus as TicketStatusType,
  User,
} from "@lib/types";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useOptimistic,
  useReducer,
} from "react";
import BackBtn from "./products/back-btn";
import { cn } from "@lib/utils";
import { Button } from "./ui/button";
import useTicketById from "@lib/queries/tickets/useTicketById";
import TicketTextField from "./ticket-text-field";
import { ArrowLeft, MailSearch } from "lucide-react";
import Spinner from "./Spinner";
import useMessages from "@lib/queries/tickets/useMessages";
import useCurrUser from "@lib/queries/useCurrUser";
import ErrorMessage from "./error-message";
import { format, formatDistance, formatDistanceToNow } from "date-fns";
import TicketStatus from "./ticket-status";
import useClientById from "@lib/queries/client/useClient";
import TicketMessage from "./ticket-message";
import { AnimatePresence } from "framer-motion";
import { Switch } from "./ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { editTicket } from "@lib/services/ticket";
import SuccessToastDescription, { ErorrToastDescription } from "./toast-items";
import { useToast } from "@hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Action, TicketDetailStates } from "@lib/ticket-details-types";
import useCreateMessage from "@lib/queries/tickets/useCreateMessage";
import ShowTicketHistory from "./show-ticket-history";
import { ActionBadge } from "./dashboard/tickets/action-badge";
import { z } from "zod";
import { useMediaQuery } from "@mui/material";
type ActionType = z.infer<typeof TicketHistoryAction>;
interface TicketDetailsProps {
  ticket?: Ticket;
  className?: string;
  ticketPriorities: TicketPriority[];
  ticketStatus: TicketStatusType[];
}

// Define the threshold for closing (e.g., if dragged down 80 pixels)
// Let's set the CLOSE_DRAG_THRESHOLD to a percentage of the travel distance (e.g., 50% of 90, which is 45)
const CLOSE_DRAG_THRESHOLD = 40; // 45% is half the travel distance
const OPEN_DRAG_THRESHOLD = 70;
const CLOSED_POSITION = 100;
const OPEN_POSITION = 0;
const initalState = {
  positionY: CLOSED_POSITION,
  isDragging: false,
  focusedMessage: null,
  selectedMessageId: null,
  isInternalOnly: false,
  isHistory: false,
  isMounted: false,
  isMessagesOnly: false,
  isLoading: false,
  statusId: undefined,
  failedMessages: [],
};

function reducer(
  state: TicketDetailStates,
  action: Action,
): TicketDetailStates {
  switch (action.type) {
    case "position":
      // The old state destructuring used 'positionY' but the action type was 'position'.
      // Assuming 'position' sets the Y position.
      return { ...state, positionY: action.payload };

    case "is-mounted":
      return { ...state, isMounted: action.payload };

    case "is-dragging":
      // In the original component, setIsDragging was called with a boolean argument.
      // I'll update the reducer to expect a boolean payload for clarity and consistency
      // with how it's used in the refactored component.
      return { ...state, isDragging: action.payload };

    case "set-is-internal-only": // Corresponds to setIsInternalOnly
      return { ...state, isInternalOnly: action.payload };

    case "set-is-messages-only": // Corresponds to setIsMessagesOnly
      return { ...state, isMessagesOnly: action.payload };

    case "set-is-loading": // Corresponds to setIsLoading
      return { ...state, isLoading: action.payload };
    case "set-focused-message":
      return { ...state, focusedMessage: action.payload };

    case "set-is-history":
      return { ...state, isHistory: action.payload };
    case "set-status-id": // Corresponds to setStatusId
      return { ...state, statusId: action.payload };

    case "set-selected-message-id": // Corresponds to setSelectedMessageId
      return { ...state, selectedMessageId: action.payload };
    case "add-failed-message":
      return {
        ...state,
        failedMessages: [...state.failedMessages, action.payload],
      };

    case "remove-failed-message":
      return {
        ...state,
        failedMessages: state.failedMessages.filter(
          (failed) => failed.id !== action.payload.id,
        ),
      };
    case "reset":
      return initalState;

    default:
      return state;
  }
}
const TicketDetails = ({
  ticket,
  ticketStatus,
  ticketPriorities,
  className,
}: TicketDetailsProps) => {
  const [
    {
      positionY,
      selectedMessageId,
      failedMessages,
      statusId,
      focusedMessage,
      isDragging,
      isMounted,
      isHistory,
      isInternalOnly,
      isLoading,
      isMessagesOnly,
    },
    dispatch,
  ] = useReducer(reducer, initalState);

  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const params = new URLSearchParams(searchParams);
  const { toast } = useToast();

  const open = searchParams.get("ticket") ?? undefined;
  const messageId = searchParams.get("messageId") ?? undefined;
  const details = searchParams.get("details") ?? false;
  const isShowHistory = searchParams.get("showHistory") ?? false;
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const startYRef = useRef(0);
  const positionYRef = useRef(CLOSED_POSITION);

  // Get the Ticket's details.
  const {
    ticket: ticketData,
    error,
    isLoading: ticketByIdLoading,
  } = useTicketById(open);

  const {
    messages,
    error: messagesError,
    isMessagesLoading,
  } = useMessages(open);

  const ticketViewed = ticketData;

  const currentStatus = ticketStatus.find(
    (status) => status.id === ticketViewed?.ticketStatus_id.id,
  );
  // Get the currently logged in user.
  const { user, isLoading: userLoading, error: userError } = useCurrUser();

  const isAdmin = user?.user_metadata.role.toLowerCase() === "admin";
  // Get the client that issued the ticket.
  const {
    clientById,
    isLoading: isClientLoading,
    error: clientError,
  } = useClientById({
    id: user?.id || "",
    getBy: "user_id",
  });
  const isMessageAssigned = ticketData?.admin_assigned_to;
  const allMessages = messages ? [...messages, ...failedMessages] : [];
  let filteredMessages = allMessages;

  if (isInternalOnly)
    filteredMessages = allMessages?.filter(
      (messages) => messages.is_internal_note,
    );
  if (isMessagesOnly || !isAdmin)
    filteredMessages = allMessages?.filter(
      (messages) => !messages.is_internal_note,
    );

  // useEffect(() => {
  //   async function ayoo() {
  //     const { ticketHistory, error } = await getTicketHisotry({});
  //     if (error) console.log(error.message);
  //     console.log(ticketHistory, "TICKET HISTORY");
  //   }
  //   ayoo();
  // }, []);
  const [optimisticMessages, dispatchOptimistic] = useOptimistic(
    filteredMessages || [],
    // ... (optimistic reducer logic remains the same) ...
    (
      currentOptimisticMessages: Message[],
      action: OptimisticAction,
    ): Message[] => {
      switch (action.type) {
        case "add":
          // Add the new message, marked as pending
          return [
            ...currentOptimisticMessages,
            { ...action.message, status: "pending" },
          ];

        case "fail":
          // Find the message by its temporary ID and mark it as failed
          return currentOptimisticMessages.map((msg) =>
            msg.id === action.tempId
              ? { ...msg, status: "failed", error: action.error }
              : msg,
          );

        case "succeed":
          return currentOptimisticMessages.filter(
            (msg) => msg.id !== action.tempId,
          );

        case "remove":
          // Manually remove a failed message
          return currentOptimisticMessages.filter(
            (msg) => msg.id !== action.tempId,
          );

        default:
          return currentOptimisticMessages;
      }
    },
  );

  const selectedMessage = optimisticMessages?.find(
    (message) => message.id === selectedMessageId,
  );
  const loading =
    isLoading ||
    userLoading ||
    isMessagesLoading ||
    isClientLoading ||
    ticketByIdLoading;
  const isError =
    !!messagesError?.message.length ||
    !!error?.message.length ||
    !!clientError?.message.length;

  useEffect(() => {
    if (messageId)
      dispatch({ type: "set-focused-message", payload: Number(messageId) });
  }, [messageId]);

  useEffect(() => {
    // Replaced setStatusId with dispatch
    if (ticketViewed) {
      dispatch({
        type: "set-status-id",
        payload: ticketViewed.ticketStatus_id.id,
      });
      dispatch({ type: "is-mounted", payload: true });
    }
  }, [ticketViewed, dispatch]);

  useEffect(() => {
    // Replaced setPositionY with dispatch
    if (open) {
      dispatch({ type: "position", payload: OPEN_POSITION });
    } else {
      dispatch({ type: "position", payload: CLOSED_POSITION });
      dispatch({ type: "reset" });
    }
  }, [open, dispatch]); // Added dispatch to dependency array

  const handleViewDetails = useCallback(
    (ticketId: number, messageId?: number) => {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set("ticket", String(ticketId));
      if (messageId) newSearchParams.set("messageId", `${messageId}`);
      router.push(`${pathname}?${newSearchParams.toString()}`, {
        scroll: false,
      });
    },
    [router, searchParams, pathname],
  );

  const handleRemoveMessageId = useCallback(() => {
    if (!messageId) return;
    params.delete("messageId");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [router, pathname, params]);

  const handleEditTicket = useCallback(
    async ({
      ticketStatus_id,
      message,
      updatedMessageMessage,
    }: {
      ticketStatus_id?: number;
      message?: Message;
      updatedMessageMessage?: EditMessageProps;
    }) => {
      try {
        if (!ticketViewed)
          throw new Error(
            `The ticket data is incomplete please refresh the page.`,
          );
        if (!user || !user)
          throw new Error(
            `Unauthorized action, please make sure that you are logged in.`,
          );

        // const previousStatus = ticketData[0].ticketStatus_id;
        // const isSameStatus = previousStatus.id === ticketStatus_id;
        // const currentChosenStatus = ticketStatus
        //   .find((status) => status.id === ticketStatus_id)
        //   ?.name.toLowerCase();
        // const dateNow = new Date().toISOString();

        // // if(isAdmin)
        // const data: {
        //   ticketStatus_id?: number;
        //   firstResponseTime?: string;
        //   resolveTime?: string;
        //   admin_assigned_to?: string;
        //   updated_at: string;
        // } = {
        //   updated_at: dateNow,
        // };
        // if (isSameStatus && isMessageAssigned && !updateActivity) return; // If status id hasn't changed and the message is already assgined then there is nothing to do.

        // if (!isSameStatus) {
        //   data.ticketStatus_id = ticketStatus_id; // Change the status id if the status id isn't the same.
        //   if (
        //     currentChosenStatus === "solved" ||
        //     currentChosenStatus == "closed"
        //   )
        //     if (!data.resolveTime) data.resolveTime = dateNow; // The the admin closed the ticket then set the resloved time.
        // }
        // if (!ticketViewed.firstResponseTime) data.firstResponseTime = dateNow;

        // if (!data.admin_assigned_to) data.admin_assigned_to = user.user.id;

        // Replaced setIsLoading(true) with dispatch
        dispatch({ type: "set-is-loading", payload: true });
        if (!clientById) throw new Error(`Incomplete data.`);
        await editTicket({
          message,
          messageToEdit: updatedMessageMessage,
          newTicketData: {
            id: ticketViewed.id,
            admin_assigned_to: isAdmin ? clientById.id : null,
            ticketStatus_id: ticketStatus_id,
          },
          oldTicketData: ticketViewed,
          currentUser: user,
          currentClient: clientById,
          ticketStatuses: ticketStatus,
          ticketPriorities: ticketPriorities,
        });

        if (error) throw new Error(error.message);
        queryClient.invalidateQueries({
          queryKey: ["ticketById", String(ticketViewed.id)],
        });
        // toast({
        //   className: "bg-primary text-primary-foreground",
        //   title: `Done.`,
        //   description: (
        //     <SuccessToastDescription message="Ticket status has been updated" />
        //   ),
        // });
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Something went wrong.",
          description: <ErorrToastDescription error={error.message} />,
        });
      } finally {
        // Replaced setIsLoading(false) with dispatch
        dispatch({ type: "set-is-loading", payload: false });
      }
    },
    // statusId is now read from state, but its value is already in ticketStatus_id
    // for the editTicket call. The dependency array is fine.
    [dispatch, statusId, ticketViewed, clientById, queryClient, toast, isAdmin], // Added dispatch, queryClient, toast
  );

  // 1. handleMouseMove (Corrected)
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!startYRef.current) return;

      const deltaY = e.clientY - startYRef.current;

      // 1. Get the last position from the Ref (the last dispatched state value)
      const currentPrevY = positionYRef.current;

      const newPosition = currentPrevY + (deltaY / window.innerHeight) * 100;
      const clampedPosition = Math.max(
        OPEN_POSITION,
        Math.min(CLOSED_POSITION, newPosition),
      );

      // 2. Update the ref for the next move and for handleMouseUp
      positionYRef.current = clampedPosition;

      // 3. Dispatch the calculated position (Action object)
      dispatch({ type: "position", payload: clampedPosition });

      // 4. Update startYRef for the next delta calculation
      startYRef.current = e.clientY;
    },
    [dispatch],
  ); // dispatch is stable, but included for completeness
  // 2. handleMouseUp: Handles the snap decision and cleanup
  const handleMouseUp = useCallback(() => {
    // Replaced setIsDragging(false) with dispatch
    dispatch({ type: "is-dragging", payload: false });

    // Cleanup: Remove the global listeners
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);

    // 💡 FIX: Read the final position from the Ref instead of the stale state value
    const finalPositionY = positionYRef.current;

    // Re-evaluate the snap decision using the actual final position
    if (finalPositionY > CLOSE_DRAG_THRESHOLD) {
      // It was dragged past the threshold, snap closed.

      // Replaced setPositionY(CLOSED_POSITION) with dispatch
      dispatch({ type: "position", payload: CLOSED_POSITION });

      setTimeout(() => {
        params.delete("ticket");
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      }, 500);
    } else {
      // It was NOT dragged past the threshold, snap open.
      // Replaced setPositionY(OPEN_POSITION) with dispatch
      dispatch({ type: "position", payload: OPEN_POSITION });
    }

    startYRef.current = 0;
  }, [handleMouseMove, router, pathname, params, dispatch]); // Added dispatch

  // 3. handleMouseDown: Starts the drag and attaches global listeners
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // 1. Set isDragging state
    dispatch({ type: "is-dragging", payload: true });

    // 2. Set the starting point
    startYRef.current = e.clientY;

    // 3. Critically, set positionYRef to the current visual position
    // This ensures handleMouseMove starts calculation from the current visual point,
    // preventing a jump to CLOSED_POSITION if the state update lagged.
    positionYRef.current = positionY;

    // Attach listeners to the global window
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    e.preventDefault();
  };

  // 1. handleTouchMove (Corrected)
  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!startYRef.current || e.touches.length === 0) return;
      // Prevent the browser from scrolling the background or refreshing
      if (e.cancelable) {
        e.preventDefault();
      }
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startYRef.current;

      // 1. Get the last position from the Ref
      const currentPrevY = positionYRef.current;

      const newPosition = currentPrevY + (deltaY / window.innerHeight) * 100;
      const clampedPosition = Math.max(
        OPEN_POSITION,
        Math.min(CLOSED_POSITION, newPosition),
      );

      // 2. Update the ref for handleTouchEnd
      positionYRef.current = clampedPosition;

      // 3. Dispatch the calculated position (Action object)
      dispatch({ type: "position", payload: clampedPosition });

      // 4. Update the startYRef for the next move calculation
      startYRef.current = currentY;
    },
    [dispatch],
  );

  // 2. handleTouchEnd: Handles the snap decision and cleanup
  const handleTouchEnd = useCallback(() => {
    // Replaced setIsDragging(false) with dispatch
    dispatch({ type: "is-dragging", payload: false });

    // Cleanup: Remove the global listeners
    window.removeEventListener("touchmove", handleTouchMove);
    window.removeEventListener("touchend", handleTouchEnd);

    // 💡 Read the final position from the Ref instead of the stale state value
    const finalPositionY = positionYRef.current;

    // Re-evaluate the snap decision using the actual final position
    if (finalPositionY > CLOSE_DRAG_THRESHOLD) {
      // It was dragged past the threshold, snap closed.
      // Replaced setPositionY(CLOSED_POSITION) with dispatch
      dispatch({ type: "position", payload: CLOSED_POSITION });

      // Perform navigation/param cleanup after a delay (matching handleMouseUp)
      setTimeout(() => {
        params.delete("ticket");
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      }, 500);
    } else {
      // It was NOT dragged past the threshold, snap open.
      // Replaced setPositionY(OPEN_POSITION) with dispatch
      dispatch({ type: "position", payload: OPEN_POSITION });
    }

    startYRef.current = 0;
  }, [handleTouchMove, router, pathname, params, dispatch]); // Added dispatch

  // 3. handleTouchStart: Starts the drag and attaches global listeners
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 0) return;

    // 1. Set isDragging state
    dispatch({ type: "is-dragging", payload: true });

    // 2. Set the starting point
    startYRef.current = e.touches[0].clientY;

    // 3. Set positionYRef to the current visual position
    positionYRef.current = positionY;

    // Attach listeners to the global window
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);

    // Optional: Add e.preventDefault() here if vertical scrolling is an issue during drag start
    // e.preventDefault();
  };

  const handleScrollContainer = useCallback(() => {
    setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.scrollTo({
          top: containerRef.current.scrollHeight,
          behavior: "smooth",
        });
      }

      if (inputRef.current) {
        const inputElement = inputRef.current;
        inputElement.focus();

        // FIX: Set cursor to the end
        const textLength = inputElement.value.length;
        inputElement.setSelectionRange(textLength, textLength);
      }
    }, 220);
  }, [containerRef, inputRef]); // Add refs as dependencies if they can change

  useEffect(() => {
    if (selectedMessage) handleScrollContainer();
  }, [selectedMessage, handleScrollContainer]);

  const handleOpen = useCallback(
    (open: boolean) => {
      dispatch({ type: "set-is-history", payload: open });
    },
    [dispatch],
  );
  // Replaced openDrawer with dispatch
  const openDrawer = () =>
    dispatch({ type: "position", payload: OPEN_POSITION });

  return (
    <div
      ref={containerRef}
      className={cn(
        "w-full h-full overflow-y-auto  fixed left-0 top-0 transition-all ease-out duration-700 bg-background sm:border overflow-x-hidden  z-50  overscroll-contain ",
        { "overflow-hidden": isDragging },
        className,
      )}
      style={{
        transform: `translateY(${positionY}%)`,

        // Disable transition during drag for smooth tracking
        transition: isDragging ? "none" : undefined,
      }}
    >
      <div
        className={cn(
          "h-10 w-full flex justify-center items-center cursor-grab  touch-none",
          isDragging ? "cursor-grabbing" : "cursor-grab",
        )}
        onTouchStart={handleTouchStart}
        onMouseDown={handleMouseDown}
        onDragStart={(e) => e.preventDefault()}
      >
        <div className="w-10 h-1 bg-gray-300 rounded-full" />
      </div>

      <Button
        variant="secondary"
        size="sm"
        onClick={(e) => {
          // Replaced setPositionY(CLOSED_POSITION) with dispatch
          dispatch({ type: "position", payload: CLOSED_POSITION });
          setTimeout(() => {
            router.back();
          }, 700);
        }}
        className={cn(" ml-4 group")}
      >
        <ArrowLeft className=" icon w-4 h-4 sm:w-6 sm:h-6 group-hover:-translate-x-1 transition-all" />
      </Button>

      {/* {open && isLoading && <Spinner size={30} />} */}
      {open && loading && !isMounted ? (
        <Spinner size={30} />
      ) : isError ? (
        <>
          {error && (
            <p className=" text-lg text-muted-foreground w-full text-center">
              {error.message}
            </p>
          )}
          {messagesError && (
            <ErrorMessage>
              {" "}
              <p className=" text-center">{messagesError.message}</p>
            </ErrorMessage>
          )}

          {clientError && (
            <ErrorMessage>
              {" "}
              <p className=" text-center">{clientError.message}</p>
            </ErrorMessage>
          )}
        </>
      ) : !clientById ? (
        <ErrorMessage>
          Something went wrong while getting the client&apos;s data.
        </ErrorMessage>
      ) : (
        <>
          <div className="p-4">
            <h2 className="text-xl font-bold">Ticket Details</h2>
          </div>

          {/*          */}
          <div className=" flex  flex-col md:flex-row mt-14">
            <main
              className={cn(
                " flex flex-col   sm:flex-row  flex-1  max-w-[1000px] mx-auto gap-10  px-4 md:px-10  ",
                { " md:flex-col lg:flex-row": isHistory },
              )}
            >
              <div>
                <div className=" sm:sticky top-5">
                  <div className=" space-y-6 mb-20 text-sm">
                    <div className=" space-y-2">
                      <p className=" text-muted-foreground ">TICKET ID</p>
                      <p className=" font-semibold">#{ticketViewed?.id}</p>
                    </div>

                    <div className=" space-y-2">
                      <p className=" text-muted-foreground">CREATED AT</p>
                      <p className=" font-semibold">
                        {" "}
                        {ticketViewed &&
                          format(
                            ticketViewed.created_at,
                            "MMMM d, yyyy h:mm aa",
                          )}
                      </p>
                    </div>

                    <div className=" space-y-2">
                      <p className=" text-muted-foreground text-nowrap">
                        LAST ACTIVITY
                      </p>
                      <p className=" font-semibold">
                        {" "}
                        {ticketViewed &&
                          formatDistanceToNow(ticketViewed.updated_at) + ` ago`}
                      </p>
                    </div>
                    {isAdmin && ticketData && (
                      <>
                        {ticketData.firstResponseTime && (
                          <div className=" space-y-2">
                            <p className=" text-muted-foreground text-nowrap">
                              FIRST RESPONSE TIME
                            </p>
                            <p className=" font-semibold">
                              {format(
                                ticketData.firstResponseTime,
                                "MMMM d, yyyy h:mm aa",
                              )}
                              {/* {ticketData &&
                              formatDistance(
                                ticketViewed.updated_at,
                                ticketViewed.firstResponseTime
                              ) + ` ago`} */}
                            </p>
                          </div>
                        )}

                        {ticketData.resolveTime && (
                          <div className=" space-y-2">
                            <p className=" text-muted-foreground text-nowrap">
                              RESOLVED AT
                            </p>
                            <p className=" font-semibold text-primary">
                              {" "}
                              {format(
                                ticketData.resolveTime,
                                "MMMM d, yyyy h:mm aa",
                              )}
                              {/* {ticketData &&
                              formatDistance(
                                ticketViewed.updated_at,
                                ticketViewed.resolveTime
                              ) + ` ago`} */}
                            </p>
                          </div>
                        )}
                      </>
                    )}

                    <div className=" space-y-2">
                      <p className=" text-muted-foreground">STATUS</p>
                      <p className=" ">
                        {ticketData && (
                          <TicketStatus
                            ticketStatus={ticketData.ticketStatus_id}
                          />
                        )}
                      </p>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className=" p-3 space-y-6 rounded-xl bg-accent/30 ">
                      <div className=" flex gap-2">
                        <Switch
                          id="is-internal-only"
                          checked={isInternalOnly}
                          onCheckedChange={(value) => {
                            // Replaced setIsInternalOnly(value) with dispatch
                            dispatch({
                              type: "set-is-internal-only",
                              payload: value,
                            });
                            // Replaced setIsMessagesOnly(false) with dispatch
                            dispatch({
                              type: "set-is-messages-only",
                              payload: false,
                            });
                          }}
                        />{" "}
                        <label
                          htmlFor="is-internal-only"
                          className=" text-xs text-muted-foreground "
                        >
                          Internal messages only
                        </label>
                      </div>
                      <div className=" flex gap-2">
                        <Switch
                          id="is-visible-only"
                          checked={isMessagesOnly}
                          onCheckedChange={(value) => {
                            // Replaced setIsMessagesOnly(value) with dispatch
                            dispatch({
                              type: "set-is-messages-only",
                              payload: value,
                            });
                            // Replaced setIsInternalOnly(false) with dispatch
                            dispatch({
                              type: "set-is-internal-only",
                              payload: false,
                            });
                          }}
                        />{" "}
                        <label
                          htmlFor="is-visible-only"
                          className=" text-xs text-muted-foreground "
                        >
                          Visible messages only
                        </label>
                      </div>

                      <Select
                        // key={statusId}
                        disabled={isLoading}
                        value={String(statusId) || undefined}
                        onValueChange={async (value) => {
                          // Replaced setStatusId(Number(value)) with dispatch
                          dispatch({
                            type: "set-status-id",
                            payload: Number(value),
                          });
                          await handleEditTicket({
                            ticketStatus_id: Number(value),
                          });
                        }}
                      >
                        <SelectTrigger className="w-full h-fit gap-2">
                          <SelectValue placeholder="Ticket Status" />
                        </SelectTrigger>
                        <SelectContent>
                          {ticketStatus.length ? (
                            ticketStatus.map((status) => (
                              <SelectItem
                                key={status.id}
                                value={`${status.id}`}
                              >
                                <TicketStatus
                                  ticketStatus={status}
                                  // className=" text-wrap"
                                />
                              </SelectItem>
                            ))
                          ) : (
                            <p className=" text-muted-foreground text-center w-full">
                              No ticket status
                            </p>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>
              <div className=" w-full ">
                <div className=" pb-5 border-b">
                  <h2 className=" text-xl font-semibold mb-4">
                    {ticketData?.subject}
                  </h2>
                  <p className=" text-sm"> {ticketData?.description}</p>
                </div>

                {optimisticMessages && (
                  <Messages
                    messageId={messageId}
                    focusedMessage={focusedMessage}
                    messages={optimisticMessages}
                    selectedMessageId={selectedMessageId}
                    handleRemoveMessageId={handleRemoveMessageId}
                    handleScrollContainer={handleScrollContainer}
                    setFocusedMessage={(id: number | null) =>
                      dispatch({ type: "set-focused-message", payload: id })
                    }
                    removeFailedMessage={(message: Message) =>
                      dispatch({
                        type: "remove-failed-message",
                        payload: message,
                      })
                    }
                    setSelectedMessageId={(id) =>
                      dispatch({ type: "set-selected-message-id", payload: id })
                    }
                    currentUser={user}
                    isDragging={isDragging}
                  />
                )}

                {!currentStatus ||
                currentStatus.name.toLowerCase() === "solved" ||
                currentStatus.name.toLowerCase() === "closed" ? null : (
                  <TicketTextField
                    // key={open}
                    open={open}
                    isDragging={isDragging}
                    textAreaRef={inputRef}
                    handleScrollContainer={handleScrollContainer}
                    dispatchOptimistic={dispatchOptimistic}
                    handleEditTicket={handleEditTicket}
                    ticketStatus={ticketStatus}
                    addFailedMessage={(message) =>
                      dispatch({ type: "add-failed-message", payload: message })
                    }
                    setSelectedMessageId={(id) =>
                      dispatch({ type: "set-selected-message-id", payload: id })
                    }
                    containerRef={containerRef}
                    currentUser={user}
                    clientById={clientById}
                    ticket={ticketData || undefined}
                    messageToEdit={selectedMessage}
                    className={
                      !ticketViewed ||
                      ticketViewed.ticketStatus_id.name.toLowerCase() ===
                        "close"
                        ? "opacity-75 pointer-events-none"
                        : ""
                    }
                  />
                )}
                <div className="pb-32" />
              </div>
            </main>
            {ticketData && isAdmin && (
              <ShowTicketHistory
                internalActivity
                ticket={ticketData}
                isOpen={isHistory}
                selectedMessage={selectedMessage}
                handleSelectMessage={(id: number | null) =>
                  dispatch({ type: "set-focused-message", payload: id })
                }
                handleFocusMessage={(messageId: number | null) => {
                  handleRemoveMessageId();
                  dispatch({ type: "set-focused-message", payload: messageId });
                }}
                handleViewDetails={handleViewDetails}
                setIsOpen={handleOpen}
                ticketPriorities={ticketPriorities}
                ticketStatuses={ticketStatus}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TicketDetails;

function Messages({
  messages,
  messageId,
  currentUser,
  isDragging,
  selectedMessageId,
  removeFailedMessage,
  focusedMessage,
  handleScrollContainer,
  ticketHistory,
  handleRemoveMessageId,
  setSelectedMessageId,
  setFocusedMessage,
}: {
  messageId?: string;
  messages: Message[];
  focusedMessage: number | null;
  selectedMessageId: number | null;
  ticketHistory?: TicketHistory[];
  currentUser?: User | null;
  isDragging?: boolean;
  setFocusedMessage: (id: number | null) => void;
  handleRemoveMessageId: () => void;
  removeFailedMessage: (message: Message) => void;
  handleScrollContainer: () => void;
  setSelectedMessageId: (id: number | null) => void;
}) {
  const [messagesLoadingIds, setMessagesLoadingIds] = useState<number[]>([]);
  const { createMessage, isLoading } = useCreateMessage();
  const messageRefs = useRef<Record<string, HTMLDivElement>>({});
  const isBigScreen = useMediaQuery(`(min-width: 640px)`);
  const { toast } = useToast();

  const currentUserRole = currentUser?.user_metadata.role || "client";

  // 3. Define a function to set the ref for each message element
  const setRef = useCallback((el: HTMLDivElement | null, messageId: number) => {
    if (el) {
      // Store the element reference using its ID as the key
      messageRefs.current[messageId] = el;
    } else {
      // Cleanup on unmount
      delete messageRefs.current[messageId];
    }
  }, []);

  useEffect(() => {
    if (focusedMessage || messageId) {
      // 1. Get the actual DOM element reference
      const targetElement =
        messageRefs.current[messageId || String(focusedMessage)];

      if (targetElement) {
        // 2. Use the native browser method to scroll
        targetElement.scrollIntoView({
          behavior: "smooth", // Optional: provides a smooth animation
          block: isBigScreen ? "center" : "start", // Scrolls the target to the center of the viewport
        });
        // handleRemoveMessageId();
      }
    }
  }, [focusedMessage, messageId, isBigScreen]); // Run this effect whenever the target ID changes
  const handleResend = useCallback(
    async (message: Message) => {
      try {
        if (!message.client || !currentUser) return;

        setMessagesLoadingIds((prev) => [...prev, message.id]);
        const data = {
          content: message.content,
          is_internal_note: message.is_internal_note,
          senderType: currentUserRole,
          ticket_id: message.ticket_id,
          senderId: message.senderId,
          client_id: message.client_id,
        };

        const files = message.attachments.length
          ? message.attachments.map(
              (attachment) => attachment.file as FileWithPreview,
            )
          : [];
        const realMessage = await createMessage({
          data,
          files: files,
          client: message.client,
        });

        if (files.length) {
          files.forEach((file) => URL.revokeObjectURL(file.preview));
        }
        removeFailedMessage(message);
      } catch (error: any) {
        // 4. On Error: Mark optimistic message as failed and Show Toast
        console.error("Message creation failed:", error);

        // Show the toast notification manually here
        toast({
          variant: "destructive",
          title: "Failed to send message.",
          description: <ErorrToastDescription error={error.message} />,
        });
      } finally {
        setMessagesLoadingIds((prev) => prev.filter((id) => id !== message.id));
      }
    },
    [removeFailedMessage, setMessagesLoadingIds],
  );
  return (
    <div className=" mb-6">
      <AnimatePresence>
        {messages.map((message) => (
          <TicketMessage
            key={message.id}
            ref={(el) => setRef(el, message.id)}
            isFocused={focusedMessage === message.id}
            setFocusedMessage={setFocusedMessage}
            isRetrying={messagesLoadingIds.includes(message.id)}
            isDragging={isDragging}
            isSelected={selectedMessageId === message.id}
            message={message}
            currentUser={currentUser}
            handleSelect={() => {
              if (message.id === selectedMessageId) {
                setSelectedMessageId(null);
              } else {
                setSelectedMessageId(message.id);
                // handleScrollContainer();
              }
            }}
            handleRemoveMessageId={handleRemoveMessageId}
            handleResend={handleResend}
          />
        ))}
      </AnimatePresence>
      {/* <ChangesSeparator action="solved" /> */}
    </div>
  );
}

function ChangesSeparator({ action }: { action: ActionType }) {
  return (
    <div className="   bg-border my-6 relative  h-[1px] w-full ">
      <ActionBadge
        action={action}
        className=" absolute left-1/2 top-1/2  -translate-x-1/2 -translate-y-1/2 z-30"
      />
    </div>
  );
}
// ! OLD CODE

// import { Ticket } from "@lib/types";
// import { usePathname, useRouter, useSearchParams } from "next/navigation";

// import React, { useState, useRef, useCallback } from "react";
// import BackBtn from "./products/back-btn";
// import { cn } from "@lib/utils";
// import { Button } from "./ui/button";

// interface TicketDetailsProps { // Renamed from TicketDetails to avoid conflict with the component name
//   Ticket?: Ticket;
//   className?: string;
// }

// Define the threshold for closing (e.g., if dragged down 50 pixels)
// const CLOSE_DRAG_THRESHOLD = 80;
// // Define the fully closed position (which is 100% off-screen or similar)
// const CLOSED_POSITION = 90;
// // Define the fully open position
// const OPEN_POSITION = 0;

// const TicketDetails = ({ Ticket, className }: TicketDetailsProps) => {
//   const [positionY, setPositionY] = useState(CLOSED_POSITION); // Start closed
//   const [isDragging, setIsDragging] = useState(false);
//   const startYRef = useRef(0); // Use a ref to store the start Y position across renders

//   const router = useRouter();
//   // ... other unused hooks (pathname, searchParams, path) ...

//   const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
//     setIsDragging(true);
//     startYRef.current = e.clientY; // Store the initial Y position of the cursor/touch
//     e.currentTarget.style.transition = 'none'; // Disable transition during drag for smooth movement
//   }, []);

//   const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
//     if (!isDragging) return;

//     // Calculate the difference in Y position from the start
//     const deltaY = e.clientY - startYRef.current;

//     // Calculate the new percentage position
//     // deltaY is in pixels, we need to convert it to a percentage change for positionY
//     // A simple approximation: positionY + (deltaY / window.innerHeight * 100)
//     // A better approach is to directly set positionY based on the new cursor Y position relative to the screen,
//     // but for simple drawer movement, let's use the delta and the component's height.

//     // A simpler and more direct approach: just translate by the delta Y in pixels,
//     // but since the component uses transform: translateY(${positionY}%), we'll stick to percentage logic.

//     // For a smooth drag, let's update the percentage directly:
//     const newPosition = positionY + (deltaY / window.innerHeight) * 100;

//     // Keep the drawer's top position between the OPEN_POSITION and CLOSED_POSITION
//     // We only want to drag **down** from the open position (0%)
//     if (newPosition >= OPEN_POSITION && newPosition <= CLOSED_POSITION) {
//         setPositionY(newPosition);
//     }

//     // Update the starting Y position for the *next* move event
//     startYRef.current = e.clientY;
//   }, [isDragging, positionY]);

//   const handleMouseUp = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
//     if (!isDragging) return;
//     setIsDragging(false);
//     e.currentTarget.style.transition = ''; // Re-enable transition for the snap back/close

//     // Check if the drawer was dragged past the close threshold
//     if (positionY > CLOSE_DRAG_THRESHOLD) {
//       // Close the drawer if dragged far enough
//       setPositionY(CLOSED_POSITION);
//     } else {
//       // Snap back to the open position
//       setPositionY(OPEN_POSITION);
//     }
//   }, [isDragging, positionY]);

//   // A helper function to open the drawer
//   const openDrawer = () => setPositionY(OPEN_POSITION);

//   return (
//     <div
//       onMouseDown={handleMouseDown}
//       onMouseMove={handleMouseMove}
//       onMouseUp={handleMouseUp}
//       onMouseLeave={handleMouseUp} // Also handle mouse leaving the element while dragging
//       className={cn(
//         "w-full h-full fixed left-0 top-0 transition-all ease-out bg-background border-4 z-50",
//         className,
//         // Optional: Add a class to change the cursor when dragging is possible
//         isDragging ? 'cursor-grabbing' : 'cursor-grab'
//       )}
//       // Apply the current position state
//       style={{ transform: `translateY(${positionY}%)` }}
//     >
//       <div
//         // A draggable handle area at the top makes for a better UX
//         className="h-10 w-full flex justify-center items-center cursor-grab"
//         // Ensure dragging only affects the position and not selection
//         onDragStart={(e) => e.preventDefault()}
//       >
//         <div className="w-10 h-1 bg-gray-300 rounded-full" />
//       </div>

//       <BackBtn />
//       <Button onClick={openDrawer}> Open Drawer</Button>

//       {/* Drawer Content Goes Here */}
//       <div className="p-4">
//           <h2 className="text-xl font-bold">Ticket Details</h2>
//           <p>Ticket ID: {Ticket?.id}</p>
//           {/* ... more ticket details ... */}
//       </div>
//     </div>
//   );
// };

// export default TicketDetails;

// ! ---------------------------

// const TicketDetails = ({
//   ticket,
//   ticketStatus,
//   className,
// }: TicketDetailsProps) => {
//   // const [
//   //   {
//   //     positionY,
//   //     selectedMessageId,
//   //     failedMessages,
//   //     statusId,
//   //     isDragging,
//   //     isInternalOnly,
//   //     isLoading,
//   //     isMessagesOnly,
//   //   },
//   //   dispatch,
//   // ] = useReducer(reducer, initalState);
//   const [positionY, setPositionY] = useState(CLOSED_POSITION);
//   const [isDragging, setIsDragging] = useState(false);

//   const [selectedMessageId, setSelectedMessageId] = useState<number | null>(
//     null
//   );
//   const [isInternalOnly, setIsInternalOnly] = useState(false);
//   const [isMessagesOnly, setIsMessagesOnly] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [statusId, setStatusId] = useState<number | undefined>(undefined);
//   const [failedMessages, setFailedMessages] = useState<Message[]>([]);

//   const queryClient = useQueryClient();
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const pathname = usePathname();
//   const params = new URLSearchParams(searchParams);
//   const { toast } = useToast();

//   const open = searchParams.get("ticket") || undefined;

//   const containerRef = useRef<HTMLDivElement>(null);
//   const startYRef = useRef(0);
//   const positionYRef = useRef(CLOSED_POSITION);

//   // Get the Ticket's details.
//   const {
//     ticket: ticketData,
//     error,
//     isLoading: ticketByIdLoading,
//   } = useTicketById(open);
//   const {
//     messages,
//     error: messagesError,
//     isMessagesLoading,
//   } = useMessages(open);

//   const allMessages = messages ? [...messages, ...failedMessages] : [];
//   let filteredMessages = allMessages;

//   if (isInternalOnly)
//     filteredMessages = allMessages?.filter(
//       (messages) => messages.is_internal_note
//     );
//   if (isMessagesOnly)
//     filteredMessages = allMessages?.filter(
//       (messages) => !messages.is_internal_note
//     );

//   const [optimisticMessages, dispatchOptimistic] = useOptimistic(
//     filteredMessages || [],
//     (
//       currentOptimisticMessages: Message[],
//       action: OptimisticAction
//     ): Message[] => {
//       switch (action.type) {
//         case "add":
//           // Add the new message, marked as pending
//           return [
//             ...currentOptimisticMessages,
//             { ...action.message, status: "pending" },
//           ];

//         case "fail":
//           // Find the message by its temporary ID and mark it as failed
//           return currentOptimisticMessages.map((msg) =>
//             msg.id === action.tempId
//               ? { ...msg, status: "failed", error: action.error }
//               : msg
//           );

//         case "succeed":
//           return currentOptimisticMessages.filter(
//             (msg) => msg.id !== action.tempId
//           );

//         // Find the message by temp ID and replace it with the real message
//         // return currentOptimisticMessages.map((msg) =>
//         //   msg.id === action.tempId ? action.realMessage : msg
//         // );

//         case "remove":
//           // Manually remove a failed message
//           return currentOptimisticMessages.filter(
//             (msg) => msg.id !== action.tempId
//           );

//         default:
//           return currentOptimisticMessages;
//       }
//     }
//   );
//   const selectedMessage = optimisticMessages?.find(
//     (message) => message.id === selectedMessageId
//   );

//   const ticketViewed = ticketData;

//   // Get the currently logged in user.
//   const { user, isLoading: userLoading, error: userError } = useCurrUser();

//   const isAdmin = user?.user_metadata.role.toLowerCase() === "admin";
//   // Get the client that issued the ticket.
//   const {
//     clientById,
//     isLoading: isClientLoading,
//     error: clientError,
//   } = useClientById({
//     id: user?.id || "",
//     getBy: "user_id",
//   });

//   const loading =
//     isLoading ||
//     userLoading ||
//     isMessagesLoading ||
//     isClientLoading ||
//     ticketByIdLoading;
//   const isError =
//     !!messagesError?.message.length ||
//     !!error?.message.length ||
//     !!clientError?.message.length;

//   useEffect(() => {
//     setStatusId(ticketData.ticketStatus_id.id);
//   }, [ticketData]);

//   useEffect(() => {
//     if (open) {
//       setPositionY(OPEN_POSITION);
//     } else {
//       setPositionY(CLOSED_POSITION);
//     }
//   }, [open]);
//   const handleEditTicket = useCallback(
//     async (ticketStatus_id: number) => {
//       try {
//         if (!ticketData)
//           throw new Error("Something went wrong, refresh the page.");

//         setIsLoading(true);
//         await editTicket({ id: ticketViewed.id, ticketStatus_id });
//         // const { error } = await editTicketAction({
//         //   id: ticketData[0].id,
//         //   ticketStatus_id,
//         // });
//         if (error) throw new Error(error.message);
//         queryClient.invalidateQueries(["ticketById", String(ticketData[0].id)]);
//         toast({
//           className: "bg-primary  text-primary-foreground",
//           title: `Done.`,
//           description: (
//             <SuccessToastDescription message="Ticket status has been updated" />
//           ),
//         });
//       } catch (error: any) {
//         toast({
//           variant: "destructive",
//           title: "Something went wrong.",
//           description: <ErorrToastDescription error={error.message} />,
//         });
//       } finally {
//         setIsLoading(false);
//       }
//     },
//     [statusId, ticketData]
//   );

//   // 1. handleMouseMove: Uses functional update for smooth dragging (Dependency array is empty)
//   const handleMouseMove = useCallback((e: MouseEvent) => {
//     if (!startYRef.current) return;

//     const deltaY = e.clientY - startYRef.current;

//     setPositionY((prevY) => {
//       const newPosition = prevY + (deltaY / window.innerHeight) * 100;
//       const clampedPosition = Math.max(
//         OPEN_POSITION,
//         Math.min(CLOSED_POSITION, newPosition)
//       );

//       // 💡 Update the ref here so handleMouseUp gets the latest value
//       positionYRef.current = clampedPosition;

//       return clampedPosition;
//     });

//     startYRef.current = e.clientY;
//   }, []); // Dependency array remains empty
//   // 2. handleMouseUp: Handles the snap decision and cleanup
//   // Note: We MUST read the final positionY here to make the snap decision.
//   const handleMouseUp = useCallback(() => {
//     setIsDragging(false);

//     // Cleanup: Remove the global listeners
//     window.removeEventListener("mousemove", handleMouseMove);
//     window.removeEventListener("mouseup", handleMouseUp);

//     // 💡 FIX: Read the final position from the Ref instead of the stale state value
//     const finalPositionY = positionYRef.current;

//     // Re-evaluate the snap decision using the actual final position
//     if (finalPositionY > CLOSE_DRAG_THRESHOLD) {
//       // It was dragged past the threshold, snap closed.

//       setPositionY(CLOSED_POSITION);

//       // Ensure you have access to params, router, and pathname for this part to work
//       // Note: I'm assuming you have access to these from the outer scope,
//       // as they are not defined in the provided snippet.
//       // If not, you may need to pass them or define them inside the component scope.
//       setTimeout(() => {
//         params.delete("ticket");
//         router.push(`${pathname}?${params.toString()}`, { scroll: false });
//       }, 500);
//     } else {
//       // It was NOT dragged past the threshold, snap open.
//       setPositionY(OPEN_POSITION);
//     }

//     startYRef.current = 0;
//   }, [handleMouseMove, router, pathname, params]); // 💡 positionY is removed from dependencies!// positionY is required here for the final snap check.

//   // 3. handleMouseDown: Starts the drag and attaches global listeners
//   const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
//     setIsDragging(true);
//     startYRef.current = e.clientY;

//     // Attach listeners to the global window
//     window.addEventListener("mousemove", handleMouseMove);
//     window.addEventListener("mouseup", handleMouseUp);

//     e.preventDefault();
//   };

//   // Assuming the following are defined in your component's scope:
//   // const startYRef = useRef(0);
//   // const positionYRef = useRef(OPEN_POSITION); // Assuming OPEN_POSITION is defined
//   // const setPositionY = (update: (prevY: number) => number | number) => {}; // State setter
//   // const setIsDragging = (is: boolean) => {}; // State setter
//   // const router, params, pathname, OPEN_POSITION, CLOSED_POSITION, CLOSE_DRAG_THRESHOLD are available.

//   // 1. handleTouchMove: Uses functional update for smooth dragging (Dependency array is empty)
//   const handleTouchMove = useCallback((e: TouchEvent) => {
//     // Ensure a touch point exists (standard for a single-touch drag)
//     if (!startYRef.current || e.touches.length === 0) return;

//     // Use clientY from the first touch point
//     const currentY = e.touches[0].clientY;
//     const deltaY = currentY - startYRef.current;

//     setPositionY((prevY) => {
//       // Convert delta to percentage of viewport height
//       const newPosition = prevY + (deltaY / window.innerHeight) * 100;
//       // Clamp the position between the allowed min (OPEN) and max (CLOSED)
//       const clampedPosition = Math.max(
//         OPEN_POSITION,
//         Math.min(CLOSED_POSITION, newPosition)
//       );

//       // 💡 Update the ref here so handleTouchEnd gets the latest value
//       positionYRef.current = clampedPosition;

//       return clampedPosition;
//     });

//     // Update the startYRef for the next move calculation
//     startYRef.current = currentY;
//   }, []); // Dependency array remains empty

//   // 2. handleTouchEnd: Handles the snap decision and cleanup
//   const handleTouchEnd = useCallback(() => {
//     setIsDragging(false);

//     // Cleanup: Remove the global listeners
//     window.removeEventListener("touchmove", handleTouchMove);
//     window.removeEventListener("touchend", handleTouchEnd);

//     // 💡 Read the final position from the Ref instead of the stale state value
//     const finalPositionY = positionYRef.current;

//     // Re-evaluate the snap decision using the actual final position
//     if (finalPositionY > CLOSE_DRAG_THRESHOLD) {
//       // It was dragged past the threshold, snap closed.
//       setPositionY(CLOSED_POSITION);

//       // Perform navigation/param cleanup after a delay (matching handleMouseUp)
//       setTimeout(() => {
//         params.delete("ticket");
//         router.push(`${pathname}?${params.toString()}`, { scroll: false });
//       }, 500);
//     } else {
//       // It was NOT dragged past the threshold, snap open.
//       setPositionY(OPEN_POSITION);
//     }

//     startYRef.current = 0;
//   }, [handleTouchMove, router, pathname, params]);

//   // 3. handleTouchStart: Starts the drag and attaches global listeners
//   const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
//     // Only proceed if there is at least one touch point
//     if (e.touches.length === 0) return;

//     setIsDragging(true);
//     // Use clientY from the first touch point
//     startYRef.current = e.touches[0].clientY;

//     // Attach listeners to the global window
//     window.addEventListener("touchmove", handleTouchMove);
//     window.addEventListener("touchend", handleTouchEnd);

//     // We typically don't preventDefault here unless the drag direction conflicts with native scrolling.
//     // For vertical-only drag, you might need to call e.preventDefault() conditionally inside handleTouchMove
//     // to prevent the entire page from scrolling while dragging the component.
//   };
//   const openDrawer = () => setPositionY(OPEN_POSITION);

//   return (
//     <div
//       ref={containerRef}
//       className={cn(
//         "w-full h-full overflow-y-auto pb-32 fixed left-0 top-0 transition-all ease-out duration-700 bg-background border overflow-x-hidden   z-50",
//         className
//       )}
//       style={{
//         transform: `translateY(${positionY}%)`,
//         // Disable transition during drag for smooth tracking
//         transition: isDragging ? "none" : undefined,
//       }}
//     >
//       <div
//         className={cn(
//           "h-10 w-full flex justify-center items-center cursor-grab ",
//           isDragging ? "cursor-grabbing" : "cursor-grab"
//         )}
//         onTouchStart={handleTouchStart}
//         onMouseDown={handleMouseDown}
//         onDragStart={(e) => e.preventDefault()}
//       >
//         <div className="w-10 h-1 bg-gray-300 rounded-full" />
//       </div>

//       <Button
//         variant="secondary"
//         size="sm"
//         onClick={(e) => {
//           setPositionY(CLOSED_POSITION);
//           setTimeout(() => {
//             router.back();
//           }, 700);
//         }}
//         className={cn(" ml-4 group")}
//       >
//         <ArrowLeft className=" icon  w-4 h-4  sm:w-6 sm:h-6  group-hover:-translate-x-1 transition-all" />
//       </Button>

//       {/* {open && isLoading && <Spinner size={30} />} */}
//       {open && loading ? (
//         <Spinner size={30} />
//       ) : isError ? (
//         <>
//           {error && (
//             <p className=" text-lg text-muted-foreground w-full text-center">
//               {error.message}
//             </p>
//           )}
//           {messagesError && (
//             <ErrorMessage>
//               {" "}
//               <p className=" text-center">{messagesError.message}</p>
//             </ErrorMessage>
//           )}

//           {clientError && (
//             <ErrorMessage>
//               {" "}
//               <p className=" text-center">{clientError.message}</p>
//             </ErrorMessage>
//           )}
//         </>
//       ) : !clientById || !clientById.length ? (
//         <ErrorMessage>
//           Something went wrong while getting the client&apos;s data.
//         </ErrorMessage>
//       ) : (
//         <>
//           <div className="p-4">
//             <h2 className="text-xl font-bold">Ticket Details</h2>
//           </div>

//           <section className=" flex flex-col sm:flex-row   max-w-[1000px] mx-auto gap-10 mt-14 px-4   md:px-20  ">
//             <div>
//               <div className=" sm:sticky top-5">
//                 <div className=" space-y-6 mb-20 text-sm">
//                   <div className=" space-y-2">
//                     <p className=" text-muted-foreground ">TICKET ID</p>
//                     <p className=" font-semibold">#{ticketData?.id}</p>
//                   </div>

//                   <div className=" space-y-2">
//                     <p className=" text-muted-foreground">CREATED AT</p>
//                     <p className="  font-semibold">
//                       {" "}
//                       {ticketData &&
//                         format(
//                           ticketData.created_at,
//                           "MMMM d, yyyy h:mm aa"
//                         )}
//                     </p>
//                   </div>

//                   <div className=" space-y-2">
//                     <p className=" text-muted-foreground text-nowrap">
//                       LAST ACTIVITY
//                     </p>
//                     <p className="  font-semibold">
//                       {" "}
//                       {ticketData &&
//                         formatDistanceToNow(ticketData[0].updated_at) + ` ago`}
//                     </p>
//                   </div>

//                   <div className=" space-y-2">
//                     <p className=" text-muted-foreground">STATUS</p>
//                     <p className=" ">
//                       {ticketData && (
//                         <TicketStatus
//                           ticketStatus={ticketData.ticketStatus_id}
//                         />
//                       )}
//                     </p>
//                   </div>
//                 </div>
//                 {isAdmin && (
//                   <div className=" p-3  space-y-6 rounded-xl bg-accent/30 ">
//                     <div className=" flex  gap-2">
//                       <Switch
//                         id="is-internal-only"
//                         checked={isInternalOnly}
//                         onCheckedChange={(value) => {
//                           setIsInternalOnly(value);
//                           setIsMessagesOnly(false);
//                         }}
//                       />{" "}
//                       <label
//                         htmlFor="is-internal-only"
//                         className=" text-xs text-muted-foreground "
//                       >
//                         Internal messages only
//                       </label>
//                     </div>
//                     <div className=" flex  gap-2">
//                       <Switch
//                         id="is-visible-only"
//                         checked={isMessagesOnly}
//                         onCheckedChange={(value) => {
//                           setIsMessagesOnly(value);
//                           setIsInternalOnly(false);
//                         }}
//                       />{" "}
//                       <label
//                         htmlFor="is-visible-only"
//                         className=" text-xs text-muted-foreground "
//                       >
//                         Visible messages only
//                       </label>
//                     </div>

//                     <Select
//                       // key={statusId}
//                       disabled={isLoading}
//                       value={String(statusId) || undefined}
//                       onValueChange={async (value) => {
//                         setStatusId(Number(value));
//                         await handleEditTicket(Number(value));
//                       }}
//                     >
//                       <SelectTrigger className="w-full  h-fit gap-2">
//                         <SelectValue placeholder="Ticket Status" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {ticketStatus.length ? (
//                           ticketStatus.map((status) => (
//                             <SelectItem key={status.id} value={`${status.id}`}>
//                               <TicketStatus
//                                 ticketStatus={status}
//                                 className=" text-wrap"
//                               />
//                             </SelectItem>
//                           ))
//                         ) : (
//                           <p className=" text-muted-foreground text-center w-full">
//                             No ticket status
//                           </p>
//                         )}
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 )}
//               </div>
//             </div>
//             <div className=" w-full  ">
//               <div className=" pb-5 border-b">
//                 <h2 className=" text-xl font-semibold mb-4">
//                   {ticketData.subject}
//                 </h2>
//                 <p className=" text-sm"> {ticketData.description}</p>
//               </div>

//               {optimisticMessages && (
//                 <Messages
//                   messages={optimisticMessages}
//                   selectedMessageId={selectedMessageId}
//                   setSelectedMessageId={setSelectedMessageId}
//                   currentUser={user?.user}
//                   isDragging={isDragging}
//                 />
//               )}
//               {/* <div className="  h-44  flex items-center justify-center border border-dashed rounded-xl">

//                 <div className=" flex items-center gap-2 flex-col text-muted-foreground">
//                   <MailSearch className=" w-6 h-6 sm:w-10 sm:h-10" />
//                   <span>No Messages found</span>
//                 </div>
//               </div> */}

//               {/* !// Make it so when there is no ticket the filed it self is disabled instead of just having it disappear completely. */}

//               <TicketTextField
//                 // key={open}
//                 open={open}
//                 dispatchOptimistic={dispatchOptimistic}
//                 setFailedMessages={setFailedMessages}
//                 containerRef={containerRef}
//                 currentUser={user?.user}
//                 clientById={clientById}
//                 ticket={ticketData}
//                 messageToEdit={selectedMessage}
//                 className={
//                   !ticketViewed ||
//                   ticketViewed.ticketStatus_id.name.toLowerCase() === "close"
//                     ? "opacity-75 pointer-events-none"
//                     : ""
//                 }
//               />
//             </div>
//           </section>
//         </>
//       )}
//     </div>
//   );
// };
