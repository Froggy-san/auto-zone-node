import { AddetionalDetailsSchema } from "@lib/types";
import React from "react";
import { z } from "zod";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@lib/utils";
interface Props {
  additionalDetails: z.infer<typeof AddetionalDetailsSchema>[];
  className?: string;
}
const MoreDetialsAccordion = ({ additionalDetails, className }: Props) => {
  return (
    <div className={cn(" max-w-[1200px] mx-auto", className)}>
      <h2 className=" text-center mt-20   mb-4  text-lg sm:text-xl font-semibold">
        PRODUCT DETAILS
      </h2>
      <Accordion
        type="single"
        collapsible
        className="w-full   rounded-3xl  p-5  "
      >
        {additionalDetails.map((detail, i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger className=" text-md p-2 rounded-full font-semibold  my-3 bg-muted-foreground/10 dark:bg-accent/20">
              {detail.title || "Untitled"}
            </AccordionTrigger>
            <AccordionContent className=" px-2 pb-10 pt-2   space-y-14">
              {detail.description && (
                <p className=" text-center text-sm   sm:text-lg">
                  {detail.description}
                </p>
              )}

              {detail.table.length ? (
                <section className=" flex flex-col  mt-4  mb-14     rounded-3xl border p-2   space-y-3 ">
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
  );
};

export default MoreDetialsAccordion;

function Row({
  row,
  index,
}: {
  row: { title: string; description: string };
  index: number;
}) {
  return (
    <div
      className={cn(
        " flex items-center justify-between w-full p-3 rounded-lg   gap-5",
        {
          "bg-muted-foreground/10 dark:bg-accent/20": index % 2 === 0,
        }
      )}
    >
      <p>{row.title || `Tag${index}`}</p>

      <p className="text-right">{row.description || `Description:${index}`}</p>
    </div>
  );
}
