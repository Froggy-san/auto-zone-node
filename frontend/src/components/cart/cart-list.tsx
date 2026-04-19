"use client";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import CartITem from "./cart-item";
import { formatCurrency } from "@lib/client-helpers";
import { clearCart, getCart, getTotalCartPrices } from "./cartSlice";
import { ShoppingCart } from "lucide-react";
import { Button } from "@components/ui/button";
import useInitializeCart from "@hooks/use-initailize-cart";

const CartList = () => {
  const cartItems = useSelector(getCart);
  const totalPrices = useSelector(getTotalCartPrices);
  const dispatch = useDispatch();
  useInitializeCart();
  return (
    <section className="   flex-1   space-y-4 pb-10 max-h-full ">
      <div className=" w-full bg-secondary p-4 flex items-center justify-between rounded-lg border dark:bg-card">
        <motion.h2
          key={totalPrices}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="  text-md  sm:text-lg  font-semibold"
        >
          Summary: {formatCurrency(totalPrices)}
        </motion.h2>
        {/* <p>Total: <span>{formatCurrency(getTotalCartPrices(cartItems))}</span></p> */}
        <Button
          onClick={() => dispatch(clearCart())}
          size="sm"
          variant="destructive"
        >
          Clear
        </Button>
      </div>
      <div className="  rounded-sm      space-y-4">
        <AnimatePresence mode="popLayout">
          {cartItems.length ? (
            cartItems.map((item, i) => (
              <CartITem key={item.id} item={item} index={i} />
            ))
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className=" flex flex-col-reverse text-center sm:text-left sm:flex-row items-center justify-center gap-2 text-md text-muted-foreground sm:text-2xl"
            >
              No items were added to your cart <ShoppingCart size={30} />
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default CartList;
