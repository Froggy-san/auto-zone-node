import { AdditionalDetailsSchema, ProductsSchema } from "@/lib/types"
import React, { useEffect, useRef, useState } from "react"
import { Controller, useFieldArray, type Control } from "react-hook-form"
import { AnimatePresence, motion, useAnimate, usePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Cross2Icon } from "@/radix-ui/react-icons"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { z } from "zod"
import useEmblaCarousel from "embla-carousel-react"
import { cn } from "@/lib/utils"
import { ClickAwayListener } from "@mui/material"
import { ProFormSlideVariants, ProFormTransition } from "@/lib/constants"

interface StepTwoProps {
  control: Control<z.infer<typeof ProductsSchema>>
  moreDetails: z.infer<typeof AdditionalDetailsSchema>[]
  currStep: number[]
  setDeletedDetails: React.Dispatch<React.SetStateAction<number[]>>
}

function StepTwo({
  control,
  moreDetails,
  currStep,
  setDeletedDetails,
}: StepTwoProps) {
  const [selectedTab, setSelcetedTab] = useState<null | number>(null)
  const [emblaRef, emblaApi] = useEmblaCarousel({ dragFree: true })
  const [step, direction] = currStep
  const { fields, append, remove } = useFieldArray({
    name: "moreDetails",
    // shouldUnregister: true,
    control,
  })

  function handleRemoveItem(index: number) {
    const item = moreDetails[index]
    if (item._id !== undefined && typeof item._id === "string") {
      setDeletedDetails((prev) => [...prev, item._id as string])
    }
    remove(index)
    // index > 0
    if (index) {
      setSelcetedTab(index - 1)
    } else if (!index && moreDetails.length > 1) {
      setSelcetedTab(index)
    } else setSelcetedTab(null)
  }
  useEffect(() => {
    if (moreDetails.length) setSelcetedTab(0)
  }, [])

  return (
    <motion.div
      custom={direction}
      variants={ProFormSlideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={ProFormTransition}
      className=""
    >
      {/* <ul className=" space-y-20 ">

        {fields.map((item, i) => (
          <MoreDetailsItem
            key={item._id}
            index={i}
            control={control}
            removeSection={remove}
          />
        ))}

      </ul> */}
      <section className="embla">
        <div className="embla__viewport" ref={emblaRef}>
          <div className="embla__container">
            {fields.map((item, index) => (
              <div className="relative" key={item.id}>
                <div className="embla__slide mb-4">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (selectedTab === index) setSelcetedTab(null)
                      else setSelcetedTab(index)
                    }}
                    className={cn(
                      "relative rounded-[.5rem] bg-secondary px-2 py-1 text-xs font-bold whitespace-nowrap transition-colors duration-200 select-none hover:bg-muted-foreground/20 dark:bg-card dark:hover:bg-accent",
                      {
                        "bg-muted-foreground/20 dark:bg-accent":
                          selectedTab === index,
                      }
                    )}
                  >
                    {moreDetails[index].title || "Untitled"}
                    <AnimatePresence>
                      {selectedTab === index && (
                        <motion.span
                          layoutId="tab"
                          className="absolute right-0 -bottom-2 h-[3px] w-full rounded-full bg-primary"
                        />
                      )}
                    </AnimatePresence>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* <AnimatePresence mode="wait"> */}
      {selectedTab !== null ? (
        <MoreDetailsItem
          key={selectedTab}
          control={control}
          index={selectedTab}
          handleRemoveItem={handleRemoveItem}
          moreDetailsArr={moreDetails}
        />
      ) : null}
      {/* </AnimatePresence> */}

      <div className="flex flex-col items-center justify-center gap-3">
        <h3 className="text-lg font-semibold">
          Add additional details section.
        </h3>
        <Button
          variant="secondary"
          size="sm"
          type="button"
          onClick={() => {
            append({
              title: "",
              description: "",
              table: [],
            })

            // moreDetails array is a stale state here.
            setSelcetedTab(moreDetails.length)
          }}
        >
          <Plus />
        </Button>
      </div>
    </motion.div>
  )
}

function MoreDetailsItem({
  index,
  control,
  handleRemoveItem,
  moreDetailsArr,
}: {
  index: number
  control: Control<z.infer<typeof ProductsSchema>>
  handleRemoveItem: (index: number) => void
  moreDetailsArr: z.infer<typeof AddetionalDetailsSchema>[]
}) {
  const {
    fields,
    append,
    remove: removeRow,
  } = useFieldArray({
    name: `moreDetails.${index}.table`,
    control,
  })

  function handleAddItem() {
    append({
      title: "",
      description: "",
    })
  }

  return (
    <motion.div
      initial={{
        y: -3,
        opacity: 0,
        rotateX: -5,
      }}
      animate={{
        y: 0,
        opacity: 1,
        rotateX: 0,
      }}
      className="relative mt-10"
    >
      {/* <button
        onClick={() => handleRemoveItem(index)}
        className="  absolute  -top-5 right-5 rounded-sm outline-none    opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground  "
        type="button"
      >
        <Cross2Icon className="h-4 w-4" />
      </button> */}
      <section className="space-y-4">
        <RemoveBtn remove={() => handleRemoveItem(index)} />
        <Controller
          control={control}
          name={`moreDetails.${index}.title`}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Title</FieldLabel>
              <Input placeholder="name" {...field} />
              <FieldDescription>
                Enter the name of the product.
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        {/*
        <FormField
          control={control}
          name={`moreDetails.${index}.title`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="name" {...field} />
              </FormControl>
              <FormDescription>Enter the name of the product.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        */}

        <Controller
          control={control}
          name={`moreDetails.${index}.description`}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Description</FieldLabel>
              <Textarea cols={6} placeholder="Description" {...field} />
              <FieldDescription>
                Add more details about the added section.
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        {/*
        <FormField
          control={control}
          name={`moreDetails.${index}.description`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea cols={6} placeholder="Description" {...field} />
              </FormControl>
              <FormDescription>
                Add more details about the added section.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        */}
      </section>

      <h3 className="mt-14 text-sm font-semibold sm:text-lg lg:text-2xl">
        Information tabe:
      </h3>
      <section className="mt-4 mb-14 flex flex-col space-y-3 rounded-3xl border p-2">
        {fields.map((field, i) => (
          <Row
            key={field.id}
            control={control}
            moreDetailsIndex={index}
            index={i}
            removeRow={() => removeRow(i)}
            moreDetailsArr={moreDetailsArr}
          />
        ))}
        <div className="mt-2 flex flex-col items-center gap-2">
          <p className="text-sm font-semibold"> Add Row</p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleAddItem}
          >
            <Plus />
          </Button>
        </div>
      </section>
    </motion.div>
  )
}

interface RowProps {
  control: Control<z.infer<typeof ProductsSchema>>
  moreDetailsIndex: number
  index: number
  removeRow: () => void
  moreDetailsArr: z.infer<typeof AddetionalDetailsSchema>[]
}

function Row({
  control,
  moreDetailsIndex,
  index,
  removeRow,
  moreDetailsArr,
}: RowProps) {
  const [isEditting, setIsEditting] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)
  const descRef = useRef<HTMLInputElement>(null)
  const clickedField = useRef({ field: "" })

  useEffect(() => {
    if (isEditting && clickedField.current.field) {
      if (clickedField.current.field === "name") {
        nameRef.current?.focus()
      } else {
        descRef.current?.focus()
      }
    } else clickedField.current.field = ""
  }, [isEditting])

  return (
    <ClickAwayListener onClickAway={() => setIsEditting(false)}>
      <motion.div
        initial={{
          y: 5,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        className={cn(
          "flex w-full items-center justify-between gap-5 rounded-lg p-3",
          {
            "bg-muted-foreground/10 dark:bg-accent/20": index % 2 === 0,
          }
        )}
      >
        <div className="relative flex w-full items-center justify-between gap-5">
          <Controller
            control={control}
            name={`moreDetails.${moreDetailsIndex}.table.${index}.title`}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="marker: mb-auto max-w-52 min-w-36"
              >
                {isEditting ? (
                  <Input
                    ref={nameRef}
                    value={field.value}
                    onKeyDown={(e) => {
                      e.stopPropagation()
                      if (e.key === "Enter") setIsEditting(false)
                    }}
                    onChange={(e) => field.onChange(e.target.value)}
                    placeholder="Name"
                  />
                ) : (
                  <p
                    onClick={() => {
                      clickedField.current.field = "name"
                      setIsEditting(true)
                    }}
                    className="text-left hover:cursor-pointer"
                  >
                    {field.value || `Tag${index + 1}:`}
                  </p>
                )}
                {/* <FormDescription>Enter the name of the product.</FormDescription> */}
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          {/*           
          <FormField
            control={control}
            name={`moreDetails.${moreDetailsIndex}.table.${index}.title`}
            render={({ field }) => (
              <FormItem className=" max-w-52 min-w-36  marker:   mb-auto">
                <FormControl>
                  {isEditting ? (
                    <Input
                      ref={nameRef}
                      value={field.value}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === "Enter") setIsEditting(false);
                      }}
                      onChange={(e) => field.onChange(e.target.value)}
                      placeholder="Name"
                    />
                  ) : (
                    <p
                      onClick={() => {
                        clickedField.current.field = "name";
                        setIsEditting(true);
                      }}
                      className="text-left hover:cursor-pointer"
                    >
                      {field.value || `Tag${index + 1}:`}
                    </p>
                  )}
                </FormControl>
                <FormDescription>Enter the name of the product.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          /> */}

          <div className="mb-auto flex flex-1 items-center gap-2">
            <Controller
              control={control}
              name={`moreDetails.${moreDetailsIndex}.table.${index}.description`}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="flex-1">
                  {isEditting ? (
                    <Input
                      ref={descRef}
                      value={field.value}
                      onKeyDown={(e) => {
                        e.stopPropagation()
                        if (e.key === "Enter") setIsEditting(false)
                      }}
                      onChange={(e) => field.onChange(e.target.value)}
                      placeholder="Description"
                    />
                  ) : (
                    <p
                      className="text-right hover:cursor-pointer"
                      onClick={() => {
                        clickedField.current.field = "description"
                        setIsEditting(true)
                      }}
                    >
                      {field.value || `Description${index + 1}:`}
                    </p>
                  )}
                  {/* <FormDescription>Add more details about the added section.</FormDescription> */}
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* <FormField
              control={control}
              name={`moreDetails.${moreDetailsIndex}.table.${index}.description`}
              render={({ field }) => (
                <FormItem className=" flex-1 ">
                  <FormControl>
                    {isEditting ? (
                      <Input
                        ref={descRef}
                        value={field.value}
                        onKeyDown={(e) => {
                          e.stopPropagation();
                          if (e.key === "Enter") setIsEditting(false);
                        }}
                        onChange={(e) => field.onChange(e.target.value)}
                        placeholder="Description"
                      />
                    ) : (
                      <p
                        className="text-right hover:cursor-pointer"
                        onClick={() => {
                          clickedField.current.field = "description";
                          setIsEditting(true);
                        }}
                      >
                        {field.value || `Description${index + 1}:`}
                      </p>
                    )}
                  </FormControl>
                  <FormDescription>Add more details about the added section.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            */}
            <button
              onClick={removeRow}
              className={cn(
                "rounded-sm opacity-70 transition-opacity outline-none hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
              )}
              type="button"
            >
              <Cross2Icon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </ClickAwayListener>
  )
}

function RemoveBtn({
  remove,
  className,
}: {
  remove: () => void
  className?: string
}) {
  return (
    <button
      onClick={remove}
      className={cn(
        "absolute -top-5 right-5 rounded-sm opacity-70 transition-opacity outline-none hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
        className
      )}
      type="button"
    >
      <Cross2Icon className="h-4 w-4" />
    </button>
  )
}
// function SectionCarousel() {
//   return (
//     <section className="embla">
//       <div className="embla__viewport" ref={emblaRef}>
//         <div className="embla__container">
//           {categories.map((category, index) => (
//             <div className=" relative" key={index}>
//               <div className="embla__slide">
//                 <button
//                   onClick={() => handleCategoryClick(category)}
//                   className={cn(
//                     "select-none px-2 py-1  text-xs  whitespace-nowrap  font-bold rounded-[.5rem] bg-secondary hover:bg-muted-foreground/20   dark:bg-card dark:hover:bg-accent  transition-colors duration-200",
//                     {
//                       "bg-muted-foreground/20 dark:bg-accent":
//                         Number(currCategory) === category.id,
//                     }
//                   )}
//                 >
//                   {category.name}
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

export default StepTwo

// <motion.div
//   initial={{
//     y: 5,
//     opacity: 0,
//   }}
//   animate={{
//     y: 0,
//     opacity: 1,
//   }}
//   key={field.id}
//   className={cn(
//     "flex items-center gap-5 p-3 rounded-lg   justify-between w-full",
//     {
//       "bg-accent/20": i % 2,
//     }
//   )}
// >
//   <div className=" relative flex items-center justify-between w-full gap-5">
//     <motion.span
//       initial={{
//         left: -10,
//         top: -10,
//         opacity: 0,
//       }}
//       animate={{
//         top: "-1.5rem",
//         left: "-1.7rem",
//         opacity: 1,
//       }}
//       className=" absolute  font-semibold"
//     >
//       {i + 1}.
//     </motion.span>
//     <FormField
//       control={control}
//       name={`moreDetails.${index}.table.${i}.title`}
//       render={({ field }) => (
//         <FormItem className=" max-w-52 min-w-36    mb-auto">
//           <FormControl>
//             <Input placeholder="Name" {...field} />
//           </FormControl>
//           {/* <FormDescription>Enter the name of the product.</FormDescription> */}
//           <FormMessage />
//         </FormItem>
//       )}
//     />

//     <div className=" flex-1 flex items-center gap-2 ">
//       <FormField
//         control={control}
//         name={`moreDetails.${index}.table.${i}.description`}
//         render={({ field }) => (
//           <FormItem className=" flex-1 mb-auto">
//             <FormControl>
//               <Textarea placeholder="Description" {...field} />
//             </FormControl>
//             {/* <FormDescription>Add more details about the added section.</FormDescription> */}
//             <FormMessage />
//           </FormItem>
//         )}
//       />
//       <button
//         onClick={() => removeRow(i)}
//         className={cn(
//           "rounded-sm outline-none    opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground "
//         )}
//         type="button"
//       >
//         <Cross2Icon className="h-4 w-4" />
//       </button>
//     </div>
//   </div>
// </motion.div>
