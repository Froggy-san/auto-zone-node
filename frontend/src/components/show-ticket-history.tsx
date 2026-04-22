import { cn } from "@lib/utils";
import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, History } from "lucide-react";
import { Button } from "./ui/button";
import {
  Message,
  Ticket,
  TicketHistory as TicketHistoryType,
  TicketPriority,
  TicketStatus,
} from "@lib/types";
import useInfiniteTicketHistory from "@lib/queries/tickets/useInfiniteTicketHistory";
import { useInView } from "react-intersection-observer";
import ErrorMessage from "./error-message";
import TicketHistory from "./dashboard/tickets/ticket-history";
import { GiTumbleweed } from "react-icons/gi";
import Spinner from "./Spinner";
import { TbMoodEmptyFilled } from "react-icons/tb";
import { useScrollFade } from "@hooks/use-scroll-fade";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
interface Props {
  isOpen: boolean;
  ticket: Ticket;
  ticketStatuses: TicketStatus[];
  ticketPriorities: TicketPriority[];
  internalActivity?: boolean;
  className?: string;
  selectedMessage: Message | undefined;
  setIsOpen: (open: boolean) => void;
  handleViewDetails: (ticketId: number, messageId?: number | undefined) => void;
  handleFocusMessage: (messageId: number | null) => void;
  handleSelectMessage: (id: number | null) => void;
}

const ShowTicketHistory = React.forwardRef<HTMLDivElement, Props>(
  (
    {
      className,
      ticket,
      ticketPriorities,
      ticketStatuses,
      isOpen,
      setIsOpen,
      selectedMessage,
      internalActivity,
      handleFocusMessage,
      handleViewDetails,
      handleSelectMessage,
    }: Props,
    ref,
  ) => {
    const {
      data,
      isFetching,
      fetchNextPage,
      isFetchingNextPage,
      hasNextPage,
      error,
    } = useInfiniteTicketHistory({ ticketId: ticket.id });

    const { ref: inViewElement, inView } = useInView();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const params = new URLSearchParams(searchParams);
    const router = useRouter();
    const historyId = searchParams.get("historyId")
      ? Number(searchParams.get("historyId"))
      : null;
    const sliderContainerRef = useRef<HTMLDivElement>(null);
    const historyRefs = useRef<Record<string, HTMLLIElement>>({});
    const listRef = useRef<HTMLDivElement>(null);

    //! important note about refs: We have two refs here: 'sliderContainerRef' for internal use and the forwarded 'ref' for the parent.
    // const sliderContainerRef = ref ?? sliderContainerRef;
    // This exposes the internal DOM node to the parent's ref
    useImperativeHandle(
      ref,
      () => sliderContainerRef.current as HTMLDivElement,
    );

    const ticketHistoryById: TicketHistoryType[] = useMemo(() => {
      return data ? data.pages.flatMap((page) => page.items) : [];
    }, [data?.pages]);

    const selectHistory = useCallback(
      (ticketId: number, ticketHisotryId: number) => {
        if (ticketHisotryId === historyId) {
          params.delete("historyId");
          router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        } else {
          params.set("ticket", String(ticketId));
          params.set("historyId", String(ticketHisotryId));
          router.replace(`${pathname}?${params.toString()}`, {
            scroll: false,
          });
        }
      },
      [router, params, pathname, historyId],
    );

    const setRef = useCallback((el: HTMLLIElement | null, id: number) => {
      if (el) {
        historyRefs.current[id] = el;
      }
      // Remove the 'delete' part unless you are worried about
      // memory leaks with thousands of items.
      //! Keeping the old ref for a moment usually helps stability.
      else {
        delete historyRefs.current[id];
      }
    }, []);

    //! This hook ensures that if 'ref' is a function or an object,
    // it gets updated whenever 'sliderContainerRef' changes.

    // useEffect(() => {
    //   if (!ref) return;

    //   if (typeof ref === "function") {
    //     ref(sliderContainerRef.current);
    //   } else {
    //     (ref as React.MutableRefObject<HTMLDivElement | null>).current = sliderContainerRef.current;
    //   }
    // }, [ref]);
    useEffect(() => {
      if (!isFetchingNextPage && hasNextPage && inView) fetchNextPage();
    }, [inView, hasNextPage]);

    useEffect(() => {
      if (!historyId || !isOpen) return;

      const scrollToTarget = () => {
        const element = historyRefs.current[historyId];

        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        } else if (hasNextPage && !isFetchingNextPage) {
          // If the ID isn't in our refs yet, but more pages exist,
          // scroll to bottom to trigger 'inView' and fetch more.
          listRef.current?.scrollTo({
            top: listRef.current.scrollHeight,
            behavior: "smooth",
          });
          fetchNextPage();
        }
      };

      // We use a requestAnimationFrame to ensure the DOM has
      // actually rendered the new items from the last fetch
      const timeoutId = setTimeout(scrollToTarget, 200);

      return () => clearTimeout(timeoutId);
    }, [
      historyId,
      isOpen,
      ticketHistoryById.length, // Trigger when new items are added
      // isFetchingNextPage,
    ]);

    // useEffect(() => {
    //   if (historyId) {
    //     // setIsOpen(true);
    //     const element = historyRefs.current[historyId];

    //     if (!element && hasNextPage && !isFetchingNextPage) {
    //       listRef.current?.scrollTo({
    //         top: listRef.current.scrollHeight,
    //         behavior: "smooth",
    //       });
    //       fetchNextPage();
    //     }
    //     element?.scrollIntoView({
    //       behavior: "smooth",
    //       block: "center", // Puts the item in the middle of the container
    //     });
    //   }
    // }, [
    //   historyId,
    //   setIsOpen,
    //   isOpen,
    //   hasNextPage,
    //   isFetchingNextPage,
    //   ticketHistoryById.length,
    // ]);

    useEffect(() => {
      if (historyId) setIsOpen(true);
    }, [historyId, setIsOpen]);

    if (error) return <ErrorMessage>{`${error}`}</ErrorMessage>;

    return (
      <div
        ref={sliderContainerRef}
        className={cn(
          "     sticky  transition-all   ease-out     rounded-t-3xl  md:rounded-l-3xl bg-background  border-t border-x md:border-x-0 md:border-t-0 md:border-l md:border-y shadow-lg bottom-0 md:top-1   w-full  h-0    md:w-0  md:h-[99vh] ",
          { "  h-fit md:!w-[400px]": isOpen },
          className,
        )}
      >
        <div className=" w-full  relative h-full  ">
          <Button
            onClick={() => setIsOpen(!isOpen)}
            variant="secondary"
            className="  absolute left-1/2 -translate-x-1/2 rotate-90 md:rotate-0 -top-10 md:top-1/2 md:bottom-1/2 md:-left-8  border z-50  p-0   w-7 h-7 rounded-full"
          >
            <ArrowLeft
              className={cn(" w-4 h-4 transition-all  ease-in duration-300", {
                " rotate-180": isOpen,
              })}
            />
          </Button>

          {isOpen && (
            <motion.div
              ref={listRef}
              //show-hide-scrollbar
              className={cn(" h-full relative  p-3   space-y-6 ")}
            >
              <AnimatePresence mode="wait">
                {ticketHistoryById.length ? (
                  <motion.ul
                    key={`list`}
                    initial={{
                      y: 40,
                      opacity: 0,
                    }}
                    animate={{
                      y: 0,
                      opacity: 1,
                    }}
                    exit={{ y: 40, opacity: 0 }}
                    transition={{ ease: "easeOut", delay: 0.1 }}
                    className=" flex flex-row md:flex-col justify-stretch gap-4 !h-full   max-h-full  py-3 px-1.5  overflow-y-auto history-thumb show-hide-scrollbar "
                  >
                    {ticketHistoryById.map((history) => (
                      <TicketHistory
                        key={history.id}
                        className="  min-w-[290px] xs:min-w-[350px] "
                        ref={(element) => {
                          setRef(element, history.id);
                        }}
                        isHistorySelected={history.id === historyId}
                        selectHistory={selectHistory}
                        internalActivity={internalActivity}
                        selectedMessage={selectedMessage}
                        handleFocusMessage={handleFocusMessage}
                        handleSelectMessage={handleSelectMessage}
                        handleViewDetails={handleViewDetails}
                        ticketHistory={history}
                        ticketStatuses={ticketStatuses}
                        ticketPriorities={ticketPriorities}
                      />
                    ))}
                    <li
                      ref={inViewElement}
                      className=" flex items-center   w-[20px] sm:w-[unset] justify-center "
                    >
                      {isFetching && <Spinner className="  h-5 w-5 static" />}
                    </li>
                  </motion.ul>
                ) : (
                  <motion.div
                    key={"not-found"}
                    className=" text-xs my-auto w-full text-center text-muted-foreground flex flex-col justify-center items-center gap-2"
                  >
                    <p className="  text-sm sm:text-lg">No history found.</p>
                    <History className="  w-5 h-5   sm:w-9 sm:h-9" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    );
  },
);
export default ShowTicketHistory;

ShowTicketHistory.displayName = "ShowTicketHistory";

/*
   const measuredRef = useCallback((node: HTMLDivElement | null) => {
      if (node !== null) {
        console.log("Element is now in the DOM", node.getBoundingClientRect());
        setNode(node); // If you need to trigger a re-render, update state
      }
    }, []);
*/

/*
const measuredRef = useCallback((node: HTMLDivElement | null) => {
  // Update the forwarded ref so the parent knows about the node
  if (typeof ref === "function") {
    ref(node);
  } else if (ref) {
    ref.current = node;
  }

  // Internal Logic: Scroll to specific historyId if it exists
  if (node && historyId) {
    const target = node.querySelector(`[data-id="${historyId}"]`);
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}, [ref, historyId]);

*/
