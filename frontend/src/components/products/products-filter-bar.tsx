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
  maker: string
  model: string
  generation: string
  isAvailable: string
  categories: Category[]
  carMakers: CarMaker[]
  productBrands: ProductBrand[]
  carBrand?: string
  // count: number
}
const ProductsFilterBar: React.FC<Props> =  ({
  category,
  productType,
  isAvailable,
  name,
  productBrand,
  categories,
  productBrands,
  // count,
  maker,
  model,
  generation,
  carBrand,
  carMakers,
}) => {
  const { pagination } = useProducts()
  return (
    <aside className={`3xl:w-[260px] sm:w-[250px] sm:border-r`}>
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
        maker={maker}
        model={model}
        generation={generation}
        carBrand={carBrand}
      />
    </aside>
  )
}

export default ProductsFilterBar
