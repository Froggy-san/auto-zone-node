import { Input } from "@components/ui/input";
import { debounce } from "lodash";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import React, { useCallback } from "react";

const ProductFilterInput = ({ name }: { name: string }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const currPage = searchParams.get("page") ?? "1";

  const params = new URLSearchParams(searchParams);
  const handleSearch = useCallback(
    debounce((value) => {
      if (value === "") {
        params.delete("name");
      } else {
        params.set("name", value);
      }

      if (Number(currPage) > 1) params.set("page", "1");
      router.replace(`${pathname}?${params.toString()}`, {
        scroll: false,
      });
    }, 1000),
    [searchParams, router, pathname]
  );

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
  );
};

export default ProductFilterInput;
