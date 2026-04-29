import React from "react"
import ProductsFilterContent from "./product-filter-content"
import type { Category, ProductBrand } from "@/types"
import type { CarMaker } from "@/types/carMaker"
import useProducts from "@/features/products/useProducts"

interface Props {
  name: string
  category: string
  productType?: string
  productBrand: string
  carMaker: string
  carModel: string
  generations: string
  isAvailable: string
  categories: Category[]
  carMakers: CarMaker[]
  productBrands: ProductBrand[]

  // count: number
}
const ProductsFilterBar: React.FC<Props> = ({
  category,
  productType,
  isAvailable,
  name,
  productBrand,
  categories,
  productBrands,
  // count,
  carMaker,
  carModel,
  generations,

  carMakers,
}) => {
  const { pagination } = useProducts()
  return (
    <aside className={`sm:w-[250px] sm:border-r 3xl:w-[260px]`}>
      <ProductsFilterContent
        name={name}
        count={pagination?.totalCount || 0}
        category={category}
        productType={productType}
        productBrand={productBrand}
        isAvailable={isAvailable}
        categories={categories || []}
        productBrands={productBrands || []}
        carMakers={carMakers}
        carMaker={carMaker}
        carModel={carModel}
        generations={generations}
      />
    </aside>
  )
}

export default ProductsFilterBar
