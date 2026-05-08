// app/user/[userId]/page.tsx
// import EditFeesManagement from "@/components/dashboard/home/edit-fees-management"
// import ProductSoldManagement from "@/components/dashboard/home/product-sold-management"
import ErrorMessage from "@/components/error-message"
import Footer from "@/components/home/footer"
import Spinner from "@/components/Spinner"
import CarCarousel from "@/components/user/activity/car-carousel"
// import UserServices from "@/components/user/activity/user-services"
import useUserById from "@/features/users/useUserById"

import { getParam } from "@/lib/getParam"

import { Car } from "lucide-react"

import React, { Suspense } from "react"
import { PiEmpty } from "react-icons/pi"
import { useParams, useSearchParams } from "react-router"

// 1. Update the Props interface to expect a 'params' object

const UserActivity = () => {
  const params = useParams()
  const [searchParams] = useSearchParams()
  const pageNumber = getParam(searchParams, "pageNumber", "1")
  const dateTo = getParam(searchParams, "dateTo", "")
  const dateFrom = getParam(searchParams, "dateFrom", "")
  const carId = getParam(searchParams, "carId", "")
  const minPrice = getParam(searchParams, "minPrice", "")

  const serviceStatusId = getParam(searchParams, "serviceStatusId", "")
  const editFee = getParam(searchParams, "editFee", "")
  const addFeeId = getParam(searchParams, "addFeeId", "")
  const editSold = getParam(searchParams, "editSold", "")
  const addSoldId = getParam(searchParams, "addSoldId", "")

  const { userId } = params
  const { userById, isLoading, error } = useUserById(userId)

  const isAdmin = userById?.role === "admin"

  return (
    <main className="relative">
      <h2 className="text-4xl font-semibold">YOUR ACTIVITIES.</h2>

      <section className="space-y-24 pb-10 sm:pl-4">
        {/* {error ? (
          <ErrorMessage>
            {" "}
            <>{error.message || "Something went wrong"}</>{" "}
          </ErrorMessage>
        ) : userById ? (
          <>
            <EditFeesManagement feesId={editFee} addFeeId={addFeeId} />

            <Suspense
              fallback={
                <Spinner
                  size={30}
                  className="mt-10"
                  key={editSold + addSoldId}
                />
              }
            >
              <ProductSoldManagement
                editSold={editSold}
                addSoldId={addSoldId}
              />
            </Suspense>

            {userById?.cars ? (
              userById?.cars.length ? (
                <CarCarousel
                  user={userById}
             
                />
              ) : (
                <p className="flex flex-col items-center justify-center gap-3 text-muted-foreground sm:text-xl">
                  <Car className="h-[50px] w-[50px]" />
                  <span>No cars found.</span>
                </p>
              )
            ) : (
              <p className="flex flex-col items-center justify-center gap-3 text-muted-foreground sm:text-xl">
                <PiEmpty className="h-[50px] w-[50px]" />
                <span>Something went wrong.</span>
              </p>
            )}

            <Suspense
              fallback={<Spinner size={30} className="mt-10" key={key} />}
            >
              <UserServices
                user={user}
                serviceStatusId={serviceStatusId}
                pageNumber={pageNumber}
                dateTo={dateTo}
                dateFrom={dateFrom}
                clientId={String(clientId)}
                carId={carId}
                minPrice={minPrice}
                maxPrice={maxPrice}
                cars={clientCars}
                client={clientDetails as ClientWithPhoneNumbers}
              />
            </Suspense>
          </>
        ) : (
          <ErrorMessage>
            Someting went wrong, please make sure you are logged in.
          </ErrorMessage>
        )} */}
      </section>

      <Footer className="mt-44" />
    </main>
  )
}

export default UserActivity
