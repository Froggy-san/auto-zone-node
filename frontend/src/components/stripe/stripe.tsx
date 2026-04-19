"use client";
import React from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import convertToSubcurrency from "@lib/convertToSubcurrency";
import CheckoutPage from "./checkout-page";
import { useSelector } from "react-redux";
import { getTotalCartPrices } from "@components/cart/cartSlice";
import { formatCurrency } from "@lib/client-helpers";
import { Button } from "@components/ui/button";
import Link from "next/link";
import { Store } from "lucide-react";

const STRIPE_PUBLIC_KEY = process.env.PUBLIC_STRIPE_PUBLIC_KEY;
if (STRIPE_PUBLIC_KEY === undefined) throw new Error("something went wrong.");
const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);
const Stripe = () => {
  const amount = useSelector(getTotalCartPrices);

  if (!amount)
    return (
      <div className=" p-5 border w-fit  flex-col mx-auto rounded-md bg-secondary dark:bg-accent mt-20 sm:mt-32 flex items-center gap-3 justify-center text-center">
        <p className=" text-xl font-semibold text-muted-foreground">
          Your cart is empty
        </p>{" "}
        <Button asChild size="sm" variant="orange">
          <Link
            href="/products"
            prefetch={false}
            className=" flex items-center gap-2"
          >
            View some products <Store size={18} />
          </Link>
        </Button>
      </div>
    );

  return (
    <section className="max-w-6xl mx-auto t text-center bg-gradient-to-bl from-orange-400 to-red-400  rounded-sm mt-10  p-10 ">
      <div className=" mb-10  ">
        <h1 className="text-4xl font-extrabold mb-2 ">
          Auto-Zone has requested
        </h1>
        <span className=" font-bold">${formatCurrency(amount)}</span>
      </div>

      <Elements
        stripe={stripePromise}
        options={{
          mode: "payment",
          amount: convertToSubcurrency(amount), // cents
          currency: "egp",
        }}
      >
        <CheckoutPage amount={amount} />
      </Elements>
    </section>
  );
};

export default Stripe;
