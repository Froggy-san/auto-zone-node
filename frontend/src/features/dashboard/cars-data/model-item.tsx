import React, { SetStateAction, useCallback, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  CarGenerationProps,
  CarMakerData,
  CarMakersData,
  CarModelProps,
} from "@lib/types"
import { useToast } from "@hooks/use-toast"
import Spinner from "@components/Spinner"
import { Cross2Icon } from "@radix-ui/react-icons"
import { EllipsisVertical, NotepadText, SquarePen, X } from "lucide-react"
import CarModelForm from "@components/car-model-form"
import { GiTumbleweed } from "react-icons/gi"
import { CgDetailsLess } from "react-icons/cg"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import GenerationItem from "./generation-item"
import { deleteCarModelAction } from "@lib/actions/carModelsActions"
import SuccessToastDescription, {
  ErorrToastDescription,
} from "@components/toast-items"
import { useQueryClient } from "@tanstack/react-query"
import { GenerationForm } from "@components/dashboard/cars-data/generation-form"
import useDeleteModel from "@lib/queries/car-models/useDeleteModel"
import { cn } from "@lib/utils"

const ModelItem = ({
  carMaker,
  item,
  setModelId,
  setModelToEdit,

  setSelectedModelId,
}: {
  setModelId: () => void
  carMaker: CarMakersData
  setModelToEdit: () => void
  item: CarModelProps
  setSelectedModelId: React.Dispatch<React.SetStateAction<number | null>>
}) => {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  return (
    <li
      onClick={() => setSelectedModelId(item.id)}
      className={cn(
        `relative flex h-fit w-[48%] cursor-pointer flex-col items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all duration-200 hover:bg-accent/30 sm:w-fit`,
        { "px-3 py-[0.4rem]": !item.image }
      )}
    >
      {item.image ? (
        <img
          src={item.image}
          alt={`${item.name} image`}
          className="block max-h-16 w-20 object-contain"
        />
      ) : null}

      <div className="flex w-full items-center justify-center gap-2">
        <p
          className={cn("pr-6 text-center", {
            "max-w-[90%] pr-0 break-all": item.image,
          })}
        >
          {item.name}
        </p>
        <div
          onClick={(e) => e.stopPropagation()}
          className={cn(
            `absolute top-1/2 right-1 flex -translate-y-1/2 items-center`,
            {
              "top-[unset] right-1 bottom-[0.4rem] -translate-y-[unset]":
                item.image,
            }
          )}
        >
          {loading ? (
            <Spinner className="ml-auto h-full" size={10} />
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-6 w-6 p-0">
                  <EllipsisVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={setModelToEdit} className="gap-2">
                  <SquarePen className="h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setDeleteOpen(true)}
                  className="gap-2 text-red-700 hover:!bg-destructive/20 hover:!text-red-700"
                >
                  <X className="h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      <DeleteBtn
        open={deleteOpen}
        setOpen={setDeleteOpen}
        isDeleting={loading}
        setIsDeleting={setLoading}
        item={item}
      />
      {/* <MoreDetails open={open} setOpen={setOpen} item={item} /> */}
      {/* <div onClick={(e) => e.stopPropagation()} className=" absolute">
        <CarModelForm
          open={editOpen}
          setOpen={setEditOpen}
          modelToEdit={item}
          carMaker={carMaker}
        />
      </div> */}
    </li>
  )
}

function MoreDetails({
  open,
  setOpen,
  item,
  disabled = false,
}: {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  item: CarModelProps
  disabled?: boolean
}) {
  // const [open, setOpen] = useState(false);
  const [genToEdit, setGenToEdit] = useState<CarGenerationProps | null>(null)
  const [addGenOpen, setAddGenOpen] = useState(false)
  const generations = useMemo(() => {
    return item.carGenerations.sort((a, b) => a.id - b.id)
  }, [item.carGenerations])
  return (
    <div onClick={(e) => e.stopPropagation()} className="absolute">
      <Dialog open={open} onOpenChange={setOpen}>
        {/* <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DialogTrigger asChild>
                <button className="  flex items-center justify-center rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground  ">
                  <CgDetailsLess className="h-4 w-4" />
                </button>
              </DialogTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>View Details</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider> */}

        <DialogContent className="max-h-[55vh] max-w-[500px] overflow-y-auto border-none">
          <DialogHeader>
            <DialogTitle className="pr-5 break-all">
              {item.name}&apos;s details.
            </DialogTitle>
            <DialogDescription className="hidden"></DialogDescription>
          </DialogHeader>
          {item.notes && (
            <div className="grid gap-2 overflow-hidden rounded-md bg-accent/50 p-2 text-center break-all sm:text-left">
              <h2 className="text-md flex items-center gap-1 font-semibold">
                {" "}
                <NotepadText className="h-5 w-5" /> Note.
              </h2>
              <p className="indent-5"> {item.notes}</p>
            </div>
          )}
          <Accordion type="single" defaultValue="item-1" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>Related Generations</AccordionTrigger>
              <AccordionContent>
                {generations.length ? (
                  <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {generations.map((gen) => (
                      <GenerationItem
                        key={gen.id}
                        item={gen}
                        model={item}
                        setGenToEdit={setGenToEdit}
                        setOpen={setOpen}
                        withForm={false}
                      />
                    ))}
                  </ul>
                ) : (
                  <div className="item-center flex justify-center gap-1">
                    {" "}
                    Empty <GiTumbleweed className="h-4 w-4" />{" "}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <DialogClose asChild>
            <Button
              onClick={() => setAddGenOpen(true)}
              size="sm"
              className="w-full"
            >
              Add a new generation
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
      <GenerationForm
        open={!!genToEdit || addGenOpen}
        setOpen={() => {
          setGenToEdit(null)
          setAddGenOpen(false)
        }}
        genToEdit={genToEdit || undefined}
        model={item}
        // open={!!genToEdit}

        setMainOpen={setOpen}
      />
    </div>
  )
}

function DeleteBtn({
  open,
  setOpen,
  item,
  isDeleting,
  setIsDeleting,
}: {
  open: boolean
  setOpen: React.Dispatch<SetStateAction<boolean>>

  isDeleting: boolean
  setIsDeleting: React.Dispatch<SetStateAction<boolean>>
  item: CarModelProps
}) {
  const { toast } = useToast()
  const { deleteModel } = useDeleteModel()

  const handleDelete = useCallback(async () => {
    try {
      setIsDeleting(true)
      await deleteModel(item)

      setOpen(false)

      toast({
        className: "bg-primary  text-primary-foreground",
        title: "Done.",
        description: (
          <SuccessToastDescription message="Car model has been deleted." />
        ),
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Something went wrong.",
        description: <ErorrToastDescription error={error.message} />,
      })
    } finally {
      setIsDeleting(false)
    }
  }, [])

  return (
    <div onClick={(e) => e.stopPropagation()} className="absolute">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-none sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete car generation</DialogTitle>
            <DialogDescription>
              This action can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button size="sm" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => handleDelete()}
            >
              {isDeleting ? <Spinner className="h-full" /> : "Confrim"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ModelItem
