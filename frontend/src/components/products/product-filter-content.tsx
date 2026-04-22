import { ComboBox } from "@/components/combo-box"

import { Filter, UndoIcon } from "lucide-react"

import React, { use, useCallback, useEffect, useState } from "react"
import ProdcutFilterInput from "./product-filter-input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"

import { useMediaQuery } from "@mui/material"
import { useIntersectionProvidor } from "./intersection-providor"
import { cn } from "@/lib/utils"
import {
  DrawerProvidor,
  DrawerContent,
  DrawerOverlay,
} from "@/components/DrawerComponent"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { PAGE_SIZE } from "@/lib/constants"
import CarBrandsCombobox from "@/components/car-brands-combobox"

import { useLocation, useNavigate, useSearchParams } from "react-router"
import type { CarGeneration, CarModel, Category, ProductBrand } from "@/types"

import type { CarMaker } from "@/types/carMaker"
import { ModelCombobox } from "../model-combobox"

interface ProdcutFilterContentProps {
  categories: Category[]
  productBrands: ProductBrand[]
  category?: string
  name?: string
  productType?: string
  productBrand?: string
  isAvailable?: string
  count: number
  maker?: string
  model?: string
  generation?: string
  carMakers: CarMaker[]
  carBrand?: string
}
const ProductsFilterContent: React.FC<ProdcutFilterContentProps> = ({
  categories,
  productBrands,
  category,
  name,
  isAvailable,
  productType,
  productBrand,
  count,
  maker,
  model,
  generation,
  carMakers,
  carBrand,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedMaker, setSelectedMaker] = useState<string | undefined>(
    maker || undefined
  )
  const [selectedModel, setSelectedModel] = useState<string | undefined>(
    model || undefined
  )
  const [selectedGeneration, setSelectedGeneration] = useState<
    string | undefined
  >(generation || undefined)
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    category || undefined
  )
  const [selectedProductType, setSelectedProductType] = useState<
    string | undefined
  >(productType || undefined)
  const [selectedProductBrand, setSelectedProductBrand] = useState<
    string | undefined
  >(productBrand || undefined)

  const handleReset = useCallback(() => {
    setSelectedMaker("")
    setSelectedModel("")
    setSelectedGeneration("")
    setSelectedProductBrand("")
    setSelectedProductType("")
    setSelectedCategory("")
  }, [])

  const { inView } = useIntersectionProvidor()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const pathname = useLocation().pathname
  const isBigScreen = useMediaQuery("(min-width:640px)")

  const isFirstMount = [
    selectedMaker,
    selectedModel,
    selectedGeneration,
    selectedCategory,
    selectedProductType,
    selectedProductBrand,
  ].every((filter) => filter === undefined)

  const disappear = count > 2 && Math.ceil(count / PAGE_SIZE) > 3

  const productTypes =
    selectedCategory &&
    categories.find((cat) => cat._id === selectedCategory)?.productTypes

  const carModels =
    selectedMaker &&
    carMakers?.find((car) => car._id === selectedMaker)?.carModels
  const carGenerations =
    selectedModel &&
    carModels &&
    carModels.find((selectedModel) => selectedModel._id === selectedModel._id)
      ?.carGenerations

  const params = new URLSearchParams(searchParams)
  function handleChange(filter: string, name: string, initalValue?: string) {
    params.set("page", "1")
    if (name === "makerId") {
      params.delete("modelId")
      params.delete("generationId")
    }

    if (name === "modelId") params.delete("generationId")
    if (name === "categoryId") params.delete("productTypeId")
    if (!filter || filter === initalValue) {
      params.delete(`${name}`)
      params.set("page", "1")
      navigate(`${pathname}?${params.toString()}`, { replace: true })
    } else {
      /// Filters to be reset after changing the pick of a perant select component.
      // if (name === "makerId") {
      //   params.delete("modelId");
      //   params.delete("generationId");
      // }

      // if (name === "modelId") params.delete("generationId");
      // if (name === "categoryId") params.delete("productTypeId");
      // params.set("page", "1");
      params.set(`${name}`, filter)
      navigate(`${pathname}?${params.toString()}`)
    }
    window.scrollTo(0, 0)
  }

  useEffect(() => {
    if (isFirstMount) return
    params.set("page", "1")
    if (selectedMaker !== undefined) {
      // Car Maker.
      if (selectedMaker) {
        params.set("makerId", selectedMaker)
        navigate(`${pathname}?${params.toString()}`)
      } else {
        params.delete("makerId")
        navigate(`${pathname}?${params.toString()}`, { replace: true })
      }
    }

    if (selectedModel !== undefined) {
      // Car Model.
      if (selectedModel) {
        params.set("modelId", selectedModel)
        navigate(`${pathname}?${params.toString()}`)
      } else {
        params.delete("modelId")
        navigate(`${pathname}?${params.toString()}`, { replace: true })
      }
    }

    if (selectedGeneration !== undefined) {
      if (selectedGeneration) {
        params.set("generationId", selectedGeneration)
        navigate(`${pathname}?${params.toString()}`)
      } else {
        params.delete("generationId")
        navigate(`${pathname}?${params.toString()}`, { replace: true })
      }
    }

    if (selectedCategory !== undefined) {
      if (selectedCategory) {
        params.set("categoryId", selectedCategory)
        navigate(`${pathname}?${params.toString()}`)
      } else {
        params.delete("categoryId")
        navigate(`${pathname}?${params.toString()}`, { replace: true })
      }
    }

    if (selectedProductType !== undefined) {
      if (selectedProductType) {
        params.set("productTypeId", selectedProductType)
        navigate(`${pathname}?${params.toString()}`)
      } else {
        params.delete("productTypeId")
        navigate(`${pathname}?${params.toString()}`, { replace: true })
      }
    }

    if (selectedProductBrand !== undefined) {
      if (selectedProductBrand) {
        params.set("productBrandId", selectedProductBrand)
        navigate(`${pathname}?${params.toString()}`)
      } else {
        params.delete("productBrandId")
        navigate(`${pathname}?${params.toString()}`, { replace: true })
      }
    }
  }, [
    selectedMaker,
    selectedModel,
    selectedGeneration,
    selectedProductBrand,
    selectedProductType,
    selectedCategory,
  ])
  return (
    <>
      {isBigScreen && (
        <section className="sticky top-[5px] max-h-[100vh] space-y-5 overflow-y-auto px-2 pt-5 pb-7 sm:block">
          <div className="flex justify-between">
            <h1 className="flex items-center text-2xl font-semibold">
              Filters{" "}
              <span>
                {" "}
                <Filter size={20} />
              </span>
            </h1>
            <Button size="sm" variant="default" onClick={handleReset}>
              Reset
            </Button>
          </div>
          <CarFilter
            className="space-y-5"
            maker={selectedMaker}
            model={selectedModel}
            generation={selectedGeneration}
            carMakers={carMakers}
            carModels={carModels || []}
            carGenerations={carGenerations || []}
            carBrand={carBrand}
            setSelectedModel={setSelectedModel}
            setSelectedGeneration={setSelectedGeneration}
            setSelectedMaker={setSelectedMaker}
            handleChange={handleChange}
          />

          <div className="space-y-2">
            <label>Categories</label>
            <ComboBox
              value={selectedCategory}
              setValue={(value) => {
                setSelectedCategory(value ? value : undefined)
                setSelectedProductType("")
              }}
              placeholder="Select Category..."
              options={categories}

              // setParam={handleChange}
            />
          </div>
          <div className="space-y-2">
            <label>Sub-Categories</label>
            <ComboBox
              disabled={
                !productTypes?.length || !productTypes.length || !category
              }
              placeholder="Sub-selectedCategory..."
              value={selectedProductType}
              setValue={(value) => {
                setSelectedProductType(value ? value : undefined)
                setSelectedProductBrand(undefined)
              }}
              options={productTypes || []}
            />
          </div>

          <div className="space-y-2">
            <label>Product brands</label>
            <ComboBox
              placeholder="Select Brand..."
              value={selectedProductBrand}
              setValue={(value) => {
                setSelectedProductBrand(value ? value : undefined)
              }}
              options={productBrands}
            />
          </div>

          <AvailableSwitch isAvailable={isAvailable} />
          <ProdcutFilterInput name={name || ""} />
        </section>
      )}

      {!isBigScreen && (
        <DrawerProvidor open={drawerOpen} setOpen={setDrawerOpen}>
          <div>
            <DrawerOverlay />

            <Button
              onClick={() => setDrawerOpen((is) => !is)}
              className={cn("fixed right-4 bottom-5 z-50", {
                "invisible opacity-0": inView && disappear,
                hidden: drawerOpen,
              })}
              size="icon"
              variant="outline"
            >
              {" "}
              <Filter size={18} />
            </Button>

            <DrawerContent
              asCard
              className="max-h-[60vh] w-[97%] overflow-y-auto border-none"
            >
              <h1 className="grid gap-1 p-4 text-center sm:text-left">
                <h2 className="text-xl font-semibold">
                  {" "}
                  Filters <Filter size={20} className="inline" />
                </h2>
                <p className="text-sm text-muted-foreground">
                  Apply some filters to make the searching process easier.
                </p>
              </h1>
              <section className="space-y-5 p-4">
                <ProdcutFilterInput name={name || ""} />

                <div className="xs:flex-row flex flex-col items-center gap-3">
                  <div className="w-full space-y-2">
                    <label>Car Brand</label>
                    <CarBrandsCombobox
                      options={carMakers}
                      value={selectedMaker || null}
                      setValue={(value) => {
                        setSelectedMaker(value ? value : undefined)
                        setSelectedModel(undefined)
                        setSelectedGeneration(undefined)
                        // handleChange(value, "makerId", makerId);
                      }}
                    />
                  </div>

                  <div className="w-full space-y-2">
                    <label>Car Model</label>
                    <ModelCombobox
                      disabled={!carModels || !carModels.length || !maker}
                      options={carModels || []}
                      value={selectedModel || null}
                      setValue={(value) => {
                        setSelectedModel(value ? value : undefined)
                        setSelectedGeneration(undefined)

                        // handleChange(value, "makerId", makerId);
                      }}
                    />
                  </div>
                </div>
                <div className="xs:flex-row flex flex-col items-center gap-3">
                  <div className="w-full space-y-2">
                    <label>Car Generation</label>
                    <ComboBox
                      placeholder="Select selectedGeneration..."
                      disabled={!carModels || !carModels.length || !model}
                      options={carGenerations || []}
                      setValue={(value) =>
                        handleChange(value, "generation", generation)
                      }
                      value={selectedGeneration}
                    />
                  </div>
                  <div className="w-full space-y-3">
                    <label>Categories</label>
                    <ComboBox
                      value={selectedCategory}
                      setValue={(value) => {
                        setSelectedGeneration(value ? value : undefined)
                      }}
                      options={categories}
                    />
                  </div>
                </div>

                <div className="xs:flex-row flex flex-col items-center gap-3">
                  <div className="w-full space-y-3">
                    <label>Product types</label>
                    <ComboBox
                      value={selectedProductType}
                      setValue={(value) => {
                        setSelectedProductType(value ? value : undefined)
                        setSelectedProductBrand(undefined)
                      }}
                      options={productTypes || []}
                    />
                  </div>
                  <div className="w-full space-y-2">
                    <label>Product brands</label>
                    <ComboBox
                      value={selectedProductBrand}
                      setValue={(value) => {
                        setSelectedProductBrand(value ? value : undefined)
                      }}
                      options={productBrands}
                    />
                  </div>
                </div>

                <div className="xs:text-left xs:justify-between xs:flex-row flex flex-col items-center justify-center gap-2 rounded-xl p-2 text-center">
                  <p className="text-sm text-muted-foreground">
                    Filter by available products.
                  </p>
                  <AvailableSwitch
                    isAvailable={isAvailable || "false"}
                    className="gap-2"
                  />
                </div>
              </section>
              <div className="p-4">
                <Button
                  onClick={() => setDrawerOpen(false)}
                  variant="outline"
                  className="block w-full"
                >
                  Close
                </Button>
              </div>
            </DrawerContent>
          </div>
        </DrawerProvidor>
      )}
    </>
  )
}

function AvailableSwitch({
  isAvailable,
  className,
}: {
  isAvailable?: string
  className?: string
}) {
  const available = isAvailable ? JSON.parse(isAvailable) : false

  const [check, setCheck] = useState(isAvailable !== "")

  const [searchParams] = useSearchParams()
  const pathname = useLocation().pathname
  const navigate = useNavigate()
  const params = new URLSearchParams(searchParams)

  const page = searchParams.get("page") || ""

  function handleSwitch() {
    if (check) {
      if (page) params.set("page", "1")
      params.set("isAvailable", String(!available))
      navigate(`${pathname}?${params.toString()}`, { replace: true })
    }
  }

  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="flex items-center space-x-2">
        <Switch
          checked={available}
          onClick={() => {
            if (!check) return

            handleSwitch()
          }}
          id="airplane-mode"
          disabled={!check}
        />
        <Label htmlFor="airplane-mode" aria-disabled={!check}>
          Available
        </Label>
      </div>
      <Checkbox
        checked={check}
        onClick={() => {
          if (check) {
            params.delete("isAvailable")
            if (page) params.set("page", "1")
          } else {
            params.set("isAvailable", String(available))
            if (page) params.set("page", "1")
          }
          setCheck((checked) => !checked)
          navigate(`${pathname}?${params.toString()}`, { replace: true })
        }}
      />
    </div>
  )
}
interface Props {
  className?: string
  maker: string | undefined
  model: string | undefined
  generation: string | undefined
  carBrand?: string
  carMakers: CarMaker[]
  carModels: CarModel[]
  carGenerations: CarGeneration[]
  setSelectedMaker: React.Dispatch<React.SetStateAction<string | undefined>>
  setSelectedModel: React.Dispatch<React.SetStateAction<string | undefined>>
  setSelectedGeneration: React.Dispatch<
    React.SetStateAction<string | undefined>
  >
  handleChange: (filter: string, name: string, initalValue?: string) => void
}

const CarFilter = ({
  className,
  maker,
  model,
  generation,
  carMakers,
  carModels,
  carGenerations,
  setSelectedMaker,
  setSelectedModel,
  setSelectedGeneration,
  handleChange,
}: Props) => {
  // const carModels =
  //   makerId && carMakers?.find((car) => car.id === makerId)?.carModels;
  // const carGenerations =
  //   modelId &&
  //   carModels &&
  //   carModels.find((selectedModel) => selectedModel.id === modelId)?.carGenerations;

  return (
    <section className={className}>
      <div className="space-y-2">
        <label>Car Brand</label>
        <CarBrandsCombobox
          options={carMakers}
          value={maker ? maker : null}
          setValue={(value) => {
            setSelectedMaker(value ? value : "")
            setSelectedModel("")
            setSelectedGeneration("")
            // handleChange(value, "makerId", makerId);
          }}
        />
      </div>

      <div className="space-y-2">
        <label>Car Model</label>
        <ModelCombobox
          disabled={!carModels || !carModels.length || !maker}
          options={carModels || []}
          value={model ? model : null}
          setValue={(value) => {
            setSelectedModel(value ? value : "")
            setSelectedGeneration("")
            // handleChange(value, "modelId", modelId);
          }}
        />
      </div>
      <div className="space-y-2">
        <label>Car Generation</label>
        <ComboBox
          placeholder="Select selectedGeneration..."
          disabled={!carModels || !carModels.length || !model}
          options={carGenerations || []}
          setValue={(value) => {
            setSelectedGeneration(value ? value : "")
            // handleChange(value, "generationId", generationId);
          }}
          value={generation}
        />
      </div>
    </section>
  )
}

export default ProductsFilterContent
