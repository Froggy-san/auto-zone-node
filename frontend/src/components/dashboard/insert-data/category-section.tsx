import { getAllCategoriesAction } from "@lib/actions/categoriesAction"
import React from "react"
import CategoryList from "./category-list"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
const CategorySection = () => {
  const { data, error } = await getAllCategoriesAction()
  if (error) return <p>{error}</p>
  return (
    <Accordion type="single" defaultValue="item-1" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>
          {" "}
          <h3 className="text-2xl font-semibold tracking-wider">CATEGORIES</h3>
        </AccordionTrigger>
        <AccordionContent className="mt-10 min-h-[450px]">
          {data && <CategoryList categories={data} />}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export default CategorySection
