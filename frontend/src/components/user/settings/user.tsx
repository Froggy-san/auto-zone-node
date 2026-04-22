"use client";
import ImageView from "@components/image-view";
import { Client, User as UserType } from "@lib/types";
import { ImageOffIcon } from "lucide-react";
import React, { useState } from "react";
interface Props {
  user: {
    isAdmin: boolean;
    isCurrUser: boolean;
    user: UserType;
    client: Client | null;
  };
}

const User = ({ user: { isAdmin, isCurrUser, user, client } }: Props) => {
  const [viewedImg, setViewedImg] = useState<string | null>(null);

  const image = client?.picture || user.user_metadata.avatar_url || "";
  const name = client?.name || user.user_metadata.full_name || "";

  return (
    <div className=" bg-card/30 rounded-xl mx-auto  sm:mx-0 min-w-[180px] max-w-[250px] h-fit   sm:sticky sm:top-5 shadow-lg  p-2 flex flex-col items-center gap-2  mt-10 sm:mt-20  ">
      {image ? (
        <img
          onClick={() => setViewedImg(image)}
          src={image}
          className="  transition-all hover:opacity-90 hover:contrast-75  hover:cursor-pointer object-cover w-16 h-16 rounded-full "
        />
      ) : (
        <div className=" flex items-center  w-16 h-16  rounded-full  p-4  bg-accent justify-center">
          <ImageOffIcon size={26} />
        </div>
      )}

      <p className=" text-center">{name}</p>
      <ImageView image={viewedImg} handleClose={() => setViewedImg(null)} />
    </div>
  );
};

export default User;
