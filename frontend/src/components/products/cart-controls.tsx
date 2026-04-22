"use client";
import {
  addItemToCart,
  decreaseItemQuantity,
  deleteCartItem,
  increaseItemQuantity,
} from "@components/cart/cartSlice";

import { RootState } from "@lib/store/store";
import { ProductById } from "@lib/types";
import React, { FC, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { BsCartDash } from "react-icons/bs";
import { useToast } from "@hooks/use-toast";
import { ToastAction } from "@components/ui/toast";
import { Button } from "@components/ui/button";
import { cn } from "@lib/utils";
import { Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import CartIncDec from "@components/cart/cart-inc-dec";
import useInitializeCart from "@hooks/use-initailize-cart";

interface Props {
  product: ProductById;
}

const CartControls: FC<Props> = ({ product }) => {
  const cart = useSelector(({ cartData }: RootState) => cartData.cart);
  const router = useRouter();
  const dispatch = useDispatch();
  const { toast } = useToast();
  useInitializeCart();
  const relatedProduct = cart.find((pro) => pro.id === product.id);
  const firstImage =
    relatedProduct && relatedProduct.productImages.length
      ? relatedProduct?.productImages?.[0]
      : null;

  const isNotInStock = !product.stock || !product.isAvailable;
  function handleAddItem() {
    if (isNotInStock) return;
    dispatch(addItemToCart(product));
    toast({
      className:
        " flex flex-col gap-5 items-start  bg-primary text-primary-foreground",
      title: `'${product.name}' added to your cart.`,
      description: "You can add more or remove it at anytime.",
      action: (
        <div className=" flex    justify-end  w-full gap-2">
          <ToastAction
            onClick={() => dispatch(deleteCartItem(product.id))}
            className=" bg-background hover:bg-background/90  text-secondary-foreground"
            altText="Goto schedule to undo"
          >
            Undo
          </ToastAction>
          <ToastAction
            onClick={() => router.push("/cart")}
            className=" bg-background hover:bg-background/90  text-secondary-foreground"
            altText="Goto schedule to undo"
          >
            Check out
          </ToastAction>
        </div>
      ),
    });
  }

  return (
    <motion.div className=" flex  items-center justify-end gap-2  relative">
  
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
                "inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-8 rounded-md px-3   "
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
            onClick={() => dispatch(deleteCartItem(product.id))}
            className=" inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground shadow hover:bg-secondary/90 h-8 rounded-md px-3  sm:h-9 text-xl sm:text-2xl "
          >
            <BsCartDash />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CartControls;
