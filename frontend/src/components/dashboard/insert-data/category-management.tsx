import React from "react"
import CategroyForm from "./category-form"

const CategoryManagement = () => {
  return (
    <div className="flex flex-col justify-between gap-x-7 gap-y-2 rounded-lg border p-3 shadow-sm xs:flex-row xs:items-center">
      <div className="space-y-0.5">
        <label htmlFor="z" className="font-semibold">
          Category
        </label>
        <p className="text-sm text-muted-foreground">Add product category.</p>
      </div>
      <div className="flex items-center gap-3 sm:pr-2">
        <CategroyForm showBtn />
      </div>
    </div>
  )
}

export default CategoryManagement
