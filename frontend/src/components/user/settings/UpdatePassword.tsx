import FormErrorMessage from "@/components/form-error-message"
import PasswordInput from "@/components/password-input"
import Spinner from "@/components/Spinner"
import SuccessToastDescription, {
  ErorrToastDescription,
} from "@/components/toast-items"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

import { MIN_PASS_LENGTH } from "@/lib/constants"
import {
  updateCurrentUser,
  updatePassword,
  updateUser,
} from "@/services/authApi"
import type { User } from "@/types"
import { useQueryClient } from "@tanstack/react-query"

import { AnimatePresence } from "framer-motion"
import React, { type FormEvent, useState } from "react"
import { useNavigate } from "react-router"
import { toast } from "sonner"
// interface Props {
//   userData: {
//     isAdmin: boolean
//     isCurrUser: boolean
//     user: User
//   }
// }
const UpdatePassword = ({
  user,
  isCurrentUser,
}: {
  user: User
  isCurrentUser: boolean
}) => {
  const [password, setPassword] = useState("")
  const [currPass, setCurrPass] = useState("")
  const [confirmPass, setConfirmPass] = useState("")

  const [isLoading, setIsLoading] = useState(false)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const isThirdParty = user.provider != "email"

  let firstFieldError = ""
  let secondFieldError = ""
  let thirdFieldError = ""
  if (password !== confirmPass) {
    secondFieldError = "Passwords don't match."
    thirdFieldError = "Passwords don't match."
  }
  if (currPass.length && currPass.length < MIN_PASS_LENGTH)
    firstFieldError = "Current password is too short."

  if (password.length && password.length < MIN_PASS_LENGTH)
    secondFieldError = "New password is too short"

  if (confirmPass.length && confirmPass.length < MIN_PASS_LENGTH)
    thirdFieldError = "Confirm password is too short"

  const disabled =
    isThirdParty ||
    isLoading ||
    !password.length ||
    !currPass.length ||
    !confirmPass.length ||
    firstFieldError.length > 0 ||
    secondFieldError.length > 0 ||
    thirdFieldError.length > 0

  function handleReset() {
    setPassword("")
    setCurrPass("")
    setConfirmPass("")
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (disabled) return

    const formData = new FormData()
    // formData.append("id", String(user.id))
    formData.append("password", password)
    formData.append("currentPassword", currPass)
    // formData.append("username", "")ks
    // formData.append("role", "")
    // formData.append("picture", "")
    // formData.append("isCurrUser", String(isCurrUser))
    // formData.append("currUserPic", "")

    try {
      setIsLoading(true)
      console.log(isCurrentUser, "IS CURENT")
      if (isCurrentUser) {
        console.log("FIRST CONDiTION")
        await updatePassword({ password, currentPassword: currPass })
      } else {
        console.log("SECOND CONDiTION")
        await updateUser({ id: user.id, formData })
      }

      queryClient.invalidateQueries({ queryKey: ["user"] })
      queryClient.invalidateQueries({ queryKey: ["UserById", user.id] })

      // if (isCurrentUser) navigate("/")
      toast.success("Updated user's password")
      // toast({
      //   className: "bg-primary  text-primary-foreground",
      //   title: `Done.`,
      //   description: (
      //     <SuccessToastDescription message={"User detials has been updated."} />
      //   ),
      // })
    } catch (error: any) {
      toast.error(`Failed to update user's password: ${error.message}`)
      // toast({
      //   variant: "destructive",
      //   title: "Something went wrong.",
      //   description: <ErorrToastDescription error={error.message} />,
      // })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="mt-20 w-full max-w-[760px] space-y-5 rounded-xl border bg-card/30 p-6 shadow-lg">
      <h2 className="border-b pb-2 text-xl font-semibold sm:text-base">
        Password
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <Label htmlFor="current-password">Current Password:</Label>
            <PasswordInput
              id="current-password"
              value={currPass}
              className="flex-1 lg:max-w-[505px]"
              disabled={isLoading || isThirdParty}
              onChange={(e) => setCurrPass(e.target.value)}
            />
          </div>
          <AnimatePresence>
            {firstFieldError && (
              <FormErrorMessage key={firstFieldError}>
                {firstFieldError}
              </FormErrorMessage>
            )}
          </AnimatePresence>
        </div>
        <div>
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <Label htmlFor="password">New Password</Label>
            <PasswordInput
              id="password"
              value={password}
              disabled={isLoading || isThirdParty}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 lg:max-w-[505px]"
            />
          </div>
          <AnimatePresence>
            {secondFieldError && (
              <FormErrorMessage key={secondFieldError}>
                {secondFieldError}
              </FormErrorMessage>
            )}
          </AnimatePresence>
        </div>
        <div>
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <Label htmlFor="confirm">Confirm password:</Label>
            <PasswordInput
              id="confirm"
              value={confirmPass}
              className="flex-1 lg:max-w-[505px]"
              disabled={isLoading || isThirdParty}
              onChange={(e) => setConfirmPass(e.target.value)}
            />
          </div>
          <AnimatePresence>
            {thirdFieldError && (
              <FormErrorMessage key={thirdFieldError}>
                {thirdFieldError}
              </FormErrorMessage>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col items-center justify-end gap-2 md:flex-row">
          <Button
            onClick={handleReset}
            disabled={disabled}
            type="button"
            variant="secondary"
            size="sm"
            className="w-full md:w-fit"
          >
            Reset
          </Button>
          <Button
            type="submit"
            disabled={disabled}
            size="sm"
            className="w-full md:w-fit"
          >
            {isLoading ? <Spinner /> : "Submit"}
          </Button>
        </div>
      </form>
    </section>
  )
}

export default UpdatePassword
