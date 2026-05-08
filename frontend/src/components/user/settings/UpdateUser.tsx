import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import React, {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"
import type { FileWithPath } from "react-dropzone"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import ProfilePicture from "./profile-picture"

import Spinner from "@/components/Spinner"
import useObjectCompare from "@/hooks/use-compare-objs"
import FormErrorMessage from "@/components/form-error-message"
import { AnimatePresence } from "framer-motion"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Tooltip,
  TooltipProvider,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import RejectedFiles from "./rejected-files"
import { useQueryClient } from "@tanstack/react-query"
import type { Role, User } from "@/types"
import type { RejectionFiles } from "@/lib/types"
import { toast } from "sonner"
import { updateCurrentUser, updateUser } from "@/services/authApi"
import { BASE_URL } from "@/lib/constants"

// interface Props {
//   userData: {
//     isAdmin: boolean
//     isCurrUser: boolean
//     user: User
//     client: Client | null
//   }
// }

type DefaultValues = {
  full_name: string
  role: Role
  avatar_url: string
}

interface Image extends FileWithPath {
  preview: string
}
const UpdateUser = ({
  user,
  isCurrentUser,
}: {
  user: User
  isCurrentUser: boolean
}) => {
  const full_name = user.username
  const avatar_url = user.picture && `${BASE_URL}/${user.picture}`
  const userRole = user.role || "user"

  const defaultValues: DefaultValues = {
    full_name,
    avatar_url,
    role: userRole,
  }

  const queryClient = useQueryClient()

  const [isLoading, setIsLoading] = useState(false)
  const [username, setUsername] = useState<string>(full_name)
  const [file, setFile] = useState<FileWithPath | null>(null)
  const [role, setRole] = useState<Role>(userRole)
  const [rejectedFiles, setRejectedFiles] = useState<RejectionFiles[]>([])
  const [updateClient, setUpdateClient] = useState(false)

  const formValues = {
    full_name: username,
    avatar_url: file || avatar_url,
    role,
  }

  const isCurrent = user
  const isEqual = useObjectCompare(defaultValues, formValues)
  const disabled = isEqual || isLoading
  const formRef = useRef<HTMLFormElement>(null)
  // const image = file ? URL.createObjectURL(file) : avatar_url;
  const errors: { username?: string; role?: string; file?: string } = {}
  if (username.length < 3) errors.username = "Username is too short."
  if (username.length > 35) errors.username = "Username is too long."

  // const viewedImage =
  //   file && file instanceof File && (file as any).preview // If file is a File object with a preview
  //     ? (file as any).preview
  //     : typeof file === "string" && file.trim() !== "" // If file is a non-empty string (e.g., a typed URL)
  //     ? file
  //     : avatar_url || "";

  const handleReset = useCallback(() => {
    setUsername(defaultValues.full_name)
    setRole(defaultValues.role)
    setFile(null)
  }, [defaultValues])

  async function handleUpdateUser(e: FormEvent) {
    e.preventDefault()
    // if(disabled) return

    const formData = new FormData()
    formData.append("username", username)
    formData.append("role", role)
    formData.append("picture", file || "")
    // formData.append("isCurrUser", String(isCurrUser))

    // formData.append("currUserPic", avatar_url)
    setIsLoading(true)
    try {
      if (isCurrentUser) {
        await updateCurrentUser(formData)
      } else {
        await updateUser({ id: user.id, formData })
      }

      queryClient.invalidateQueries({ queryKey: ["user"] })
      toast.success("User's data updated")
      // toast({
      //   className: "bg-primary  text-primary-foreground",
      //   title: `Done.`,
      //   description: (
      //     <SuccessToastDescription message={"User detials has been updated."} />
      //   ),
      // })
    } catch (error: any) {
      toast.error(`Failed to update user: ${error.message}`)
      // toast({
      //   variant: "destructive",
      //   title: "Something went wrong.",
      //   description: <ErorrToastDescription error={error.message} />,
      // })
    } finally {
      setIsLoading(false)
    }
  }

  // useEffect(() => {
  //   // Ensure 'preview' exists and file is a File object before revoking
  //   const currentFile = file; // Capture current file for cleanup

  //   // if (
  //   //   currentFile &&
  //   //   currentFile instanceof File &&
  //   //   (currentFile as any).preview
  //   // ) {
  //   return () => {
  //     URL.revokeObjectURL(image);
  //   };
  // }, [image]);

  return (
    <div className="mt-20 w-full max-w-[870px]">
      <section className="space-y-5 rounded-xl border bg-card/30 p-6 shadow-lg">
        <h2 className="border-b pb-2 text-xl font-semibold sm:text-base">
          Profile details
        </h2>
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <Label htmlFor="email">Email:</Label>
          <Input
            disabled={true}
            id="email"
            value={user?.email}
            className="md:max-w-[85%] md:flex-1"
          />
        </div>

        <form onSubmit={handleUpdateUser} ref={formRef} className="space-y-5">
          <div className="space-y-2">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <Label htmlFor="username">Username:</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="md:max-w-[85%] md:flex-1"
              />
              {/* <FormErrorMessage  >adas</FormErrorMessage> */}
            </div>
            <AnimatePresence>
              {errors.username && (
                <FormErrorMessage>{errors.username}</FormErrorMessage>
              )}
            </AnimatePresence>
          </div>

          {user.role === "admin" && (
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <Label htmlFor="role">Role:</Label>
              <div className="flex flex-1 items-center justify-between gap-5 md:max-w-[85%]">
                <Select
                  value={role}
                  onValueChange={(value: Role) => setRole(value)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="User">User</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger type="button" asChild>
                      <div className="inline">
                        <Checkbox
                          checked={updateClient}
                          onClick={() => setUpdateClient((is) => !is)}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      Should update the client&apos;s data.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          )}

          <ProfilePicture
            image={file}
            currPic={avatar_url}
            disabled={isLoading}
            rejectedFiles={rejectedFiles}
            setFile={setFile}
            setRejectedFiles={setRejectedFiles}
          />
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
      <RejectedFiles
        rejectedFiles={rejectedFiles}
        setRejected={setRejectedFiles}
      />
    </div>
  )
}

export default UpdateUser
