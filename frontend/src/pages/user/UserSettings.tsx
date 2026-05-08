import ErrorMessage from "@/components/error-message"
import Footer from "@/components/home/footer"
import DeleteAccount from "@/components/user/settings/delete-accont"
import UpdatePassword from "@/components/user/settings/UpdatePassword"
import UpdateUser from "@/components/user/settings/UpdateUser"
import User from "@/components/user/settings/user"

import useUserById from "@/features/users/useUserById"

import { isPast } from "date-fns"

import React from "react"
import { useParams } from "react-router"

const UserSettings = () => {
  const params = useParams()
  const { userId } = params

  const { userById, isLoading, error } = useUserById(userId)

  const isCurrentUser = userById?.id === userId
  const deleteDate = userById?.deletedAt ? String(userById.deletedAt) : ""
  const date = deleteDate ? deleteDate.split("&")[1] : ""
  const hasPasted = date ? isPast(date) : false

  return (
    <main
      className={`relative pb-10 ${hasPasted && "pointer-events-none"} `}
      id="settings-page"
    >
      <h2 className="text-4xl font-semibold">SETTINGS.</h2>
      <section className="sm:pl-4">
        {error ? (
          <ErrorMessage>
            {" "}
            <>{error.message || "Something went wrong"}</>{" "}
          </ErrorMessage>
        ) : null}
        {userById ? (
          <div className="flex w-full flex-col-reverse justify-center gap-5 sm:flex-row">
            <div className=" ">
              <UpdateUser user={userById} isCurrentUser={isCurrentUser} />
              <UpdatePassword user={userById} isCurrentUser={isCurrentUser} />
              <DeleteAccount user={userById} isCurrentUser={isCurrentUser} />
            </div>
            <User user={userById} />
          </div>
        ) : (
          "Couldn't find user"
        )}
      </section>

      <Footer className="mt-44" />
    </main>
  )
}

export default UserSettings
