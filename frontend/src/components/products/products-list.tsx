import React from "react"
import ProductItem from "./product-item"

import { ShoppingBasket } from "lucide-react"
import ErrorMessage from "../error-message"
import ProductPagenation from "./product-pagenation"
import useProducts from "@/features/products/useProducts"

interface ProductsListProps {
  pageNumber: string
  name?: string
  category?: string
  productType?: string
  productBrand?: string
  isAvailable?: string
  maker?: string
  model?: string
  generation?: string
  user: any | null
}

const ProductsList: React.FC<ProductsListProps> = async ({
  user,
  pageNumber,
  name,
  category,
  productType,
  productBrand,
  maker,
  model,
  generation,
  isAvailable,
}) => {
  const { products, pagination, isError, isLoading, error } = useProducts()
  console.log("Products data:", products)

  if (error)
    return (
      <ErrorMessage
        icon={<ShoppingBasket className="h-10 w-10" />}
        className="my-7 px-2"
      >
        {" "}
        {error.message}.
      </ErrorMessage>
    )
  if (!products)
    return (
      <ErrorMessage
        icon={<ShoppingBasket className="h-10 w-10" />}
        className="my-7 px-2"
      >
        {" "}
        Something went wrong while grabbing the products.
      </ErrorMessage>
    )
  if (!products.length)
    return (
      <ErrorMessage
        icon={<ShoppingBasket className="h-10 w-10" />}
        className="my-7 px-2"
      >
        {" "}
        No products.
      </ErrorMessage>
    )

  const filters = {
    name,
    category,
    productType,
    productBrand,
    isAvailable,
    maker,
    model,
    generation,
  }
  const encondedFilters = encodeURIComponent(JSON.stringify(filters))
  return (
    <>
      <ul className="gr gr-cols-1 xs:gr-cols-2 xl:gr-cols-3 gap-3 p-3">
        {products && products.length
          ? products.map((product, i: number) => (
              <ProductItem
                user={user}
                currPage={pageNumber}
                pageSize={products.length}
                product={product}
                appliedFilters={encondedFilters}
                key={i}
              />
            ))
          : null}
      </ul>

      <ProductPagenation
        count={pagination?.totalCount || 0}
        // name={name}
        // categoryId={categoryId}
        // productTypeId={productTypeId}
        // productBrandId={productBrandId}
        // isAvailable={isAvailable}
      />
    </>
  )
}

export default ProductsList
