import { ComboBox } from "@/components/combo-box"
import { Filter } from "lucide-react"
import React, { useState } from "react"
import { Button } from "@//components/ui/button"
import { useMediaQuery } from "@mui/material"
import { cn } from "@/lib/utils"
import { useIntersectionProvidor } from "@/components/products/intersection-providor"
import { ClientsComboBox } from "@/components/clients-combobox"
import { Input } from "@/components/ui/input"
import {
  DrawerProvidor,
  DrawerContent,
  DrawerOverlay,
} from "@/components/DrawerComponent"
import { PAGE_SIZE } from "@/lib/constants"
import { MakerCombobox } from "@/components/maker-combobox"
import { ModelCombobox } from "@/components/model-combobox"
import { useLocation, useNavigate, useSearchParams } from "react-router"
import type { CarMaker, CarModel, User } from "@/types"
interface CarsListProps {
  color: string
  plateNumber: string
  chassisNumber: string
  motorNumber: string
  user: string
  carMaker: string
  carModel: string
  carGeneration: string
  page: string
  // clients: User[]
  // carMakers: CarMaker[]
  // We want the filter to disapear in the case of the page count i more than 3 pages and the pageSize i more than 2 cars in a single page.
  count: number
}

const GarageFilter: React.FC<CarsListProps> = ({
  carMaker,
  carModel,
  // carMakers,
  color,
  plateNumber,
  chassisNumber,
  motorNumber,
  user,
  carGeneration,
  // clients,
  count,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [plateNumberValue, setPlateNumberValue] = useState(plateNumber)
  const [motorValue, setMotorValue] = useState(motorNumber)
  const [chassieValue, setChassieValue] = useState(chassisNumber)
  const [chosenClient, setChosenClient] = useState<string | null>(user)
  const [chosenMaker, setchosenMaker] = useState<string | null>(carMaker)
  const [chosenModel, setchosenModel] = useState<string | null>(carModel)
  const [chosenCarGeneration, setCarGeneration] = useState<string | null>(
    carGeneration
  )
  const [models, setModels] = useState<CarModel[]>([])

  const { inView } = useIntersectionProvidor()
  const pathname = useLocation().pathname
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const isBigScreen = useMediaQuery("(min-width:640px)")

  // Don't make the filter button disppear on the smaller devices when the page count is less than 3 and the page size is less than 2.
  const disapear = count > 2 && Math.ceil(count / PAGE_SIZE) > 3

  // const models = chosenMaker
  //   ? carModels.filter((item) => item.carMaker === chosenMaker)
  //   : carModels;

  // const models =
  //   carMakers.find((maker) => maker._id === chosenMaker)?.carModels || []
  const generations =
    models.find((model) => model._id === chosenModel)?.generations || []
  // const generations = chosenModel
  //   ? carGeneration.filter((item) => item.carModel === chosenModel)
  //   : carGeneration;

  async function handleSubmit() {
    const params = new URLSearchParams(searchParams)

    if (plateNumberValue.trim() === "") {
      params.delete("plateNumber")
    } else {
      params.set("plateNumber", plateNumberValue)
    }

    if (motorValue.trim() === "") {
      params.delete("motorNumber")
    } else {
      params.set("motorNumber", motorValue)
    }

    if (chassieValue.trim() === "") {
      params.delete("chassisNumber")
    } else {
      params.set("chassisNumber", chassieValue)
    }

    if (!chosenCarGeneration) {
      params.delete("carGeneration")
    } else {
      params.set("carGeneration", String(chosenCarGeneration))
    }

    if (!chosenMaker) {
      params.delete("carMaker")
    } else {
      params.set("carMaker", String(chosenMaker))
    }

    if (!chosenModel) {
      params.delete("carModel")
    } else {
      params.set("carModel", String(chosenModel))
    }

    if (!chosenClient) {
      params.delete("user")
    } else {
      params.set("user", String(chosenClient))
    }
    params.set("page", "1")

    navigate(`${pathname}?${params.toString()}`)
    window.scrollTo(0, 0)
    if (!isBigScreen) setDrawerOpen(false)
  }

  return (
    <>
      {isBigScreen && (
        <form
          action={handleSubmit}
          //   onSubmit={handleSubmit}
          className="garage-scroll-bar sticky top-[10px] max-h-[100vh] space-y-4 overflow-y-auto pt-3 pb-6 sm:block sm:px-2"
        >
          <h1 className="flex items-center text-2xl font-semibold">
            Filters{" "}
            <span>
              {" "}
              <Filter size={20} />
            </span>
          </h1>
          <div className="space-y-2">
            <label className="text-sm">Clients</label>
            <ClientsComboBox value={chosenClient} setValue={setChosenClient} />
          </div>
          <div className="space-y-2">
            <label className="text-sm">Car maker</label>
            <MakerCombobox
              value={chosenMaker}
              setModels={setModels}
              setValue={(value) => {
                setchosenMaker(value)
                setchosenModel("")
                setCarGeneration("")
              }}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm">Car model</label>
            <ModelCombobox
              disabled={!chosenMaker}
              value={chosenModel}
              options={models}
              setValue={(value) => {
                setchosenModel(value)
                setCarGeneration("")
              }}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm">Car generation</label>
            <ComboBox
              placeholder="Select generation..."
              disabled={!chosenModel}
              value={chosenCarGeneration || undefined}
              options={generations}
              setValue={setCarGeneration}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm">Plate number</label>
            <Input
              value={plateNumberValue}
              onChange={(e) => setPlateNumberValue(e.target.value)}
              placeholder="Plate number..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm">Chassie number</label>
            <Input
              value={chassieValue}
              onChange={(e) => setChassieValue(e.target.value)}
              placeholder="Chassie number"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm">Motor number</label>
            <Input
              value={motorValue}
              onChange={(e) => setMotorValue(e.target.value)}
              placeholder="Motor number"
            />
          </div>

          {/* <ProdcutFilterInput name={name || ""} /> */}
          <Button size="sm" className="w-full">
            Search...
          </Button>
        </form>
      )}

      {!isBigScreen && (
        <DrawerProvidor open={drawerOpen} setOpen={setDrawerOpen}>
          <div>
            <DrawerOverlay />

            <Button
              onClick={() => setDrawerOpen((is) => !is)}
              className={cn("fixed right-4 bottom-5 z-50", {
                "invisible opacity-0": inView && disapear,
              })}
              size="icon"
              variant="outline"
            >
              {" "}
              <Filter size={18} />
            </Button>

            <DrawerContent
              asCard
              className="max-h-[60vh] overflow-y-auto rounded-t-xl border-none"
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
                <form
                  action={handleSubmit}
                  //   onSubmit={handleSubmit}
                  className="sticky top-[50px] space-y-5 sm:block"
                >
                  <div className="space-y-2">
                    <label>Clients</label>
                    <ClientsComboBox
                      value={chosenClient}
                      setValue={setChosenClient}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm">Car maker</label>
                    <MakerCombobox
                      value={chosenMaker}
                      setModels={setModels}
                      setValue={setchosenMaker}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm">Car model</label>
                    <ModelCombobox
                      value={chosenModel}
                      options={models}
                      setValue={setchosenModel}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm">Car generation</label>
                    <ComboBox
                      value={chosenCarGeneration || undefined}
                      options={generations}
                      setValue={setCarGeneration}
                    />
                  </div>

                  <div className="space-y-2">
                    <label>Plate number</label>
                    <Input
                      value={plateNumberValue}
                      onChange={(e) => setPlateNumberValue(e.target.value)}
                      placeholder="Plate number..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label>Chassie number</label>
                    <Input
                      value={chassieValue}
                      onChange={(e) => setChassieValue(e.target.value)}
                      placeholder="Chassie number"
                    />
                  </div>

                  <div className="space-y-2">
                    <label>Motor number</label>
                    <Input
                      value={motorValue}
                      onChange={(e) => setMotorValue(e.target.value)}
                      placeholder="Motor number"
                    />
                  </div>

                  {/* <ProdcutFilterInput name={name || ""} /> */}
                  <div className="space-y-3">
                    <Button size="sm" className="w-full">
                      Search...
                    </Button>
                    <Button
                      onClick={() => setDrawerOpen(false)}
                      variant="outline"
                      className="block w-full"
                      type="button"
                    >
                      Close
                    </Button>
                  </div>
                </form>
              </section>
            </DrawerContent>
          </div>
        </DrawerProvidor>
      )}
    </>
  )
}

export default GarageFilter
