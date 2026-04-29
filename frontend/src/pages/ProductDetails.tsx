import ProductManagement from "@/components/products-management"
import ProdcutViewDetials from "@/components/products/product-view-detials"
import FullImagesGallery from "@/components/full-images-gallery"
import { Button } from "@/components/ui/button"

import {
  ArrowBigLeftDash,
  ArrowBigRightDash,
  ArrowLeft,
  ImageOff,
} from "lucide-react"

import DeleteManagement from "@/components/products/delete-management"

import { ProductSwipeNavigator } from "@/components/products/product-swipe-navigator"

import Footer from "@/components/home/footer"
import { Link, useParams, useSearchParams } from "react-router"
import { getParam } from "@//lib/getParam"
import { get } from "lodash"
import { useProductById } from "@/features/products/useProductById"
import type { ProductImage } from "@/types"
import useCategories from "@/features/categories/useCategories"
import useProductBrands from "@/features/productBrands/useProductBrands"
import useCarMakers from "@/features/carMakers/useCarMakers"
import Spinner from "@/components/Spinner"
type AppliedFilters = {
  name: string
  categoryId: string
  productTypeId: string
  productBrandId: string
  isAvailable: string
  makerId: string
  modelId: string
  generationId: string
}

interface Params {
  productId: string
}
interface searchParams {
  size?: string
  page?: string
  name?: string
  categoryId?: string
  productTypeId?: string
  productBrandId?: string
  isAvailable?: string
  makerId?: string
  modelId?: string
  generationId?: string
  carBrand?: string
  filters?: string
}
const BASE_URL = import.meta.env.VITE_API_URL

const ProductDetails = () => {
  const [searchParams] = useSearchParams()
  const { id } = useParams()
  // const decondedFilters = getParam( searchParams,"filters")
  // ? decodeURIComponent(searchParams.filters)
  // : "{}";
  // const filters: AppliedFilters = JSON.parse(decondedFilters);
  const currPage = getParam(searchParams, "page") || "1"
  const pageSize = getParam(searchParams, "size") || ""

  const { product, nextProductId, prevProductId, isLoading, isError, error } =
    useProductById(id || "")

  // const [product, user, categories, productBrands, carBrands] =
  //   await Promise.all([
  //     getProductByIdAction(params.productId, {
  //       name,
  //       categoryId,
  //       productTypeId,
  //       productBrandId,
  //       isAvailable,
  //       makerId,
  //       modelId,
  //       generationId,
  //     }),
  //     getCurrentUser(),
  //     getAllCategoriesAction(),
  //     getAllProductBrandsAction(),
  //     getAllCarMakersAction(),
  //     // getAllProductTypesAction(),
  //   ]);

  // const { data: productData, error } = product
  // const { data: categoriesData, error: categoriesError } = categories
  // const { data: productBrandsData, error: productBrandsError } = productBrands
  // const { data: CarBrandsData, error: carBrandError } = carBrands
  // const { data: images, error: productImagesError } = productImages;
  // const { data: productData, error: producError } = product;

  const {
    categories,
    isError: categoryIsError,
    isLoading: categoryLoading,
    error: categoryError,
  } = useCategories()
  const {
    productBrands,
    error: productBrandsError,
    isError: productBrandsIsError,
    isLoading: productBrandsLoading,
  } = useProductBrands()

  const {
    carMakers,
    error: carMakersError,
    isError: carMakersIsError,
    isLoading: carMakersLoading,
  } = useCarMakers()

  const loading =
    carMakersLoading || categoryLoading || productBrandsLoading || isLoading

  if (loading) return <Spinner />
  if (error) return <p>{error.message}</p>
  if (!product || !id?.length) return <div>Couldn&apos;t find the product.</div>

  const imageUrls = product.productImages.map(
    (image: ProductImage) => `${BASE_URL}${image.imageUrl}`
  )
  const isAdmin = true

  // if (!productData)
  //   return (
  //     <p>
  //       {" "}
  //       Couldn&apos;t find that products&rsquo;{" "}
  //       <Button asChild>
  //         <Link to="/login">Login</Link>
  //       </Button>
  //     </p>
  //   )

  return (
    <ProductSwipeNavigator
      currentProductId={product._id}
      prevProductId={nextProductId}
      nextProductId={prevProductId}
    >
      <main className="relative mx-auto max-w-[2200px]">
        {imageUrls?.length ? (
          <FullImagesGallery images={imageUrls} productId={product._id} />
        ) : (
          <div className="flex h-full items-center justify-center gap-3 bg-foreground/10 py-5 text-xl font-semibold">
            <ImageOff className="h-10 w-10" /> No images.
          </div>
        )}
        <main className="px-2 py-1 sm:px-6">
          <ProdcutViewDetials user={null} isAdmin={isAdmin} product={product} />

          {isAdmin ? (
            <div className="mt-28 mb-5 flex flex-col items-center gap-5 px-2 sm:flex-row sm:px-5">
              <ProductManagement
                useParams
                className="w-full"
                carMakers={carMakers || []}
                categories={categories || []}
                productBrands={productBrands || []}
                productToEdit={product}
              />

              <DeleteManagement
                imagesToDelete={imageUrls}
                pageSize={Number(pageSize)}
                currPage={Number(currPage)}
                productId={product._id}
              />
            </div>
          ) : null}
        </main>
      </main>
      <Footer className="mt-40" />
    </ProductSwipeNavigator>
  )
}

export default ProductDetails
