import Categories from "@components/dashboard/insert-data/categories"
import ProductBrands from "@components/dashboard/insert-data/product-brands"
import ProductTypes from "@components/dashboard/insert-data/product-types"
import ServiceStatus from "@components/dashboard/insert-data/service-status"
import StatusManagement from "@components/dashboard/insert-data/status-management"
import Spinner from "@components/Spinner"
import { Metadata } from "next"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Insert-Data",
}
const Page = () => {
  return (
    <main className="relative">
      <h2 className="text-4xl font-semibold">INSERT RELEVANT DATA.</h2>
      <section className="pb-24 sm:pl-4">
        <div className="mt-12 space-y-20">
          <div className="space-y-7">
            <StatusManagement />
            <Suspense fallback={<Spinner className="h-[150px]" />}>
              <ServiceStatus />
            </Suspense>
          </div>
          <Categories />
          <ProductTypes />
          <ProductBrands />
        </div>
      </section>
    </main>
  )
}

export default Page
