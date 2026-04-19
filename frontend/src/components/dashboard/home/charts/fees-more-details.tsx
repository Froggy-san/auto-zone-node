import React, { useCallback, useRef, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import useLocalPagination from "@hooks/use-local-pagination";
import { Button } from "@components/ui/button";
import { MoveLeft, MoveRight } from "lucide-react";
import { formatCurrency } from "@lib/client-helpers";

interface Fee {
  id: number;
  name: string | number;
  totalPrice: number;
  totalCount: number;
  totalDiscount: number;
  fill: string;
  totalPriceAfterDiscount: number;
}
interface Props {
  fees: Fee[];
  date: (string | Date | undefined)[];
}
const FeesMoreDetails = ({ fees, date }: Props) => {
  const [page, setpage] = useState(1);

  const { result, totalPages } = useLocalPagination({
    currPage: page,
    pageSize: 10,
    arr: fees,
  });

  const list = useRef<HTMLUListElement>(null);

  const handleScrollTop = useCallback(() => {
    if (list.current) {
      list.current.scrollTo(0, 0);
    }
  }, [list]);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" disabled={!totalPages}>
          See more
        </Button>
      </DialogTrigger>
      <DialogContent className=" p-0 gap-0">
        <DialogHeader className=" p-6 pb-1">
          <DialogTitle>Services preformed details</DialogTitle>
          <DialogDescription>
            This is a list of all services preformed for the period{" "}
            {`'${date[0]}-${date[1]}'`}.
          </DialogDescription>
        </DialogHeader>
        <ul
          ref={list}
          className=" space-y-2 relative max-h-[55vh]    py-2  pr-2 xs:px-4 mx-2 overflow-y-auto"
        >
          {result.map((fee) => (
            <li
              key={fee.id}
              className="  p-3 gap-1   h-fit  rounded-md space-y-1  bg-secondary dark:bg-card/30 overflow-hidden"
            >
              <div className=" flex items-center gap-1">
                <div
                  className=" w-4 h-4  rounded  "
                  style={{ backgroundColor: `${fee.fill}` }}
                />
                <h2 className=" max-w-full  line-clamp-1  font-semibold text-sm ">
                  {fee.name}
                </h2>
              </div>

              <div className=" flex items-center text-xs text-muted-foreground max-w-full gap-y-2 sm:gap-y-0 gap-x-5 flex-wrap">
                <p>Total units sold: {fee.totalCount}</p>
                <p>Price per unit: {formatCurrency(fee.totalPrice || 0)}</p>
                <p>Total discount: {formatCurrency(fee.totalDiscount)}</p>
                <p>Net: {formatCurrency(fee.totalPriceAfterDiscount)}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className=" p-6 pt-2 flex  items-center justify-between relative">
          <div className=" flex-shrink-0 text-xs text-muted-foreground">
            {page} / {totalPages}
          </div>
          <div className="  flex items-center gap-2">
            <Button
              className=" w-full"
              disabled={page === 1 || !totalPages}
              onClick={() => {
                if (page === 1) return;
                setpage((currPage) => currPage - 1);
                handleScrollTop();
              }}
              variant="secondary"
              size="sm"
            >
              <MoveLeft className=" w-4 h-4" />
            </Button>

            <Button
              className=" w-full"
              disabled={page === totalPages || !totalPages}
              onClick={() => {
                if (page === totalPages) return;
                setpage((currPage) => currPage + 1);
                handleScrollTop();
              }}
              variant="secondary"
              size="sm"
            >
              <MoveRight className=" w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeesMoreDetails;
