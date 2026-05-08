import React from "react"
import { z } from "zod"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import type { AdditionalDetailsSchema } from "@/lib/types"
interface Props {
  additionalDetails: z.infer<typeof AdditionalDetailsSchema>[]
  className?: string
}
const MoreDetialsAccordion = ({ additionalDetails, className }: Props) => {
  return (
    <div className={cn("mx-auto max-w-[1200px]", className)}>
      <h2 className="mt-20 mb-4 text-center text-lg font-semibold sm:text-xl">
        PRODUCT DETAILS
      </h2>
      <Accordion type="single" collapsible className="w-full rounded-3xl p-5">
        {additionalDetails.map((detail, i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger className="text-md my-3 rounded-full bg-muted-foreground/10 p-2 font-semibold dark:bg-accent/20">
              {detail.title || "Untitled"}
            </AccordionTrigger>
            <AccordionContent className="space-y-14 px-2 pt-2 pb-10">
              {detail.description && (
                <p className="text-center text-sm sm:text-lg">
                  {detail.description}
                </p>
              )}

              {detail.table.length ? (
                <section className="mt-4 mb-14 flex flex-col space-y-3 rounded-3xl border p-2">
                  {detail.table.map((row, i) => (
                    <Row row={row} key={i} index={i} />
                  ))}
                </section>
              ) : null}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}

export default MoreDetialsAccordion

function Row({
  row,
  index,
}: {
  row: { title: string; description: string }
  index: number
}) {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-between gap-5 rounded-lg p-3",
        {
          "bg-muted-foreground/10 dark:bg-accent/20": index % 2 === 0,
        }
      )}
    >
      <p>{row.title || `Tag${index}`}</p>

      <p className="text-right">{row.description || `Description:${index}`}</p>
    </div>
  )
}
