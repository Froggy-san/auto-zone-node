import { cn } from "@/lib/utils"
import React, { useMemo } from "react"
import FullImagesGallery from "./product-images"

import { ProdcutAction } from "./product-actions"

import { ImageOff } from "lucide-react"
import ProductPrices from "./product-prices"
import type { Product } from "@/types"
import { Link } from "react-router"

const ProductItem = ({
  user,
  product,
  pageSize,
  currPage,
  appliedFilters,
}: {
  user: any | null
  pageSize: number
  currPage: string
  product: Product
  appliedFilters: string
}) => {
  const viewedImages = product.productImages?.map((imgObj) => imgObj.imageUrl)
  const isAdmin = user?.user_metadata.role === "Admin"
  return (
    <li
      className={`${(!product.isAvailable || !product.stock) && "opacity-50"}`}
    >
      <Link
        to={`/products/${product._id}?${appliedFilters}`}
        className="flex flex-col space-y-1"
        // prefetch={false}
      >
        <>
          {viewedImages?.length ? (
            <FullImagesGallery
              imageUrls={viewedImages}
              productId={product._id}
              className="relative h-[250px] overflow-hidden rounded-lg select-none 3xl:h-[330px] 4xl:h-[400px]"
            />
          ) : (
            <div className="flex h-[250px] items-center justify-center rounded-lg bg-foreground/10 3xl:h-[330px] 4xl:h-[400px]">
              <ImageOff className="h-20 w-20" />
            </div>
          )}
        </>

        {/* {product.category} */}
        <div className="flex flex-1 flex-col space-y-1">
          <h1 className="line-clamp-1 text-xl font-semibold">{product.name}</h1>
          <h2
            title={product.description}
            className="line-clamp-2 text-sm break-words text-muted-foreground"
          >
            {product.description}
          </h2>
          <div className="flex items-center justify-between text-xs">
            <ProductPrices product={product} />
            {/* {product.salePrice ? (
              <span className=" text-green-500 dark:text-green-600">
                {formatCurrency(product.salePrice)}
              </span>
            ) : (
              <span className="text-muted-foreground">
                {formatCurrency(product.listPrice)}
              </span>
            )} */}
            <div className="flex items-center gap-3">
              <span
                className={cn("text-muted-foreground", {
                  "text-green-500 dark:text-green-600":
                    product.stock && product.isAvailable,
                })}
              >
                {product.stock && product.isAvailable
                  ? "In stock"
                  : "Out of stock"}
              </span>
              {/* {user && isAdmin && ( */}
              <ProdcutAction
                imagesToDelete={viewedImages}
                currPage={currPage}
                pageSize={pageSize}
                productId={product._id}
              />
              {/* )} */}
            </div>
          </div>
        </div>
      </Link>
    </li>
  )
}

export default ProductItem
