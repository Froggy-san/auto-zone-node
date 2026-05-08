import React from "react"
import category1 from "@../public/categories/category1.jpeg"
import category2 from "@../public/categories/category2.jpeg"
import category22 from "@../public/categories/category22.jpeg"
import category222 from "@../public/categories/brake.png"
import battary from "@../public/categories/m13670005_Prod_Battery-removebg-preview.png"
import bodyParts from "@../public/categories/body.png"
import accessories from "@../public/categories/accessory.png"
import cabin from "@../public/categories/cabin.png"
import tuning from "@../public/categories/tuning.png"
import lighting from "@../public/categories/lighting.png"
import category3 from "@../public/categories/category3.jpeg"
import category4 from "@../public/categories/category4.jpeg"
import category5 from "@../public/categories/category5.jpeg"
import Image, { StaticImageData } from "next/image"

const POPULAR_ITEMS = [
  {
    image: accessories,
    name: "Accessories",
  },
  { image: battary, name: "itemName" },
  { image: bodyParts, name: "Body parts" },
  { image: lighting, name: "Lighting" },

  { image: cabin, name: "Cabin" },
  { image: tuning, name: "Tuning" },
  { image: category222, name: "Brake system" },
]

const MostPop = () => {
  return (
    <div className="mx-auto my-20 max-w-[1200px] space-y-12">
      <h2 className="ml-2 text-lg font-semibold sm:text-2xl md:ml-6 lg:text-3xl">
        Most popular categories.
      </h2>
      <ul className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-6">
        {POPULAR_ITEMS.map((item, i) => (
          <MostPopItem key={i} item={item} />
        ))}
      </ul>
    </div>
  )
}

interface Item {
  image: StaticImageData
  name: string
}

function MostPopItem({ item }: { item: Item }) {
  return (
    <li className="round-xl flex flex-col gap-2 transition-all hover:scale-[95%]">
      <Image
        className="h-[45%] w-full object-contain"
        src={item.image}
        alt={`${item.name} picture`}
      />

      <p className="text-center">{item.name}</p>
    </li>
  )
}

export default MostPop
