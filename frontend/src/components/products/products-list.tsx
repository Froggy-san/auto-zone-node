import React, { useRef } from "react"
import ProductItem from "./product-item"

import { ShoppingBasket } from "lucide-react"
import ErrorMessage from "../error-message"
import ProductPagenation from "./product-pagenation"
import useProducts from "@/features/products/useProducts"
import { useSearchParams } from "react-router"
import { size } from "lodash"
import { getParam } from "@/lib/getParam"
import Spinner from "../Spinner"

interface ProductsListProps {
  pageNumber: string
  name?: string
  limit?: string
  category?: string
  productType?: string
  productBrand?: string
  isAvailable?: string
  carMaker?: string
  carModel?: string
  carBrand?: string
  generations?: string
  priceFrom?: string
  priceTo?: string
  user: any | null
}

const ProductsList: React.FC<ProductsListProps> = ({
  user,
  pageNumber,
  limit,
  name,
  category,
  productType,
  productBrand,
  carMaker,
  carModel,
  carBrand,
  generations,
  isAvailable,
  priceFrom,
  priceTo,
}) => {
  const [searchParams, setSearchParams] = useSearchParams()

  const currPage = getParam(searchParams, "page", "1")
  const contianerRef = useRef<HTMLUListElement | null>(null)
  const params = new URLSearchParams(searchParams.toString())

  const { products, pagination, isError, isLoading, error } = useProducts({
    page: pageNumber,
    limit: "12",
    name,
    carMaker,
    carBrand,
    carModel,
    category,
    productBrand,
    productType,
    generations,
    priceFrom,
    priceTo,
  })

  if (products) params.set("size", products.length.toString())

  if (error && !isLoading)
    return (
      <ErrorMessage
        icon={<ShoppingBasket className="h-10 w-10" />}
        className="my-7 px-2"
      >
        {" "}
        {error.message}.
      </ErrorMessage>
    )
  if (!products && !isLoading)
    return (
      <ErrorMessage
        icon={<ShoppingBasket className="h-10 w-10" />}
        className="my-7 px-2"
      >
        {" "}
        Something went wrong while grabbing the products.
      </ErrorMessage>
    )
  if (!products.length && !isLoading)
    return (
      <ErrorMessage
        icon={<ShoppingBasket className="h-10 w-10" />}
        className="my-7 px-2"
      >
        {" "}
        No products.
      </ErrorMessage>
    )

  // const encondedFilters = encodeURIComponent(JSON.stringify(filters))
  return (
    <>
      {isLoading ? (
        <Spinner />
      ) : (
        <ul
          ref={contianerRef}
          className="grid grid-cols-1 gap-3 p-3 xs:grid-cols-2 xl:grid-cols-3"
        >
          {products && products.length
            ? products.map((product, i: number) => (
                <ProductItem
                  user={user}
                  currPage={currPage}
                  pageSize={products.length}
                  product={product}
                  appliedFilters={params.toString()}
                  key={i}
                />
              ))
            : null}
        </ul>
      )}

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
