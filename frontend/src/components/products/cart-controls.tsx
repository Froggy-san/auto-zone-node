import {
  addItemToCart,
  decreaseItemQuantity,
  deleteCartItem,
  increaseItemQuantity,
} from "@/components/cart/cartSlice"

import React, { type FC, useCallback } from "react"

import { AnimatePresence, motion } from "framer-motion"
import { BsCartDash } from "react-icons/bs"
import { useToast } from "@/hooks/use-toast"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Minus, Plus } from "lucide-react"

import CartIncDec from "@/components/cart/cart-inc-dec"
import useInitializeCart from "@/hooks/use-initailize-cart"
import type { ProductWithDetails } from "@/types"
import type { RootState } from "@/lib/store/store"
import { useNavigate } from "react-router"
import { useDispatch, useSelector } from "react-redux"
import { toast } from "sonner"

interface Props {
  product: ProductWithDetails
}

const CartControls: FC<Props> = ({ product }) => {
  const cart = useSelector(({ cartData }: RootState) => cartData.cart)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  useInitializeCart()
  const relatedProduct = cart.find((pro) => pro._id === product._id)
  const firstImage =
    relatedProduct && relatedProduct.productImages.length
      ? relatedProduct?.productImages?.[0]
      : null

  const isNotInStock = !product.stock || !product.isAvailable
  function handleAddItem() {
    if (isNotInStock) return
    dispatch(addItemToCart(product))

    toast.success("Item added to cart", {
      description: "You can add more or remove it at anytime.",

      action: (
        <div className="flex w-full justify-end gap-2">
          <Button
            onClick={() => dispatch(deleteCartItem(product._id))}
            className="bg-background text-secondary-foreground hover:bg-background/90"
            // altText="Goto schedule to undo"
          >
            Undo
          </Button>
          <Button
            onClick={() => navigate("/cart")}
            className="bg-background text-secondary-foreground hover:bg-background/90"
            // altText="Goto schedule to undo"
          >
            Check out
          </Button>
        </div>
      ),
    })
    // toast({
    //   className:
    //     " flex flex-col gap-5 items-start  bg-primary text-primary-foreground",
    //   title: `'${product.name}' added to your cart.`,
    //   description: "You can add more or remove it at anytime.",
    //   action: (
    //     <div className=" flex    justify-end  w-full gap-2">
    //       <ToastAction
    //         onClick={() => dispatch(deleteCartItem(product.id))}
    //         className=" bg-background hover:bg-background/90  text-secondary-foreground"
    //         altText="Goto schedule to undo"
    //       >
    //         Undo
    //       </ToastAction>
    //       <ToastAction
    //         onClick={() => navigate.push("/cart")}
    //         className=" bg-background hover:bg-background/90  text-secondary-foreground"
    //         altText="Goto schedule to undo"
    //       >
    //         Check out
    //       </ToastAction>
    //     </div>
    //   ),
    // });
  }

  return (
    <motion.div className="relative flex items-center justify-end gap-2">
      <motion.div layout>
        <AnimatePresence>
          {relatedProduct?.quantity ? (
            <CartIncDec productInCart={relatedProduct} />
          ) : (
            // <div
            //   className={cn(
            //     " flex items-center  transition-opacity duration-300  gap-2"
            //   )}
            // >
            //   <Button
            //     onClick={() => dispatch(decreaseItemQuantity(product.id))}
            //     size="sm"
            //   >
            //     <Minus size={17} />
            //   </Button>
            //   <motion.span
            //     key={relatedProduct?.quantity}
            //     initial={{ opacity: 0, translateY: -7 }}
            //     animate={{
            //       translateY: 0,
            //       opacity: 1,
            //     }}
            //     exit={{
            //       translateY: 7,
            //       opacity: 0,
            //     }}
            //   >
            //     {relatedProduct?.quantity || 0}
            //   </motion.span>
            //   <Button
            //     disabled={relatedProduct?.quantity === product.stock}
            //     onClick={() => dispatch(increaseItemQuantity(product.id))}
            //     size="sm"
            //   >
            //     <Plus size={17} />
            //   </Button>
            // </div>
            <motion.button
              onClick={handleAddItem}
              disabled={isNotInStock}
              className={cn(
                "inline-flex h-8 items-center justify-center rounded-md bg-primary px-3 font-medium whitespace-nowrap text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
              )}
            >
              {isNotInStock ? "Out Of Stock" : "Add To Cart"}
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence mode="popLayout">
        {relatedProduct && (
          <motion.button
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch(deleteCartItem(product._id))}
            className="inline-flex h-8 items-center justify-center rounded-md bg-secondary px-3 text-xl font-medium whitespace-nowrap text-secondary-foreground shadow transition-colors hover:bg-secondary/90 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 sm:h-9 sm:text-2xl"
          >
            <BsCartDash />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default CartControls
