import React, { useState } from "react"

import CategoryDetails from "./category-details"
import type { Category as CategoryType } from "@/types"
import Category from "./category"

const CategoryList = ({ categories }: { categories: CategoryType[] }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()

  const showDetailsOfCat = categories.find(
    (cat) => cat._id === selectedCategory
  )
  return (
    <div className="mx-auto my-20 max-w-[1200px] space-y-12">
      <h2 className="ml-2 text-lg font-semibold sm:text-2xl md:ml-6 lg:text-3xl">
        Most popular categories.
      </h2>
      <ul className="grid grid-cols-3 items-center justify-end gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {categories.map((item) => (
          <Category
            key={item._id}
            category={item}
            setSelectedCategory={setSelectedCategory}
          />
        ))}
      </ul>

      <CategoryDetails
        category={showDetailsOfCat}
        setSelectedCategory={setSelectedCategory}
      />
    </div>
  )
}

export default CategoryList
