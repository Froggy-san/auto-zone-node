import React from "react"
import PaginationControl from "../../../components/pagination-controls"
import { getClientsCountAction } from "@lib/actions/clientActions"

interface ClientsPaginationProps {
  pageNumber: string
  name?: string
  phone?: string
  email?: string
}

const ClientsPagination = ({
  pageNumber,
  name,
  phone,
  email,
}: ClientsPaginationProps) => {
  const { data, error } = await getClientsCountAction({ name, email, phone })

  if (error) return <p>{error}</p>
  return <PaginationControl count={data} currPage={pageNumber} />
}

export default ClientsPagination
