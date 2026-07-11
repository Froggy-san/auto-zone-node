import React, { useMemo, useState } from "react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { CarMakersData, CarModelProps } from "@lib/types"
import { Button } from "@components/ui/button"
import { MoveLeft } from "lucide-react"
import ModelItem from "./model-item"
import GenerationItem from "./generation-item"
import CarModelForm from "@components/car-model-form"
import { AnimatePresence, motion } from "framer-motion"
import ModelsList from "./models-list"
import GenerationsList from "./generations-list"
interface Props {
  carMaker: CarMakersData | null

  setCarMakerId: React.Dispatch<React.SetStateAction<number | null>>
}
const CarMakerDia = ({ carMaker, setCarMakerId }: Props) => {
  const [model, setModel] = useState<CarModelProps | null>(null)
  const [modelToEdit, setModelToEdit] = useState<CarModelProps | undefined>(
    undefined
  )
  const [modelOpen, setModelOpen] = useState(false)
  // const chosenModel = carMaker?.carModels.find((model) => model.id === modelId);
  const generaitons = useMemo(() => {
    return carMaker?.carModels.flatMap((item) => item.carGenerations) || []
    // flatMap(carMaker.carModels.map((item) => item.carGenerations));
  }, [carMaker])

  return (
    <>
      <Dialog open={!!carMaker} onOpenChange={() => setCarMakerId(null)}>
        <DialogContent className="max-h-[65vh] max-w-[1000px] space-y-4 overflow-y-auto rounded-none sm:max-h-[76vh] sm:rounded-none sm:p-14 lg:rounded-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 rounded-lg bg-card p-2">
              <AnimatePresence mode="wait">
                {carMaker?.logo ? (
                  <motion.img
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.09 }}
                    key="image"
                    src={carMaker.logo}
                    alt={`${carMaker.name} logo`}
                    className="h-14 w-14 object-contain"
                  />
                ) : null}
              </AnimatePresence>
              <motion.span
                key="name"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.09 }}
              >
                {carMaker?.name}
              </motion.span>
            </DialogTitle>
            <DialogDescription>
              All car models and generations belonging to {carMaker?.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-9">
            <ModelsList
              carMaker={carMaker}
              setModel={setModel}
              setModelToEdit={setModelToEdit}
            />
            <GenerationsList generations={generaitons} carMaker={carMaker} />
            <div className="flex flex-col justify-between gap-x-7 gap-y-2 rounded-lg border p-3 shadow-sm xs:flex-row xs:items-center">
              <div className="space-y-0.5">
                <label className="font-semibold">Add car models</label>
                <p className="text-sm text-muted-foreground">
                  Add a new car model to {carMaker?.name}&apos;s list.
                </p>
              </div>
              <div className="sm:pr-2">
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => setModelOpen(true)}
                >
                  Create car model
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {carMaker && (
        <CarModelForm
          open={!!modelToEdit || modelOpen}
          setOpen={() => {
            setModelToEdit(undefined)
            setModelOpen(false)
          }}
          modelToEdit={modelToEdit}
          carMaker={carMaker}
        />
      )}
    </>
  )
}

export default CarMakerDia
