"use client";
import React, { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import convertToSubcurrency from "@lib/convertToSubcurrency";
import CheckoutPage from "./checkout-page";
import { useSelector } from "react-redux";
import { getCart, getTotalCartPrices } from "@components/cart/cartSlice";
import { formatCurrency } from "@lib/client-helpers";
import { Button } from "@components/ui/button";
import Link from "next/link";
import { Store } from "lucide-react";
import { useSearchParams } from "next/navigation";
import useInitializeCart from "@hooks/use-initailize-cart";
import Spinner from "@components/Spinner";

const STRIPE_PUBLIC_KEY = process.env.NEXT_PUBLIC_STRIPE_KEY!;

if (STRIPE_PUBLIC_KEY === undefined) throw new Error("something went wrong.");
const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);
// This helper gets the hex/hsl value from your Tailwind CSS variables
const getVariable = (name: string) => {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
};

const Stripe = () => {
  const [isLoadig, setIsLoading] = useState(false);
  const [theme, setTheme] = useState({
    input: "#e2e8f0",
    ring: "#94a3b8",
    background: "#ffffff",
    foreground: "#0f172a",
  });

  useEffect(() => {
    // We grab the actual values once the component mounts
    setTheme({
      input: getVariable("--input") || "#e2e8f0",
      ring: getVariable("--ring") || "#94a3b8",
      background: getVariable("--background") || "#ffffff",
      foreground: getVariable("--foreground") || "#0f172a",
    });
  }, []);
  const stripeAppearance = {
    variables: {
      fontFamily: "ui-sans-serif, system-ui, sans-serif",
      fontSizeBase: "14px", // text-sm (approx 14px)
      colorBackground: `hsl(${theme.background})`,
      colorText: `hsl(${theme.foreground})`,
      colorTextPlaceholder: "#64748b", // placeholder:text-muted-foreground
      colorDanger: "#ef4444",
      borderRadius: "6px", // rounded-md (0.375rem)
      spacingUnit: "4px",
    },
    rules: {
      ".Input": {
        border: `1px solid hsl(${theme.input})`,
        boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        padding: "8px 12px", // px-3 py-1 (adjusted for h-9)
        borderRadius: "1rem",
        transition:
          "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out", // transition-colors
      },
      ".Input:focus": {
        outline: "none",
        boxShadow: `0 0 0 1px hsl(${theme.ring})`,
        border: `1px solid hsl(${theme.ring})`,
      },
      ".Input--invalid": {
        border: "1px solid #ef4444",
        boxShadow: "0 0 0 1px #ef4444",
      },
      ".Label": {
        fontSize: "14px",
        fontWeight: "500",
        marginBottom: "4px",
        paddingBottom: "5px",
      },
    },
  };
  const amount = useSelector(getTotalCartPrices);
  useInitializeCart();
  const cart = useSelector(getCart);
  const searchParams = useSearchParams();
  const [clientSecret, setClientSecret] = React.useState("");
  const orderId = searchParams.get("orderId"); // Get the ID from URL

  useEffect(() => {
    if (amount <= 0 || !orderId) return; // Don't fetch for empty carts

    const fetchSecret = async () => {
      setIsLoading(true);
      const res = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: convertToSubcurrency(amount), orderId }),
      });
      const data = await res.json();
      setClientSecret(data.clientSecret);
      setIsLoading(false);
    };

    fetchSecret();
  }, [amount, orderId]);
  // The options object requires the clientSecret
  const options: StripeElementsOptions = {
    clientSecret,
    appearance: stripeAppearance,
    // appearance: {
    //   theme: "stripe", // 'flat', 'night', or 'stripe'
    //   variables: {
    //     colorPrimary: "#0570de",
    //   },
    // },
  };
  if (!amount && !isLoadig)
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
  if (isLoadig) return <Spinner className=" static h-fit  mt-10" size={30} />;

  return (
    //bg-gradient-to-bl from-orange-400 to-red-400
    <section
      className={`max-w-6xl mx-auto t text-center  rounded-sm mt-10  p-3 sm:p-10 `}
    >
      <div className=" mb-10  ">
        <h1 className=" text-3xl sm:text-4xl font-extrabold mb-2 ">
          Auto-Zone has requested
        </h1>
        <span className=" font-bold">{formatCurrency(amount)}</span>
      </div>

      {clientSecret && (
        <Elements
          stripe={stripePromise}
          options={
            options
            //   {

            //   mode: "payment",
            //   amount: convertToSubcurrency(amount), // cents
            //   currency: "egp",
            // }
          }
        >
          <CheckoutPage
            clientSecret={clientSecret}
            amount={amount}
            orderId={orderId}
          />
        </Elements>
      )}
    </section>
  );
};

export default Stripe;
