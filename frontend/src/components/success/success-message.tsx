"use client";
import {
  getCart,
  getClient,
  getDate,
  getTotalCartPrices,
} from "@components/cart/cartSlice";
import { Button } from "@components/ui/button";
import useInitializeCart from "@hooks/use-initailize-cart";
import { formatCurrency } from "@lib/client-helpers";
import { RootState } from "@lib/store/store";
import { format } from "date-fns";
import { Store } from "lucide-react";
import Link from "next/link";
import React from "react";
import { useSelector } from "react-redux";

interface Props {
  amount?: string;
  paidByCard?: string;
}

const SuccessMessage = ({ amount, paidByCard }: Props) => {
  const date = useSelector(getDate);
  const client = useSelector(getClient);
  const totalPrice = useSelector(getTotalCartPrices);

  console.log(paidByCard);

  return (
    <div className=" bg-secondary rounded-md dark:bg-accent border   text-center p-5  max-w-[800px] mx-auto  mt-20">
      <h1 className=" text-lg  font-semibold">Success!</h1>

      <p className=" text-muted-foreground">
        {paidByCard
          ? `  Hello ${
              client ? client.name : ""
            } your payment of an amount totaling ${formatCurrency(
              Number(paidByCard)
            )}  gone through successfully.`
          : `  Hello ${
              client ? client.name : ""
            } We will be expecting you at{" "}
        ${date ? format(date, "PPP") : ""} to pick up items totaling:{" "}
        ${formatCurrency(totalPrice)}`}
      </p>

      <div className=" flex items-center justify-center mt-5">
        <Button asChild size="sm" className=" gap-2">
          <Link href="/" prefetch={false}>
            Continue shopping <Store size={18} />
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default SuccessMessage;
