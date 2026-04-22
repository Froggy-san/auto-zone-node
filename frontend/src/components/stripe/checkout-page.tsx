"use client";
import ErrorMessage from "@components/error-message";
import FormErrorMessage from "@components/form-error-message";
import Spinner from "@components/Spinner";
import { Button } from "@components/ui/button";
import { formatCurrency } from "@lib/client-helpers";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { AnimatePresence } from "framer-motion";
import React, { useState } from "react";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL!;

const CheckoutPage = ({
  amount,
  clientSecret,
  orderId,
}: {
  amount: number;
  clientSecret: string;
  orderId: string | null;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState("");
  // const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   fetch("/api/create-payment-intent", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({ amount: convertToSubcurrency(amount) }),
  //   })
  //     .then((res) => res.json())
  //     .then((data) => setClientSecret(data.clientSecret));
  // }, [amount]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      setLoading(true);

      if (!stripe || !elements) return;

      const { error: submitError } = await elements.submit();

      if (submitError && submitError.message) {
        setErrorMessage(submitError.message);
        setLoading(false);
        return;
      }

      // Confirm payment 14:59 https://www.youtube.com/watch?v=fgbEwVWlpsI&t=815s&ab_channel=SonnySangha

      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${SITE_URL}/orders/${orderId}?amount=${amount}`,
        },
      });
      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
      console.log(`Something went wrong while trying to pay: ${error.message}`);
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  if (!clientSecret || !stripe || !elements)
    return <Spinner className=" h-10" />;

  // if (errorMessage)
  //   return (
  //     <ErrorMessage className=" text-white   ">{errorMessage}</ErrorMessage>
  //   );

  return (
    <form onSubmit={handleSubmit} className="   rounded-sm space-y-4">
      {clientSecret && <PaymentElement />}

      <Button
        disabled={!stripe || !elements || loading}
        className=" w-full"
        size="sm"
      >
        {!loading ? `Pay ${formatCurrency(amount)}` : "Processing..."}
      </Button>
      <AnimatePresence mode="wait">
        {errorMessage && (
          <FormErrorMessage key={errorMessage}>{errorMessage}</FormErrorMessage>
        )}
      </AnimatePresence>
    </form>
  );
};

export default CheckoutPage;
