import { Button } from "@components/ui/button";
import { Minus, Plus } from "lucide-react";
import React from "react";
import { useDispatch } from "react-redux";
import { decreaseItemQuantity, increaseItemQuantity } from "./cartSlice";
import { AnimatePresence, motion } from "framer-motion";
import { CartItem, ProductById } from "@lib/types";

const CartIncDec = ({ productInCart }: { productInCart: CartItem }) => {
  const dispatch = useDispatch();

  return (
    <div className=" flex items-center  transition-opacity overflow-hidden duration-300   gap-2">
      <Button
        onClick={() => dispatch(decreaseItemQuantity(productInCart.id))}
        size="sm"
        className="  p-2 h-fit "
      >
        <Minus size={17} />
      </Button>

      <motion.span
        key={productInCart?.quantity}
        initial={{ opacity: 0, translateY: -7 }}
        animate={{
          opacity: 1,
          translateY: 0,
        }}
        exit={{
          opacity: 0,
          translateY: 7,
        }}
      >
        {productInCart?.quantity || 0}
      </motion.span>

      <Button
        disabled={productInCart?.quantity === productInCart.stock}
        onClick={() => dispatch(increaseItemQuantity(productInCart.id))}
        size="sm"
        className="  p-2 h-fit "
      >
        <Plus size={17} />
      </Button>
    </div>
  );
};

export default CartIncDec;
