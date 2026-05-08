import React, { useCallback, useRef, useState } from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import useLocalPagination from "@hooks/use-local-pagination"
import { Button } from "@components/ui/button"
import { ImageOff, MoveLeft, MoveRight } from "lucide-react"
import { formatCurrency } from "@lib/client-helpers"
import Link from "next/link"

interface Product {
  id: number
  productName?: string
  productImage: string | null
  pricePerUnit?: number
  totalCount: number
  totalDiscount: number
  fill: string
  totalPriceAfterDiscount: number
}
interface Props {
  products: Product[]
  date: (string | Date | undefined)[]
}
const SoldMoreDetails = ({ products, date }: Props) => {
  const [page, setpage] = useState(1)
  const ref = useRef<HTMLUListElement>(null)
  const { result, totalPages } = useLocalPagination({
    currPage: page,
    pageSize: 10,
    arr: products,
  })

  const handleScrollTop = useCallback(() => {
    if (ref.current) {
      ref.current.scrollTo(0, 0)
    }
  }, [ref])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" disabled={!totalPages}>
          See more
        </Button>
      </DialogTrigger>
      <DialogContent className="gap-0 p-0">
        <DialogHeader className="p-6 pb-1">
          <DialogTitle>Sold product detials</DialogTitle>
          <DialogDescription>
            This is a list of all products sold for the period{" "}
            {`'${date[0]}-${date[1]}'`}.
          </DialogDescription>
        </DialogHeader>
        <ul
          ref={ref}
          className="relative mx-2 max-h-[55vh] space-y-2 overflow-y-auto py-2 pr-2 xs:px-4"
        >
          {result.map((pro) => (
            <Link
              href={`/products/${pro.id}`}
              key={pro.id}
              className="flex h-fit gap-1 overflow-hidden rounded-md bg-secondary sm:gap-x-3 dark:bg-card/30"
            >
              <div className="flex max-w-[120px] min-w-[120px] items-center justify-center sm:max-h-28 sm:max-w-[150px] sm:min-w-[150px]">
                {pro.productImage ? (
                  <img
                    src={pro.productImage}
                    alt="Product image"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-foreground/10">
                    <ImageOff className="h-6 w-6" />
                  </div>
                )}
              </div>

              <div className="relative flex-1 p-2 text-left">
                <h2 className="line-clamp-1 max-w-full text-sm font-semibold">
                  {pro.productName}
                </h2>
                <div className="flex max-w-full flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground sm:gap-y-0">
                  <p>Total units sold: {pro.totalCount}</p>
                  <p>Total discount: {formatCurrency(pro.totalDiscount)}</p>
                  <p>Price per unit: {formatCurrency(pro.pricePerUnit || 0)}</p>
                  <p>Net: {formatCurrency(pro.totalPriceAfterDiscount)}</p>
                  <div
                    className="h-4 w-4 rounded"
                    style={{ backgroundColor: `${pro.fill}` }}
                  />
                </div>
              </div>
            </Link>
          ))}
        </ul>
        <div className="relative flex items-center justify-between p-6 pt-2">
          <div className="flex-shrink-0 text-xs text-muted-foreground">
            {page} / {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              className="w-full"
              disabled={page === 1 || !totalPages}
              onClick={() => {
                if (page === 1) return
                setpage((currPage) => currPage - 1)
                handleScrollTop()
              }}
              variant="secondary"
              size="sm"
            >
              <MoveLeft className="h-4 w-4" />
            </Button>

            <Button
              className="w-full"
              disabled={page === totalPages || !totalPages}
              onClick={() => {
                if (page === totalPages) return
                setpage((currPage) => currPage + 1)
                handleScrollTop()
              }}
              variant="secondary"
              size="sm"
            >
              <MoveRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SoldMoreDetails
