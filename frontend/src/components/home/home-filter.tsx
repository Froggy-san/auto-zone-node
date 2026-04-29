import CarBrandsCombobox from "@/components/car-brands-combobox"
import { ComboBox } from "@/components/combo-box"
import { ModelCombobox } from "@/components/model-combobox"
import { Button } from "@/components/ui/button"

import { cn } from "@/lib/utils"
import type { Category } from "@/types"
import type { CarMaker } from "@/types/carMaker"

import React, { useRef, useState } from "react"
import { useNavigate } from "react-router"

interface Props {
  className?: string
  categories: Category[]
  carMakers: CarMaker[]
}

const HomeFilter = ({ categories, carMakers, className }: Props) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [maker, setMakerId] = useState<string | null>(null)
  const [model, setModelId] = useState<string | null>(null)
  const [generation, setgeneration] = useState("")
  const [productType, setproductType] = useState("")
  const [category, setcategory] = useState("")
  const navigate = useNavigate()
  // const { carBrands, isLoading: searching, error } = useCarBrands(searchTerm);
  const carModels =
    maker && carMakers?.find((car) => car._id === maker)?.carModels
  const carGenerations =
    model && carModels && carModels.find((m) => m._id === model)?.generations

  const productTypes =
    categories.find((cat) => cat._id === category)?.productTypes || []
  const disabled = !maker && !model && !generation && !productType && !category
  const first = useRef<HTMLButtonElement>(null)
  function handleClick() {
    if (disabled) return
    let url = "/products?page=1"
    if (maker) url = url + `&carMaker=${maker}&carBrand=${searchTerm}`
    if (model) url = url + `&carModel=${model}`
    if (generation) url = url + `&generations=${generation}`
    if (category) url = url + `&category=${category}`
    if (productType) url = url + `&productType=${productType}`
    navigate(url)
  }

  return (
    <section
      // onKeyDown={(e) => {
      //   if (e.code === "ArrowDown") {
      //     console.log("ARROW PRESSED ");

      //     if (first.current) first.current.focus();
      //   }
      // }}
      className={cn("mb-3 w-full space-y-2", className)}
    >
      <CarBrandsCombobox
        ref={first}
        className="h-14"
        options={carMakers || []}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        value={maker}
        setValue={(value) => {
          setMakerId(value)
          setModelId(null)
          setgeneration("")
        }}
      />

      <ModelCombobox
        className="h-14"
        disabled={!carModels || !carModels.length}
        options={carModels || []}
        value={model}
        setValue={(value) => {
          setModelId(value)
          setgeneration("")
        }}
      />
      <ComboBox
        className="h-14"
        placeholder="Select generation..."
        disabled={!model || !carModels || !carModels.length}
        options={carGenerations || []}
        value={generation}
        setValue={setgeneration}
      />
      <ComboBox
        className="h-14"
        placeholder="Select category..."
        disabled={!categories?.length}
        options={categories || []}
        value={category}
        setValue={setcategory}
      />

      <ComboBox
        className="h-14"
        placeholder="Select product type..."
        shouldFilter={false}
        disabled={!productTypes?.length}
        options={productTypes || []}
        value={productType}
        setValue={setproductType}
      />
      {/* <Category categories={categories} category={category} setcategory={setcategory} />
      <ProductTypes
        productType={productType}
        setProdcutTypeId={setproductType}
      /> */}
      <Button
        disabled={disabled}
        onClick={handleClick}
        size="sm"
        className="w-full select-none"
      >
        Pick up
      </Button>
    </section>
  )
}

// function Category({
//   category,
//   setcategory,
//   categories,
// }: {
//   category: number;
//   setcategory: React.Dispatch<React.SetStateAction<number>>;
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
//       value={category}
//       setValue={setcategory}
//     />
//   );
// }

// function ProductTypes({
//   productType,
//   setProdcutTypeId,
// }: {
//   productType: number;
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
//       value={productType}
//       setValue={setProdcutTypeId}
//     />
//   );
// }

export default HomeFilter
