import React, { FC, useEffect, useImperativeHandle } from "react"
import { motion, useAnimate, usePresence } from "framer-motion"
import { CartItem } from "@lib/types"
import { ImageOff } from "lucide-react"
import { Button } from "@components/ui/button"
import { useDispatch } from "react-redux"
import { deleteCartItem } from "./cartSlice"
import CartIncDec from "./cart-inc-dec"
import { formatCurrency } from "@lib/client-helpers"
import Link from "next/link"

interface Props {
  item: CartItem
  index: number
}

const CartITem = React.forwardRef<HTMLDivElement, Props>(
  ({ item, index }, ref) => {
    const [isPresent, safeToRemove] = usePresence()
    const [scope, animate] = useAnimate()
    useImperativeHandle(ref, () => scope.current)

    const dispatch = useDispatch()
    const proImage =
      (item.productImages.length &&
        item.productImages.find((image) => image.isMain)) ||
      item.productImages[0]

    useEffect(() => {
      if (!isPresent) {
        const exitAnimation = async () => {
          await animate(
            scope.current,
            { scale: 1.025 },
            { ease: "easeIn", duration: 0.125 }
          )

          await animate(
            scope.current,
            {
              opacity: 0,
              x: index % 2 === 0 ? 24 : -24,
            },
            {
              delay: 0.75,
            }
          )
          safeToRemove()
        }

        exitAnimation()
      }
    }, [isPresent])

    return (
      <motion.div layout ref={scope}>
        <Link
          href={`/products/${item.id}`}
          className="flex max-h-[186px] flex-row overflow-hidden rounded-md bg-gray-200 dark:bg-card/30"
        >
          <div className="flex max-h-full max-w-[350px] items-center justify-center bg-foreground/10">
            {proImage ? (
              <img
                src={proImage.imageUrl}
                alt={`${item.name}' image `}
                className="h-full w-full object-cover"
              />
            ) : (
              <ImageOff className="h-6 w-6" />
            )}
          </div>

          <div className="flex flex-1 flex-col justify-between p-2">
            <div className="space-y-1">
              <h2 className="xs:text-md line-clamp-2 text-sm font-semibold">
                {" "}
                {item.name}
              </h2>
              <p className="line-clamp-2 text-[11px] text-muted-foreground xs:text-xs">
                {item.description}
              </p>
            </div>

            <div
              onClick={(e) => {
                e.preventDefault()
              }}
              className="mt-3 flex flex-col-reverse items-end justify-end gap-2 xs:flex-row xs:items-center sm:gap-7 lg:mt-6"
            >
              <motion.div
                key={item.totalPrice}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-1 flex-col items-center justify-end gap-3 text-xs md:flex-row"
              >
                <div className="flex items-center gap-2">
                  <div className="text-muted-foreground">
                    <span> Total Disocunt: </span>
                    <span>
                      {formatCurrency(
                        (item.listPrice - item.salePrice) * item.quantity
                      )}
                    </span>
                  </div>
                </div>
                <span> {formatCurrency(item.totalPrice)}</span>
              </motion.div>

              <div className="flex items-center gap-2">
                <CartIncDec productInCart={item} />
                <Button
                  onClick={() => dispatch(deleteCartItem(item.id))}
                  size="sm"
                  variant="secondary"
                >
                  Remove
                </Button>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    )
  }
)
export default CartITem

CartITem.displayName = "CartITem"
