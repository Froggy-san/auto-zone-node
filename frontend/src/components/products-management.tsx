import ProductForm from "@/components/products/products-form"

import { cn } from "@/lib/utils"
import type {
  Category,
  ProductBrand,
  ProductImage,
  ProductWithDetails,
} from "@/types"
import type { CarMaker } from "@/types/carMaker"
import React from "react"

const ProductManagement = async ({
  productToEdit,
  useParams = false,
  className,
  categories,
  productBrands,
  carMakers,
}: {
  productToEdit?: ProductWithDetails
  productToEditImages?: ProductImage[]
  categories: Category[]
  productBrands: ProductBrand[]
  className?: string
  useParams?: boolean
  carMakers: CarMaker[]
}) => {
  // const [categories, carInfos, productBrands, brandTypes] = await Promise.all([
  //   getAllCategoriesAction(),
  //   getAllCarsInfoAction(),
  //   getAllProductBrandsAction(),
  //   getAllProductTypesAction(),
  // ]);

  // const { data: categoriesData, error: categoriesError } = categories;
  // // const { data: carInfosData, error: carInfosError } = carInfos;
  // const { data: productBrandsData, error: productBrandsError } = productBrands;
  // const { data: brandTypesData, error: brandTypesError } = brandTypes;

  // const isError = categoriesError || productBrandsError || brandTypesError;

  // if (isError)
  //   return <p>Something went wrong while trying to fetch some data!.</p>;

  return (
    <div
      className={cn(
        "xs:flex-row xs:items-center flex flex-col justify-between gap-x-7 gap-y-2 rounded-lg border p-3 shadow-sm",
        className
      )}
    >
      <div className="space-y-0.5 text-center sm:text-left">
        <label className="font-semibold">Products</label>
        <p className="text-sm text-muted-foreground">
          {productToEdit ? "Edit product." : "Add product."}
        </p>
      </div>
      <div className="sm:pr-2">
        <ProductForm
          useParams={useParams}
          productToEdit={productToEdit}
          categories={categories || []}
          carMakers={carMakers}
          productBrand={productBrands || []}
        />
      </div>
    </div>
  )
}

export default ProductManagement
