import { BASE_URL } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { Category as CategoryType } from "@/types"
import React from "react"

const Category = ({
  category,
  setSelectedCategory,
}: {
  category: CategoryType
  setSelectedCategory: React.Dispatch<React.SetStateAction<string | undefined>>
}) => {
  return (
    <li
      onClick={() => setSelectedCategory(category._id)}
      className={cn(
        `relative flex cursor-pointer flex-col items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm transition-all hover:bg-accent/30`
      )}
    >
      {category.image ? (
        <img
          loading="lazy"
          src={`${BASE_URL}${category.image}`}
          alt={`${category.name} image`}
          className="block h-20 object-contain sm:h-24"
        />
      ) : null}

      <p className="text-center text-xs font-semibold text-muted-foreground sm:text-sm">
        {category.name}
      </p>
    </li>
  )
}

export default Category
