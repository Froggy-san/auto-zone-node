import React, { useCallback, useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

import { AnimatePresence, motion } from "framer-motion"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import type { CarMaker } from "@/types/carMaker"
import { useNavigate } from "react-router"
import type { CarGeneration, CarModel } from "@/types"
import { BASE_URL } from "@/lib/constants"

const CarBrands = ({ carBrands }: { carBrands: CarMaker[] }) => {
  const [selectedBrand, setSelectedBrand] = useState<CarMaker | null>(null)
  return (
    <div className="mx-auto my-20 max-w-[1200px] space-y-12">
      <h2 className="ml-2 text-lg font-semibold sm:text-2xl md:ml-6 lg:text-3xl">
        Select the right parts for your car
      </h2>
      {carBrands.length ? (
        <ul className="mx-auto grid max-w-[1200px] grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-9">
          {carBrands.map((brand) => (
            <CarBrand
              key={brand._id}
              carBrand={brand}
              handleChose={() => setSelectedBrand(brand)}
            />
          ))}
        </ul>
      ) : (
        <p className="text-xl text-muted-foreground">No brand</p>
      )}
      <DetailsDialog
        open={!!selectedBrand}
        setOpen={setSelectedBrand}
        carBrand={selectedBrand}
      />
    </div>
  )
}

function CarBrand({
  carBrand,
  handleChose,
}: {
  carBrand: CarMaker
  handleChose: () => void
}) {
  return (
    <li
      onClick={handleChose}
      className="group flex flex-col items-center justify-center gap-4 rounded-lg px-3 py-2"
    >
      {carBrand.logo ? (
        <img
          loading="lazy"
          src={`${BASE_URL}${carBrand.logo}`}
          alt={carBrand.name}
          className="h-20 object-contain transition-all duration-200 ease-out group-hover:scale-110"
        />
      ) : null}
      <p className="text-sm font-semibold text-muted-foreground">
        {carBrand.name}
      </p>
    </li>
  )
}

interface Dia {
  open: boolean
  carBrand: CarMaker | null
  setOpen: React.Dispatch<React.SetStateAction<CarMaker | null>>
  className?: string
}

function DetailsDialog({ open, setOpen, carBrand, className }: Dia) {
  const [modelId, setModelId] = useState<string | null>(null)
  const [generationId, setGenerationId] = useState<string | null>(null)
  const navigate = useNavigate()
  const model = carBrand?.carModels?.find((model) => model._id === modelId)
  const generaiton = model?.generations?.find((gen) => gen._id === generationId)

  const models = carBrand?.carModels
  const generations = model?.generations

  function handleSelect() {
    if (!modelId || !generationId || !carBrand) return

    const route = `/products?page=1&carMaker=${carBrand._id}&carBrand=${carBrand.name}&carModel=${modelId}&generations=${generationId}`
    setOpen(null)
    navigate(route)
  }

  const handleReset = useCallback(() => {
    setModelId(null)
    setGenerationId(null)
  }, [open])

  useEffect(() => {
    handleSelect()
  }, [modelId, generationId, handleSelect])
  useEffect(() => {
    handleReset()
  }, [open])

  return (
    <Dialog open={open} onOpenChange={() => setOpen(null)}>
      <DialogContent className="max-w-[800px] overflow-hidden p-0">
        <div className="relative flex max-h-[80vh] flex-col space-y-2 pb-2 sm:pb-6">
          {/* <div className=" py-5" /> */}
          <motion.div
            key={modelId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <DialogHeader className="w-full border-b bg-background px-2 pt-2 pb-1 sm:px-6 sm:pt-4">
              <DialogTitle className="flex items-center gap-5">
                <Button
                  disabled={!modelId}
                  className="h-6 w-6 shrink-0 p-0"
                  onClick={handleReset}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex flex-1 flex-col items-center gap-x-4 gap-y-1 pr-6 sm:flex-row">
                  <h2 className="text-sm leading-none font-semibold tracking-tight sm:text-lg">
                    {" "}
                    Select your car.
                  </h2>
                  <Breadcrumb>
                    <BreadcrumbList className="!text-xs sm:!text-sm">
                      <BreadcrumbItem>
                        <BreadcrumbLink
                          onClick={handleReset}
                          className="flex items-center gap-1"
                        >
                          {carBrand?.logo ? (
                            <img
                              src={`${BASE_URL}${carBrand.logo}`}
                              className="h-6 object-contain"
                            />
                          ) : null}
                          {carBrand?.name}
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem
                        onClick={() => setModelId(null)}
                        className={`${
                          !modelId ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        <BreadcrumbLink>
                          {model ? model.name : "Chose a model"}
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage
                          className={`${
                            modelId
                              ? "!text-foreground"
                              : "pointer-events-none !text-muted-foreground"
                          }`}
                        >
                          {generaiton ? generaiton.name : "Chose generation"}
                        </BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
              </DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>
          </motion.div>
          <div className="flex-1 overflow-x-hidden overflow-y-auto px-2 sm:px-6">
            <AnimatePresence mode="wait">
              {!modelId ? (
                <ModelList
                  carBrand={{
                    name: carBrand?.name || "",
                    image: carBrand?.logo || null,
                  }}
                  models={models}
                  modelId={modelId}
                  setModelId={setModelId}
                />
              ) : (
                <GenerationList
                  generations={generations}
                  setGenerationId={setGenerationId}
                  handleSelect={handleSelect}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ModelList({
  carBrand,
  models,
  modelId,
  setModelId,
}: {
  carBrand: { name: string; image: string | null }
  models: CarModel[] | undefined
  modelId: string | null
  setModelId: React.Dispatch<React.SetStateAction<string | null>>
}) {
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <motion.div
      key="model-lost"
      layout
      initial={{
        opacity: 0,
        x: -30,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ ease: "circOut" }}
    >
      <AnimatePresence mode="wait">
        {models && models.length ? (
          <motion.ul
            layout
            key="model-list"
            onMouseLeave={() => setHovered(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-wrap justify-center gap-2"
          >
            {models.map((model, i) => (
              <motion.li
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onMouseEnter={() => setHovered(i)}
                transition={{
                  type: "spring",
                  damping: 10,
                  stiffness: 100,
                  // duration: 0.01,
                  delay: i * 0.01,
                }}
                key={model._id}
                onClick={() => {
                  if (modelId === model._id) setModelId(null)
                  else setModelId(model._id)
                }}
                className={
                  "relative flex h-fit w-[48%] cursor-pointer flex-col items-center gap-2 rounded-lg border border-border/45 px-3 py-2 text-sm sm:w-fit"
                }
              >
                {model.image ? (
                  <img
                    src={`${BASE_URL}${model.image}`}
                    alt={model.name}
                    className="w-20 object-contain"
                  />
                ) : null}
                <p className="text-center font-semibold">{model.name}</p>
                {hovered === i && (
                  <motion.div
                    transition={{ duration: 0.2 }}
                    layoutId="item-card"
                    className="absolute top-0 left-0 z-[-1] h-full w-full rounded-lg bg-border/70 dark:bg-card"
                  />
                )}
              </motion.li>

              // <Model
              //   key={model.id}
              //   model={model}
              //   onClick={() => {
              //     if (modelId === model.id) setModelId(0);
              //     else setModelId(model.id);
              //   }}
              // />
            ))}
          </motion.ul>
        ) : (
          <div className="my-5 flex flex-col-reverse items-center gap-2">
            <AnimatePresence>
              {carBrand.image ? (
                <motion.img
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  src={`${BASE_URL}${carBrand.image}`}
                  alt={carBrand.name}
                  className="h-12 object-contain"
                />
              ) : null}
            </AnimatePresence>
            <p
              key="no-models"
              className="text-center font-semibold text-muted-foreground"
            >
              No {carBrand.name} models were found.
            </p>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function GenerationList({
  generations,
  handleSelect,
  setGenerationId,
}: {
  generations: CarGeneration[] | undefined
  setGenerationId: React.Dispatch<React.SetStateAction<string | null>>
  handleSelect: () => void
}) {
  const [hovered, setHovered] = useState<number | null>(null)
  return (
    <motion.div
      key="generations-list"
      layout
      initial={{
        opacity: 0,
        x: 30,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      exit={{ opacity: 0, x: 30 }}
      transition={{ ease: "circOut" }}
    >
      <AnimatePresence mode="wait">
        {generations?.length ? (
          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseLeave={() => setHovered(null)}
            key="generations-list"
            className="grid grid-cols-2 gap-2 sm:grid-cols-3"
          >
            {generations.map((gen, i) => (
              <motion.li
                key={gen._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onMouseEnter={() => setHovered(i)}
                transition={{
                  type: "spring",
                  damping: 10,
                  stiffness: 100,
                  // duration: 0.01,
                  delay: i * 0.03,
                }}
                onClick={() => {
                  setGenerationId(gen._id)
                  // handleSelect();
                }}
                className={cn(
                  `f relative flex h-fit cursor-pointer flex-col items-center justify-between gap-2 rounded-lg border border-border/45 px-3 py-2 text-sm`,
                  { "px-3 py-[0.4rem]": !gen.image }
                )}
              >
                {gen.image ? (
                  <img
                    src={`${BASE_URL}${gen.image}`}
                    className="w-20 object-contain"
                  />
                ) : null}

                <p className="text-center font-semibold text-muted-foreground">
                  {gen.name}
                </p>
                {hovered === i && (
                  <motion.div
                    transition={{ duration: 0.2 }}
                    layoutId="item-card"
                    className="absolute top-0 left-0 z-[-1] h-full w-full rounded-lg bg-border/70 dark:bg-card"
                  />
                )}
              </motion.li>
            ))}
          </motion.ul>
        ) : (
          <AnimatePresence>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              key="no-generations"
              className="py-5 text-center"
            >
              No generations
            </motion.p>
          </AnimatePresence>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default CarBrands
