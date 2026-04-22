import { Input } from "@/components/ui/input"
import { debounce } from "lodash"

import React, { useCallback } from "react"
import { useLocation, useNavigate, useSearchParams } from "react-router"

const ProductFilterInput = ({ name }: { name: string }) => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const pathname = useLocation().pathname
  const currPage = searchParams.get("page") ?? "1"

  const params = new URLSearchParams(searchParams)
  const handleSearch = useCallback(
    debounce((value) => {
      if (value === "") {
        params.delete("name")
      } else {
        params.set("name", value)
      }

      if (Number(currPage) > 1) params.set("page", "1")
      navigate(`${pathname}?${params.toString()}`, {
        replace: false,
      })
    }, 1000),
    [searchParams, navigate, pathname]
  )

  return (
    <div className="space-y-2">
      <label htmlFor="name">Search by name</label>
      <Input
        defaultValue={name}
        id="name"
        type="text"
        placeholder="name..."
        onChange={(e) => handleSearch(e.target.value)}
      />
    </div>
  )
}

export default ProductFilterInput
