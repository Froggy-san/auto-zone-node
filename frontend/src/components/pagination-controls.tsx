import { Button } from "@/components/ui/button"
import { PAGE_SIZE } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { MoveLeft, MoveRight } from "lucide-react"

import React, { useEffect } from "react"
import { useLocation, useNavigate, useSearchParams } from "react-router"

interface PaginationControlProps {
  currPage: string
  count: number | string
  className?: string
}

const PaginationControl = ({
  count,
  currPage,
  className,
}: PaginationControlProps) => {
  const page = Number(currPage)
  const pageCount = Math.ceil(Number(count) / PAGE_SIZE)
  const [searchParam] = useSearchParams()
  const pathname = useLocation().pathname
  const navigate = useNavigate()
  const params = new URLSearchParams(searchParam)

  function handleNext() {
    if (page === pageCount) return
    params.set("page", String(page + 1))
    navigate(`${pathname}?${params.toString()}`)
  }

  function handlePrev() {
    if (page === 1) return
    params.set("page", String(page - 1))
    navigate(`${pathname}?${params.toString()}`)
  }

  useEffect(() => {
    const currentPage = Number(page)
    const prefechParams = new URLSearchParams(searchParam)
    if (currentPage < pageCount) {
      prefechParams.set("page", String(currentPage + 1))
    }

    if (currentPage > 1) {
      prefechParams.set("page", String(currentPage - 1))
    }
  }, [page, searchParam, pathname, pageCount])

  return (
    <div className={cn("flex items-center justify-between px-4", className)}>
      {/* <div className=" text-xs  text-muted-foreground">{`${currPage} / ${pageCount}`}</div>
       */}
      <p className="mt-2 text-xs text-muted-foreground">
        Showing <span>{(page - 1) * PAGE_SIZE + 1}</span> to{" "}
        <span>{page === pageCount ? count : page * PAGE_SIZE}</span> of{" "}
        <span>{count}</span> results
      </p>
      {pageCount > 1 && (
        <div className="my-4 flex justify-end gap-3">
          <Button
            onClick={handlePrev}
            size="icon"
            variant="secondary"
            disabled={page === 1}
          >
            <MoveLeft size={12} />
          </Button>
          <Button
            onClick={handleNext}
            variant="secondary"
            size="icon"
            disabled={page === pageCount}
          >
            <MoveRight size={12} />
          </Button>
        </div>
      )}
    </div>
  )
}

export default PaginationControl
