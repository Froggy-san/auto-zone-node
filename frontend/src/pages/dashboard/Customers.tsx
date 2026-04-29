import ClientManagement from "@components/dashboard/clients/client-management"
import ClientSearch from "@components/dashboard/clients/client-search"
import ClientsList from "@components/dashboard/clients/clients-list"
import ClientsPagination from "@components/dashboard/clients/clients-pagination"
import Spinner from "@components/Spinner"
import { Metadata } from "next"
import React, { Suspense } from "react"

export const metadata: Metadata = {
  title: "Customers",
}

interface SearchParams {
  page?: string
  name?: string
  phone?: string
  email?: string
}
const Page = ({ searchParams }: { searchParams: SearchParams }) => {
  const pageNumber = searchParams?.page ?? "1"
  const name = searchParams.name ?? ""
  const phone = searchParams.phone ?? ""
  const email = searchParams.email ?? ""

  const key = pageNumber + name + phone + email
  const pageKey = name + email + phone
  return (
    <main>
      <h2 className="text-4xl font-semibold">MANAGE CLIENTS.</h2>

      <section className="mt-12 sm:pl-4">
        <ClientManagement />

        <div className="mx-auto mt-10 max-w-[97%]">
          <ClientSearch
            currPage={pageNumber}
            name={name}
            phone={phone}
            email={email}
          />
          <Suspense
            fallback={<Spinner className="h-[300px]" size={30} />}
            key={key}
          >
            <ClientsList
              pageNumber={pageNumber}
              name={name}
              email={email}
              phone={phone}
            />
          </Suspense>

          {/* <Suspense
            key={pageKey}
            fallback={<Spinner className=" h-fit" size={15} />}
          >
            <ClientsPagination
              pageNumber={pageNumber}
              name={name}
              email={email}
              phone={phone}
            />
          </Suspense> */}
        </div>
      </section>
    </main>
  )
}

export default Page
