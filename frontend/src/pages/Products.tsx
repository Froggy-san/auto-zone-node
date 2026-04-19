import React, { Suspense } from "react"

import Header from "@/components/header"
import ProductsList from "@/components/products/products-list"
import Spinner from "@/components/Spinner"
import ProductPagenation from "@/components/products/product-pagenation"
import ProductsFilterBar from "@/components/products/products-filter-bar"
import IntersectionProvidor from "@/components/products/intersection-providor"
import { getAllCategoriesAction } from "@/lib/actions/categoriesAction"
import { getAllProductBrandsAction } from "@/lib/actions/productBrandsActions"
import { getAllProductTypesAction } from "@/lib/actions/productTypeActions"
import ProductManagement from "@/components/products-management"
import { getProductsCountAction } from "@/lib/actions/productsActions"
import { Metadata } from "next"
import { getCurrentUser } from "@/lib/actions/authActions"
import CategoryCarousel from "@/components/products/category-carousel"

export const metadata: Metadata = {
  title: "Products",
}

// Define the type for searchParam
interface SearchParams {
  // Add the properties you expect in searchParam

  page?: string
  name?: string
  categoryId?: string
  productTypeId?: string
  productBrandId?: string
  isAvailable?: string
}

const Page = async ({ searchParams }: { searchParams: SearchParams }) => {
  const name = searchParams?.name ?? ""
  const pageNumber = searchParams?.page ?? "1"
  const categoryId = searchParams?.categoryId ?? ""
  const productTypeId = searchParams?.productTypeId ?? ""
  const productBrandId = searchParams?.productBrandId ?? ""
  const isAvailable = searchParams?.isAvailable ?? ""

  // const supabase = await createClient();
  // if (productsError || categoriesError) {
  //   return <div>Error loading data</div>;
  // }

  const [categories, productBrands, brandTypes, user, count] =
    await Promise.all([
      getAllCategoriesAction(),
      getAllProductBrandsAction(),
      getAllProductTypesAction(),
      getCurrentUser(),
      getProductsCountAction({
        name,
        categoryId,
        productBrandId,
        productTypeId,
        isAvailable,
      }),
    ])

  // const { data: categoriesData, error: categoriesError } = categories
  // const { data: productBrandsData, error: productBrandsError } = productBrands
  // const { data: brandTypesData, error: brandTypesError } = brandTypes
  // const { data: countData, error: countError } = count

  const key =
    pageNumber +
    categoryId +
    productTypeId +
    productBrandId +
    isAvailable +
    name

  return (
    <main
      data-vaul-drawer-wrapper
      className="flex min-h-screen flex-col bg-background"
    >
      <div className="border-b">
        <Header />
        <div className="mb-4 space-y-2 px-2">
          <h3 className="text-md font-semibold">Categories</h3>
          <CategoryCarousel
            categories={categoriesData || []}
            options={{ dragFree: true }}
          />
        </div>
      </div>

      <IntersectionProvidor>
        <div className="flex w-full flex-1">
          <ProductsFilterBar
            name={name}
            categoryId={categoryId}
            productTypeId={productTypeId}
            productBrandId={productBrandId}
            isAvailable={isAvailable}
            categories={categoriesData}
            productBrands={productBrandsData}
            productTypes={brandTypesData}
            count={countData}
          />
          <section className="flex-1">
            <Suspense fallback={<Spinner />} key={key}>
              <ProductsList
                user={user}
                name={name}
                pageNumber={pageNumber}
                categoryId={categoryId}
                productTypeId={productTypeId}
                productBrandId={productBrandId}
                isAvailable={isAvailable}
              />
            </Suspense>
            <ProductPagenation
              count={countData}
              // name={name}
              // categoryId={categoryId}
              // productTypeId={productTypeId}
              // productBrandId={productBrandId}
              // isAvailable={isAvailable}
            />
            {/* {!user || user.sub !== "admin" ? null : (
              <div className=" my-10 px-2">
                <ProductManagement
                  categories={categoriesData}
                  productBrands={productBrandsData}
                  productTypes={brandTypesData}
                />
              </div>
            )} */}
            {user && (
              <div className="my-10 px-2">
                <ProductManagement
                  categories={categoriesData}
                  productBrands={productBrandsData}
                  productTypes={brandTypesData}
                />
              </div>
            )}
          </section>
        </div>
      </IntersectionProvidor>
    </main>
  )
}

export default Page
