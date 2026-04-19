"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Ellipsis,
  FilePenLine,
  Fullscreen,
  LoaderCircle,
  PackageMinus,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import DeleteProductDialog from "./delete-product-dialog";

export function ProdcutAction({
  imagesToDelete,
  productId,
  currPage,
  pageSize,
}: {
  imagesToDelete: string[];
  pageSize: number;
  currPage: string;
  productId: number;
}) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (isLoading) return <LoaderCircle size={12} className=" animate-spin" />;
  return (
    <div onClick={(e) => e.preventDefault()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className=" w-7 h-7  ">
            <Ellipsis size={15} />
            {/* <EllipsisVertical size={15} /> */}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Product actions</DropdownMenuLabel>
          {/* <DropdownMenuSeparator /> */}
          <DropdownMenuGroup>
            <Link
              href={`products/${productId}?size=${pageSize}&page=${currPage}`}
            >
              <DropdownMenuItem>
                View
                <DropdownMenuShortcut>
                  <Fullscreen size={18} />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </Link>
            <Link href={`/products/${productId}?edit=open`}>
              <DropdownMenuItem>
                Edit
                <DropdownMenuShortcut>
                  <FilePenLine size={18} />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuItem
              className=" text-red-700 hover:!text-red-700"
              onClick={() => {
                setOpen(true);
                // const body = document.querySelector("body");
                // if (body) {
                //   body.style.pointerEvents = "auto";
                // }
              }}
            >
              Delete
              <DropdownMenuShortcut>
                <PackageMinus size={18} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteProductDialog
        pageSize={pageSize}
        currPage={Number(currPage)}
        setIsLoading={setIsLoading}
        open={open}
        setOpen={setOpen}
        imagesToDelete={imagesToDelete}
        productId={productId}
      />
    </div>
  );
}
