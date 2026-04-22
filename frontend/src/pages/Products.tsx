// import React, { Suspense } from "react"

// import Header from "@/components/header"
// import ProductsList from "@/components/products/products-list"
// import Spinner from "@/components/Spinner"
// import ProductPagenation from "@/components/products/product-pagenation"
// import ProductsFilterBar from "@/components/products/products-filter-bar"
// import IntersectionProvidor from "@/components/products/intersection-providor"

// import ProductManagement from "@/components/products-management"

// import CategoryCarousel from "@/components/products/category-carousel"
import { useSearchParams } from "react-router"
import useProducts from "@/features/products/useProducts"
import useCategories from "@/features/categories/useCategories"
import useProductBrands from "@/features/productBrands/useProductBrands"
import IntersectionProvidor from "@/components/products/intersection-providor"
import ProductsFilterBar from "@/components/products/products-filter-bar"
import Header from "@/components/header"
import CategoryCarousel from "@/components/products/category-carousel"
import ProductsList from "@/components/products/products-list"
import ProductPagenation from "@/components/products/product-pagenation"
import ProductManagement from "@/components/products-management"

import { getParam } from "@/lib/getParam"
import useCarMakers from "@/features/carMakers/useCarMakers"
import Footer from "@/components/home/footer"

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

const Page = () => {
  const [searchParams] = useSearchParams()

  const name = getParam(searchParams, "name", "")
  const pageNumber = getParam(searchParams, "page", "1")
  const limit = getParam(searchParams, "limit", "20")
  const category = getParam(searchParams, "category", "")
  const productType = getParam(searchParams, "productType", "")
  const productBrand = getParam(searchParams, "productBrand", "")
  const isAvailable = getParam(searchParams, "isAvailable", "")
  const maker = getParam(searchParams, "maker", "")
  const model = getParam(searchParams, "model", "")
  const generation = getParam(searchParams, "generation", "")
  const carBrand = getParam(searchParams, "carBrand", "")

  const { categories: categoriesData, pagination: categoriesPagination } =
    useCategories()

  const { productBrands, pagination: productBrandsPagination } =
    useProductBrands()

  const { carMakers: carMakersData, pagination: carMakersPagination } =
    useCarMakers()

  console.log("Categories data:", categoriesData)
  console.log("Product Brands data:", productBrands)
  // const supabase = await createClient();
  // if (productsError || categoriesError) {
  //   return <div>Error loading data</div>;
  // }

  // const [categories, productBrands, brandTypes, user, count] =
  //   await Promise.all([
  //     getAllCategoriesAction(),
  //     getAllProductBrandsAction(),
  //     getAllProductTypesAction(),
  //     getCurrentUser(),
  //     getProductsCountAction({
  //       name,
  //       categoryId,
  //       productBrandId,
  //       productTypeId,
  //       isAvailable,
  //     }),
  //   ])

  // const { data: categoriesData, error: categoriesError } = categories
  // const { data: productBrandsData, error: productBrandsError } = productBrands
  // const { data: brandTypesData, error: brandTypesError } = brandTypes
  // const { data: countData, error: countError } = count

  return (
    <main
      data-vaul-drawer-wrapper
      className="flex min-h-screen flex-col bg-background"
    >
      <div className="border-b">
        <Header showSearch />
        <div className="mb-4 space-y-2 px-2">
          {/* <h3 className=" text-md font-semibold">Categories</h3> */}
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
            category={category}
            productType={productType}
            productBrand={productBrand}
            maker={maker}
            model={model}
            generation={generation}
            isAvailable={isAvailable}
            categories={categoriesData || []}
            carMakers={carMakersData || []}
            productBrands={productBrands || []}
            carBrand={carBrand}
            // count={pagination?.totalCount || 0}
          />
          <section className="flex-1">
            <ProductsList
              user={null}
              name={name}
              pageNumber={pageNumber}
              category={category}
              productType={productType}
              productBrand={productBrand}
              maker={maker}
              model={model}
              generation={generation}
              isAvailable={isAvailable}
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
            {/* {isAdmin && ( */}
            <div className="my-10 px-2">
              <ProductManagement
                categories={categoriesData || []}
                carMakers={carMakersData || []}
                productBrands={productBrands}
              />
            </div>
            {/* )} */}

            <Footer className=" " />
          </section>
        </div>
      </IntersectionProvidor>
    </main>
  )
}

export default Page
