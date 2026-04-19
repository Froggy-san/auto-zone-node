"use client";
import { PAGE_SIZE } from "@lib/constants";
import * as React from "react";
import usePagination from "@mui/material/usePagination/usePagination";
import { Button } from "@components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMediaQuery } from "@mui/material";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useIntersectionProvidor } from "@components/products/intersection-providor";

interface GaragePaginationProps {
  // color: string;
  // plateNumber: string;
  // chassisNumber: string;
  // motorNumber: string;
  // clientId: string;
  // carGenerationId: string;
  count: number;
}
const GaragePagination: React.FC<GaragePaginationProps> = ({
  // color,
  // plateNumber,
  // chassisNumber,
  // motorNumber,
  // clientId,
  // carGenerationId,
  count,
}) => {
  const { ref } = useIntersectionProvidor();

  const searchParam = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // const { count, error, isLoading } = useGragePagination({
  //   color,
  //   plateNumber,
  //   chassisNumber,
  //   motorNumber,
  //   clientId,
  //   carInfoId: carGenerationId,
  // });

  const defaultValue = searchParam.get("page") ?? "1";
  const numberOfPages = Math.ceil(count / PAGE_SIZE);

  const isSmallScreen = useMediaQuery("(max-width:600px)");

  const { items } = usePagination({
    // defaultPage: Number(defaultValue),
    count: numberOfPages,
    siblingCount: isSmallScreen ? 0 : 1, // No sibling buttons on small screens
    boundaryCount: 1, // Only 1 boundary button on small screens
    onChange: (event: React.ChangeEvent<unknown>, page: number) => {
      if (page > numberOfPages || page < 1) return;
      const params = new URLSearchParams(searchParam);
      params.set("page", String(page));
      router.push(`${pathname}?${params.toString()}`);
    },
  });

  // if (isLoading) return <Spinner className=" h-52" />;
  // if (error) return <p>{error}</p>;
  if (!count) return null;
  return (
    <nav ref={ref} className=" w-full my-4">
      <ul className="  flex gap-3  w-full justify-center">
        {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
        {items.map(({ page, type, disabled, ...item }, index) => {
          let children = null;

          if (type === "start-ellipsis" || type === "end-ellipsis") {
            children = "…";
          } else if (type === "page") {
            children = (
              <Button
                size="sm"
                type="button"
                disabled={page === Number(defaultValue)}
                // style={{
                //   pointerEvents: selected ? "none" : "auto",
                //   opacity: selected ? "0.8" : "1",
                //   fontWeight: selected ? "bold" : undefined,
                // }}
                {...item}
              >
                {page}
              </Button>
            );
          } else {
            children = (
              <Button
                type="button"
                disabled={
                  (type === "previous" && Number(defaultValue) === 1) ||
                  (type === "next" && Number(defaultValue) === numberOfPages)
                }
                {...item}
                size="sm"
              >
                {type === "next" ? (
                  <>
                    {" "}
                    {!isSmallScreen && "Next"} <ChevronRight size={15} />{" "}
                  </>
                ) : (
                  <>
                    {" "}
                    <ChevronLeft size={15} /> {!isSmallScreen && "Previous"}
                  </>
                )}
              </Button>
            );
          }

          return <li key={index}>{children}</li>;
        })}
      </ul>
    </nav>
  );
};

export default GaragePagination;
