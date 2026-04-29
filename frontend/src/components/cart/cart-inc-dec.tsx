import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react"
import React, { useEffect, useRef, useState } from "react"
import { useDispatch } from "react-redux"
import { decreaseItemQuantity, increaseItemQuantity } from "./cartSlice"
import { AnimatePresence, motion } from "framer-motion"

import { useMemo } from "react"
import { MdOutlineExposurePlus1 } from "react-icons/md"
import { TbExposureMinus1 } from "react-icons/tb"
import type { CartItem } from "@/types"
const BASE_URL = import.meta.env.VITE_API_URL
const CartIncDec = ({ productInCart }: { productInCart: CartItem }) => {
  const dispatch = useDispatch()
  const prevQuantityRef = useRef(productInCart.quantity)

  // Determine if we are adding or removing
  const isIncrement = productInCart.quantity >= prevQuantityRef.current

  useEffect(() => {
    prevQuantityRef.current = productInCart.quantity
  }, [productInCart.quantity])

  const firstImage = productInCart?.productImages?.[0]?.imageUrl || null

  // Random horizontal variance and rotation
  const randomEffect = useMemo(
    () => ({
      x: Math.floor(Math.random() * 60) - 30,
      rotate: Math.floor(Math.random() * 50) - 25,
    }),
    [productInCart.quantity]
  )

  return (
    <div className="relative flex items-center gap-1 sm:gap-2">
      <AnimatePresence mode="popLayout">
        {firstImage && (
          <motion.div
            key={productInCart.quantity}
            className="pointer-events-none absolute left-1/2 z-50"
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
              <MdOutlineExposurePlus1 className="h-5 w-5" />
            ) : (
              <TbExposureMinus1 className="h-5 w-5" />
            )}{" "}
            <img
              src={`${BASE_URL}${firstImage}`}
              className="h-[35px] w-auto max-w-16 rounded-[5px] object-cover"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={() => dispatch(decreaseItemQuantity(productInCart._id))}
        size="sm"
        className="h-fit p-2"
      >
        <Minus size={17} />
      </Button>

      {/* Numerical counter with sliding effect */}
      <div className="sm:text-md flex h-7 min-w-[24px] items-center justify-center overflow-hidden text-sm">
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
        onClick={() => dispatch(increaseItemQuantity(productInCart._id))}
        size="sm"
        className="h-fit p-2"
      >
        <Plus size={17} />
      </Button>
    </div>
  )
}
export default CartIncDec
