"use client";
import CarBrandsCombobox from "@components/car-brands-combobox";
import { ComboBox } from "@components/combo-box";
import { ModelCombobox } from "@components/model-combobox";
import { Button } from "@components/ui/button";
import useSearchCategories from "@lib/queries/categories/useSearchCategory";
import useCarBrands from "@lib/queries/useCarBrands";
import useProductTypes from "@lib/queries/useProductTypes";
import { CarMakerData, CarMakersData, CategoryProps } from "@lib/types";
import { cn } from "@lib/utils";
import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";

interface Props {
  className?: string;
  categories: CategoryProps[];
  carMakers: CarMakersData[];
}

const HomeFilter = ({ categories, carMakers, className }: Props) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [makerId, setMakerId] = useState<number | null>(null);
  const [modelId, setModelId] = useState<number | null>(null);
  const [generationId, setGenerationId] = useState(0);
  const [productTypeId, setProductTypeId] = useState(0);
  const [categoryId, setCategoryId] = useState(0);
  const router = useRouter();
  // const { carBrands, isLoading: searching, error } = useCarBrands(searchTerm);
  const carModels =
    makerId && carMakers?.find((car) => car.id === makerId)?.carModels;
  const carGenerations =
    modelId &&
    carModels &&
    carModels.find((model) => model.id === modelId)?.carGenerations;

  const productTypes =
    categories.find((cat) => cat.id === categoryId)?.productTypes || [];
  const disabled =
    !makerId && !modelId && !generationId && !productTypeId && !categoryId;
  const first = useRef<HTMLButtonElement>(null);
  function handleClick() {
    if (disabled) return;
    let url = "/products?page=1";
    if (makerId) url = url + `&makerId=${makerId}&carBrand=${searchTerm}`;
    if (modelId) url = url + `&modelId=${modelId}`;
    if (generationId) url = url + `&generationId=${generationId}`;
    if (categoryId) url = url + `&categoryId=${categoryId}`;
    if (productTypeId) url = url + `&productTypeId=${productTypeId}`;
    router.push(url);
  }

  return (
    <section
      // onKeyDown={(e) => {
      //   if (e.code === "ArrowDown") {
      //     console.log("ARROW PRESSED ");

      //     if (first.current) first.current.focus();
      //   }
      // }}
      className={cn("space-y-2  w-full  mb-3", className)}
    >
      <CarBrandsCombobox
        ref={first}
        className=" h-14"
        options={carMakers || []}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        value={makerId}
        setValue={(value) => {
          setMakerId(value);
          setModelId(null);
          setGenerationId(0);
        }}
      />

      <ModelCombobox
        className=" h-14"
        disabled={!carModels || !carModels.length}
        options={carModels || []}
        value={modelId}
        setValue={(value) => {
          setModelId(value);
          setGenerationId(0);
        }}
      />
      <ComboBox
        className=" h-14"
        placeholder="Select generation..."
        disabled={!modelId || !carModels || !carModels.length}
        options={carGenerations || []}
        value={generationId}
        setValue={setGenerationId}
      />
      <ComboBox
        className=" h-14"
        placeholder="Select category..."
        disabled={!categories?.length}
        options={categories || []}
        value={categoryId}
        setValue={setCategoryId}
      />

      <ComboBox
        className=" h-14"
        placeholder="Select product type..."
        shouldFilter={false}
        disabled={!productTypes?.length}
        options={productTypes || []}
        value={productTypeId}
        setValue={setProductTypeId}
      />
      {/* <Category categories={categories} categoryId={categoryId} setCategoryId={setCategoryId} />
      <ProductTypes
        productTypeId={productTypeId}
        setProdcutTypeId={setProductTypeId}
      /> */}
      <Button
        disabled={disabled}
        onClick={handleClick}
        size="sm"
        className=" w-full select-none  "
      >
        Pick up
      </Button>
    </section>
  );
};

// function Category({
//   categoryId,
//   setCategoryId,
//   categories,
// }: {
//   categoryId: number;
//   setCategoryId: React.Dispatch<React.SetStateAction<number>>;
//   categories: CategoryProps[];
// }) {
//   const [searchTerm, setSearchTerm] = useState("");
//   // const { categories, error } = useSearchCategories(searchTerm);

//   return (
//     <ComboBox
//       className=" md:h-12"
//       placeholder="Select category..."
//       shouldFilter={false}
//       searchTerm={searchTerm}
//       setSearchTerm={setSearchTerm}
//       disabled={!categories?.length}
//       options={categories || []}
//       value={categoryId}
//       setValue={setCategoryId}
//     />
//   );
// }

// function ProductTypes({
//   productTypeId,
//   setProdcutTypeId,
// }: {
//   productTypeId: number;
//   setProdcutTypeId: React.Dispatch<React.SetStateAction<number>>;
// }) {
//   const [searchTerm, setSearchTerm] = useState("");
//   const { productTypes, error } = useProductTypes(searchTerm);

//   if (error)
//     return <p className=" text-destructive-foreground text-sm">{error}</p>;
//   return (
//     <ComboBox
//       className=" md:h-12"
//       placeholder="Select product type..."
//       shouldFilter={false}
//       searchTerm={searchTerm}
//       setSearchTerm={setSearchTerm}
//       disabled={!productTypes?.length}
//       options={productTypes || []}
//       value={productTypeId}
//       setValue={setProdcutTypeId}
//     />
//   );
// }

export default HomeFilter;
