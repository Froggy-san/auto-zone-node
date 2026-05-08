import React from "react"
import { useDispatch, useSelector } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import CartITem from "./cart-item"
import { formatCurrency } from "@lib/client-helpers"
import { clearCart, getCart, getTotalCartPrices } from "./cartSlice"
import { ShoppingCart } from "lucide-react"
import { Button } from "@components/ui/button"
import useInitializeCart from "@hooks/use-initailize-cart"

const CartList = () => {
  const cartItems = useSelector(getCart)
  const totalPrices = useSelector(getTotalCartPrices)
  const dispatch = useDispatch()
  useInitializeCart()
  return (
    <section className="max-h-full flex-1 space-y-4 pb-10">
      <div className="flex w-full items-center justify-between rounded-lg border bg-secondary p-4 dark:bg-card">
        <motion.h2
          key={totalPrices}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-md font-semibold sm:text-lg"
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
      <div className="space-y-4 rounded-sm">
        <AnimatePresence mode="popLayout">
          {cartItems.length ? (
            cartItems.map((item, i) => (
              <CartITem key={item.id} item={item} index={i} />
            ))
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-md flex flex-col-reverse items-center justify-center gap-2 text-center text-muted-foreground sm:flex-row sm:text-left sm:text-2xl"
            >
              No items were added to your cart <ShoppingCart size={30} />
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

export default CartList
