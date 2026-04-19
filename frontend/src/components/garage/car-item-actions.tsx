"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Ellipsis,
  HandPlatter,
  LoaderCircle,
  PackageMinus,
  Pencil,
  View,
} from "lucide-react";
import { Button } from "@components/ui/button";
import { useCallback, useState } from "react";
import CarDeleteDialog from "./car-delete-dialog";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CarItem } from "@lib/types";
export default function CarAction({
  pageSize,
  car,
}: {
  car: CarItem;
  pageSize?: number;
}) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchParam = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const currPage = searchParam.get("page") ?? "1";

  const imagesToDelete = car.carImages.map((image) => image.imagePath);
  const checkIfLastItem = useCallback(() => {
    const params = new URLSearchParams(searchParam);
    if (pageSize !== undefined && pageSize === 1) {
      if (Number(currPage) === 1) {
        params.delete("plateNumber");
        params.delete("chassisNumber");
        params.delete("motorNumber");
        params.delete("carInfoId");
        params.delete("clientId");
      }

      if (Number(currPage) > 1) {
        params.set("page", String(Number(currPage) - 1));
      }
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [car.id, pageSize, currPage, pathname, router, searchParam]);

  if (isLoading)
    return (
      <LoaderCircle
        size={12}
        className="  absolute right-3 top-3 animate-spin"
      />
    );
  return (
    <div className="" onClick={(e) => e.preventDefault()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className=" w-7 h-7 absolute top-3 right-3  "
          >
            <Ellipsis size={15} />
            {/* <EllipsisVertical size={15} /> */}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => {
              router.push(`/garage/${car.clientId}?car=${car.id}&service`);
            }}
          >
            Add service{" "}
            <DropdownMenuShortcut>
              <HandPlatter className=" w-4 h-4" />
            </DropdownMenuShortcut>{" "}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              router.push(`/garage/${car.clientId}?car=${car.id}&edit=open`);
            }}
          >
            Edit{" "}
            <DropdownMenuShortcut>
              <Pencil className=" h-4 w-4" />
            </DropdownMenuShortcut>{" "}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setOpen(true)}>
            Delete{" "}
            <DropdownMenuShortcut>
              <PackageMinus className=" h-4 w-4" />
            </DropdownMenuShortcut>{" "}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CarDeleteDialog
        checkIfLastItem={checkIfLastItem}
        setIsLoading={setIsLoading}
        open={open}
        setOpen={setOpen}
        imagePaths={imagesToDelete}
        clientId={car.clientId}
        carId={car.id}
      />
    </div>
  );
}
