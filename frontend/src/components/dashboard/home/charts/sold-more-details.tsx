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
import { ImageOff, MoveLeft, MoveRight } from "lucide-react";
import { formatCurrency } from "@lib/client-helpers";
import Link from "next/link";

interface Product {
  id: number;
  productName?: string;
  productImage: string | null;
  pricePerUnit?: number;
  totalCount: number;
  totalDiscount: number;
  fill: string;
  totalPriceAfterDiscount: number;
}
interface Props {
  products: Product[];
  date: (string | Date | undefined)[];
}
const SoldMoreDetails = ({ products, date }: Props) => {
  const [page, setpage] = useState(1);
  const ref = useRef<HTMLUListElement>(null);
  const { result, totalPages } = useLocalPagination({
    currPage: page,
    pageSize: 10,
    arr: products,
  });

  const handleScrollTop = useCallback(() => {
    if (ref.current) {
      ref.current.scrollTo(0, 0);
    }
  }, [ref]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" disabled={!totalPages}>
          See more
        </Button>
      </DialogTrigger>
      <DialogContent className=" p-0 gap-0">
        <DialogHeader className=" p-6 pb-1">
          <DialogTitle>Sold product detials</DialogTitle>
          <DialogDescription>
            This is a list of all products sold for the period{" "}
            {`'${date[0]}-${date[1]}'`}.
          </DialogDescription>
        </DialogHeader>
        <ul
          ref={ref}
          className=" space-y-2 relative max-h-[55vh]    py-2  pr-2 xs:px-4 mx-2 overflow-y-auto"
        >
          {result.map((pro) => (
            <Link
              href={`/products/${pro.id}`}
              key={pro.id}
              className="flex gap-1 sm:gap-x-3   h-fit  rounded-md  bg-secondary   dark:bg-card/30 overflow-hidden"
            >
              <div className="  min-w-[120px] max-w-[120px]  sm:min-w-[150px] sm:max-w-[150px]   sm:max-h-28  flex   items-center justify-center">
                {pro.productImage ? (
                  <img
                    src={pro.productImage}
                    alt="Product image"
                    className="   w-full  h-full object-cover"
                  />
                ) : (
                  <div className=" h-full w-full flex items-center justify-center  bg-foreground/10   ">
                    <ImageOff className=" w-6 h-6" />
                  </div>
                )}
              </div>

              <div className=" text-left flex-1 relative p-2">
                <h2 className=" max-w-full  line-clamp-1  font-semibold text-sm ">
                  {pro.productName}
                </h2>
                <div className=" flex items-center text-xs text-muted-foreground max-w-full gap-y-2 sm:gap-y-0 gap-x-5 flex-wrap">
                  <p>Total units sold: {pro.totalCount}</p>
                  <p>Total discount: {formatCurrency(pro.totalDiscount)}</p>
                  <p>Price per unit: {formatCurrency(pro.pricePerUnit || 0)}</p>
                  <p>Net: {formatCurrency(pro.totalPriceAfterDiscount)}</p>
                  <div
                    className=" w-4 h-4  rounded  "
                    style={{ backgroundColor: `${pro.fill}` }}
                  />
                </div>
              </div>
            </Link>
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

export default SoldMoreDetails;
