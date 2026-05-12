import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Ellipsis,
  HandPlatter,
  LoaderCircle,
  PackageMinus,
  Pencil,
  View,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCallback, useState } from "react"
import CarDeleteDialog from "./car-delete-dialog"
import { useLocation, useNavigate, useSearchParams } from "react-router"
import type { Car, CarList } from "@/types"

export default function CarAction({
  pageSize,
  car,
}: {
  car: CarList
  pageSize?: number
}) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [searchParam] = useSearchParams()
  const navigate = useNavigate()
  const pathname = useLocation().pathname
  const currPage = searchParam.get("page") ?? "1"

  const imagesToDelete = car.carImages.map((image) => image.imagePath)
  const checkIfLastItem = useCallback(() => {
    const params = new URLSearchParams(searchParam)
    if (pageSize !== undefined && pageSize === 1) {
      if (Number(currPage) === 1) {
        params.delete("plateNumber")
        params.delete("chassisNumber")
        params.delete("motorNumber")
        params.delete("carInfoId")
        params.delete("clientId")
      }

      if (Number(currPage) > 1) {
        params.set("page", String(Number(currPage) - 1))
      }
    }
    navigate(`${pathname}?${params.toString()}`)
  }, [car.id, pageSize, currPage, pathname, searchParam])

  if (isLoading)
    return (
      <LoaderCircle size={12} className="absolute top-3 right-3 animate-spin" />
    )
  return (
    <div className="" onClick={(e) => e.preventDefault()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="absolute top-3 right-3 h-7 w-7"
          >
            <Ellipsis size={15} />
            {/* <EllipsisVertical size={15} /> */}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => {
              navigate(`/garage/${car.user}?car=${car.id}&service`)
            }}
          >
            Add service{" "}
            <DropdownMenuShortcut>
              <HandPlatter className="h-4 w-4" />
            </DropdownMenuShortcut>{" "}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              navigate(`/garage/${car.user.id}?car=${car.id}&edit=open`)
            }}
          >
            Edit{" "}
            <DropdownMenuShortcut>
              <Pencil className="h-4 w-4" />
            </DropdownMenuShortcut>{" "}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setOpen(true)}>
            Delete{" "}
            <DropdownMenuShortcut>
              <PackageMinus className="h-4 w-4" />
            </DropdownMenuShortcut>{" "}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CarDeleteDialog
        checkIfLastItem={checkIfLastItem}
        setIsLoading={setIsLoading}
        open={open}
        setOpen={setOpen}
        // imagePaths={imagesToDelete}
        clientId={car.user._id}
        carId={car.id}
      />
    </div>
  )
}
