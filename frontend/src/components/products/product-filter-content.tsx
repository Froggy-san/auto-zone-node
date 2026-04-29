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
  carMaker?: string
  carModel?: string
  generations?: string
  carMakers: CarMaker[]
  carBrand?: string
}
const ProductsFilterContent: React.FC<ProdcutFilterContentProps> = ({
  categories,
  productBrands,
  name,
  isAvailable,
  productType,
  count,
  carMakers,
  category,
  productBrand,
  carMaker,
  carModel,
  generations,
  carBrand,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { inView } = useIntersectionProvidor()
  const navigate = useNavigate()
  const pathname = useLocation().pathname
  const [searchParams] = useSearchParams()
  const handleReset = useCallback(() => {
    const params = new URLSearchParams(searchParams)
    params.delete("carMaker")
    params.delete("carModel")
    params.delete("generations")
    params.delete("category")
    params.delete("productType")
    params.delete("productBrand")

    navigate(`${pathname}?${params.toString()}`, { replace: true })
  }, [searchParams, pathname])

  const isBigScreen = useMediaQuery("(min-width:640px)")

  const disappear = count > 2 && Math.ceil(count / PAGE_SIZE) > 3

  const productTypes =
    category && categories.find((cat) => cat._id === category)?.productTypes

  const carModels =
    carMaker && carMakers?.find((car) => car._id === carMaker)?.carModels

  const carGenerations =
    carModel &&
    carModels &&
    carModels.find((model) => model._id === carModel)?.generations

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)

    // 1. Always reset to page 1 on filter change
    params.set("page", "1")

    // 2. Handle Hierarchical Resets
    if (key === "carMaker") {
      params.delete("carModel")
      params.delete("generations")
    }
    if (key === "carModel") {
      params.delete("generations")
    }
    if (key === "category") {
      params.delete("productType")
    }

    // 3. Update or Delete the specific filter
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    // 4. Navigate once
    navigate(`${pathname}?${params.toString()}`, { replace: true })

    // 5. Scroll to top (as we discussed before)
    window.scrollTo(0, 0)
  }

  // useEffect(() => {
  //   if (isFirstMount) return

  //   // 1. Reset page to 1 whenever filters change
  //   params.set("page", "1")

  //   // 2. Define a helper to update params without navigating yet
  //   const updateParam = (key: string, value: string | undefined) => {
  //     if (value) {
  //       params.set(key, value)
  //     } else {
  //       params.delete(key)
  //     }
  //   }

  //   // 3. Process all filters
  //   updateParam("carMaker", selectedMaker)
  //   updateParam("carModel", selectedModel)
  //   updateParam("generations", selectedGeneration)
  //   updateParam("category", selectedCategory)
  //   updateParam("productType", selectedProductType)
  //   updateParam("productBrand", selectedProductBrand)

  //   // 4. Navigate ONCE with the final query string
  //   navigate(`${pathname}?${params.toString()}`, {
  //     replace: true,
  //   })
  // }, [
  //   selectedMaker,
  //   selectedModel,
  //   selectedGeneration,
  //   selectedProductBrand,
  //   selectedProductType,
  //   selectedCategory,
  // ])
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
            carMaker={carMaker}
            carModel={carModel}
            generations={generations}
            carMakers={carMakers}
            carBrand={carBrand}
            carModels={carModels || []}
            carGenerations={carGenerations || []}
            // setSelectedModel={setSelectedModel}
            // setSelectedGeneration={setSelectedGeneration}
            // setSelectedMaker={setSelectedMaker}
            handleFilterChange={handleFilterChange}
          />

          <div className="flex flex-col gap-2.5">
            <label>Categories</label>
            <ComboBox
              value={category}
              setValue={(value) => {
                handleFilterChange("category", value === category ? "" : value)
              }}
              placeholder="Select Category..."
              options={categories}

              // setParam={handleFilterChange}
            />
          </div>
          <div className="flex flex-col gap-2.5">
            <label>Sub-Categories</label>
            <ComboBox
              disabled={
                !productTypes?.length || !productTypes.length || !category
              }
              placeholder="Sub-Category..."
              value={productType}
              setValue={(value) => {
                handleFilterChange(
                  "productType",
                  value === productType ? "" : value
                )
              }}
              options={productTypes || []}
            />
          </div>

          <div className="flex flex-col gap-2.5">
            <label>Product brands</label>
            <ComboBox
              placeholder="Select Brand..."
              value={productBrand}
              setValue={(value) => {
                handleFilterChange(
                  "productBrand",
                  value === productBrand ? "" : value
                )
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

                <div className="flex flex-col items-center gap-3 xs:flex-row">
                  <div className="flex w-full flex-col gap-2.5">
                    <label>Car Brand</label>
                    <CarBrandsCombobox
                      options={carMakers}
                      value={carMaker || null}
                      setValue={(value) => {
                        handleFilterChange(
                          "carMaker",
                          value === carMaker ? "" : value
                        )
                        // handleFilterChange(value, "carMaker", carMaker);
                      }}
                    />
                  </div>

                  <div className="flex w-full flex-col gap-2.5">
                    <label>Car Model</label>
                    <ModelCombobox
                      disabled={!carModels || !carModels.length || !carMaker}
                      options={carModels || []}
                      value={carModel || null}
                      setValue={(value) => {
                        handleFilterChange(
                          "carModel",
                          value === carModel ? "" : value
                        )

                        // handleFilterChange(value, "carMaker", carMaker);
                      }}
                    />
                  </div>
                </div>
                <div className="flex flex-col items-center gap-3 xs:flex-row">
                  <div className="flex w-full flex-col gap-2.5">
                    <label>Car Generation</label>
                    <ComboBox
                      placeholder="Select Generation..."
                      disabled={!carModels || !carModels.length || !carModel}
                      options={carGenerations || []}
                      value={generations}
                      setValue={
                        (value) =>
                          handleFilterChange(
                            "generations",
                            value === generations ? "" : value
                          )
                        // handleFilterChange(value, "generations", generations)
                      }
                    />
                  </div>
                  <div className="w-full space-y-3">
                    <label>Categories</label>
                    <ComboBox
                      value={category}
                      setValue={(value) => {
                        handleFilterChange(
                          "category",
                          value === category ? "" : value
                        )
                      }}
                      options={categories}
                    />
                  </div>
                </div>

                <div className="flex flex-col items-center gap-3 xs:flex-row">
                  <div className="w-full space-y-3">
                    <label>Product types</label>
                    <ComboBox
                      value={productType}
                      setValue={(value) => {
                        handleFilterChange(
                          "productType",
                          value === productType ? "" : value
                        )
                      }}
                      options={productTypes || []}
                    />
                  </div>
                  <div className="flex w-full flex-col gap-2.5">
                    <label>Product brands</label>
                    <ComboBox
                      value={productBrand}
                      setValue={(value) => {
                        handleFilterChange(
                          "productBrand",
                          value === productBrand ? "" : value
                        )
                        // setSelectedProductBrand(value ? value : undefined)
                      }}
                      options={productBrands}
                    />
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center gap-2 rounded-xl p-2 text-center xs:flex-row xs:justify-between xs:text-left">
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
    <div
      className={cn(
        "flex items-center justify-between overflow-hidden",
        className
      )}
    >
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
  carMaker: string | undefined
  carModel: string | undefined
  generations: string | undefined
  carBrand?: string
  carMakers: CarMaker[]
  carModels: CarModel[]
  carGenerations: CarGeneration[]
  // setSelectedMaker: React.Dispatch<React.SetStateAction<string | undefined>>
  // setSelectedModel: React.Dispatch<React.SetStateAction<string | undefined>>
  // setSelectedGeneration: React.Dispatch<
  //   React.SetStateAction<string | undefined>
  // >
  handleFilterChange: (key: string, value: string) => void
}

const CarFilter = ({
  className,
  carMaker,
  carModel,
  generations,
  carMakers,
  carModels,
  carGenerations,
  // setSelectedMaker,
  // setSelectedModel,
  // setSelectedGeneration,
  handleFilterChange,
}: Props) => {
  // const carModels =
  //   carMaker && carMakers?.find((car) => car.id === carMaker)?.carModels;
  // const carGenerations =
  //   carModel &&
  //   carModels &&
  //   carModels.find((selectedModel) => selectedModel.id === carModel)?.carGenerations;

  return (
    <section className={className}>
      <div className="flex flex-col gap-2.5">
        <label>Car Brand</label>
        <CarBrandsCombobox
          options={carMakers}
          value={carMaker ? carMaker : null}
          setValue={(value) => {
            handleFilterChange("carMaker", value === carMaker ? "" : value)
            // setSelectedMaker(value ? value : "")
            // setSelectedModel("")
            // setSelectedGeneration("")
            // handleFilterChange(value, "carMaker", carMaker);
          }}
        />
      </div>

      <div className="flex flex-col gap-2.5">
        <label>Car Model</label>
        <ModelCombobox
          disabled={!carModels || !carModels.length || !carMaker}
          options={carModels || []}
          value={carModel ? carModel : null}
          setValue={(value) => {
            handleFilterChange("carModel", value === carModel ? "" : value)
            // setSelectedModel(value ? value : "")
            // setSelectedGeneration("")
            // handleFilterChange(value, "carModel", carModel);
          }}
        />
      </div>
      <div className="flex flex-col gap-2.5">
        <label>Car Generation</label>
        <ComboBox
          placeholder="Select Generation..."
          disabled={!carModels || !carModels.length || !carModel}
          options={carGenerations || []}
          value={generations}
          setValue={(value) => {
            handleFilterChange(
              "generations",
              value === generations ? "" : value
            )
            // setSelectedGeneration(value ? value : "")
            // handleFilterChange(value, "generations", generations);
          }}
        />
      </div>
    </section>
  )
}

export default ProductsFilterContent
