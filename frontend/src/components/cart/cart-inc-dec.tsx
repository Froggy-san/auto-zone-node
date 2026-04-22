import { Button } from "@components/ui/button";
import { Minus, Plus } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { decreaseItemQuantity, increaseItemQuantity } from "./cartSlice";
import { AnimatePresence, motion } from "framer-motion";
import { CartItem, ProductById } from "@lib/types";

import { useMemo } from "react";
import { MdOutlineExposurePlus1 } from "react-icons/md";
import { TbExposureMinus1 } from "react-icons/tb";

const CartIncDec = ({ productInCart }: { productInCart: CartItem }) => {
  const dispatch = useDispatch();
  const prevQuantityRef = useRef(productInCart.quantity);

  // Determine if we are adding or removing
  const isIncrement = productInCart.quantity >= prevQuantityRef.current;

  useEffect(() => {
    prevQuantityRef.current = productInCart.quantity;
  }, [productInCart.quantity]);

  const firstImage = productInCart?.productImages?.[0]?.imageUrl || null;

  // Random horizontal variance and rotation
  const randomEffect = useMemo(
    () => ({
      x: Math.floor(Math.random() * 60) - 30,
      rotate: Math.floor(Math.random() * 50) - 25,
    }),
    [productInCart.quantity],
  );

  return (
    <div className="relative flex items-center  gap-1 sm:gap-2">
      <AnimatePresence mode="popLayout">
        {firstImage && (
          <motion.div
            key={productInCart.quantity}
            className=" absolute left-1/2 pointer-events-none z-50"
            initial={
              isIncrement
                ? { opacity: 0, y: -15, x: "-50%", scale: 0.5 }
                : { opacity: 0, y: 10, x: "-50%", scale: 1 }
            }
            animate={
              isIncrement
                ? {
                    // Move first, then fade
                    opacity: [0, 1, 1, 0],
                    y: [-15, -80, -80], // Reaches -70 and stays there while fading
                    x: [
                      `calc(-50% + 0px)`,
                      `calc(-50% + ${randomEffect.x}px)`,
                      `calc(-50% + ${randomEffect.x}px)`,
                    ],
                    scale: [0.5, 1.1, 1.1],
                    rotate: [0, randomEffect.rotate, randomEffect.rotate],
                  }
                : {
                    // Drop first, then fade
                    opacity: [0, 1, 1, 0],
                    y: [10, 80, 80], // Drops to 50 and stays there while fading
                    x: [
                      `calc(-50% + 0px)`,
                      `calc(-50% + ${randomEffect.x}px)`,
                      `calc(-50% + ${randomEffect.x}px)`,
                    ],
                    scale: [1, 0.9, 0.9],
                    rotate: [
                      0,
                      randomEffect.rotate * 2,
                      randomEffect.rotate * 2,
                    ],
                  }
            }
            transition={{
              duration: 1, // Slightly longer to see the sequence
              ease: "easeOut",
              // times mapping: 0% start, 15% fully visible, 75% start fading, 100% gone
              times: [0, 0.15, 0.75, 1],
            }}
          >
            {isIncrement ? (
              <MdOutlineExposurePlus1 className=" w-5 h-5" />
            ) : (
              <TbExposureMinus1 className=" w-5 h-5" />
            )}{" "}
            <img
              src={firstImage}
              className="h-[35px] w-auto max-w-16 object-cover rounded-[5px]"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={() => dispatch(decreaseItemQuantity(productInCart.id))}
        size="sm"
        className="p-2 h-fit"
      >
        <Minus size={17} />
      </Button>

      {/* Numerical counter with sliding effect */}
      <div className="overflow-hidden h-7 flex text-sm sm:text-md items-center justify-center min-w-[24px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={productInCart.quantity}
            initial={{ y: isIncrement ? 15 : -15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: isIncrement ? -15 : 15, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="font-medium"
          >
            {productInCart.quantity}
          </motion.span>
        </AnimatePresence>
      </div>

      <Button
        disabled={productInCart?.quantity === productInCart.stock}
        onClick={() => dispatch(increaseItemQuantity(productInCart.id))}
        size="sm"
        className="p-2 h-fit"
      >
        <Plus size={17} />
      </Button>
    </div>
  );
};
export default CartIncDec;
