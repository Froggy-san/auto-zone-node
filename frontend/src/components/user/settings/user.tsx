import type { User as UserType } from "@/types"
import ImageView from "@/components/image-view"

import { ImageOffIcon } from "lucide-react"
import React, { useState } from "react"
import { BASE_URL } from "@/lib/constants"

const User = ({ user }: { user: UserType }) => {
  const [viewedImg, setViewedImg] = useState<string | null>(null)

  const image = user.picture && `${BASE_URL}/${user.picture}`
  const name = user.username

  return (
    <div className="mx-auto mt-10 flex h-fit max-w-[250px] min-w-[180px] flex-col items-center gap-2 rounded-xl bg-card/30 p-2 shadow-lg sm:sticky sm:top-5 sm:mx-0 sm:mt-20">
      {image ? (
        <img
          onClick={() => setViewedImg(image)}
          src={image}
          className="h-16 w-16 rounded-full object-cover transition-all hover:cursor-pointer hover:opacity-90 hover:contrast-75"
        />
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent p-4">
          <ImageOffIcon size={26} />
        </div>
      )}

      <p className="text-center">{name}</p>
      <ImageView image={viewedImg} handleClose={() => setViewedImg(null)} />
    </div>
  )
}

export default User
