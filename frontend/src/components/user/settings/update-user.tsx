"use client";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { RejectionFiles, User } from "@lib/types";
import React, {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { FileWithPath } from "react-dropzone";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProfilePicture from "./profile-picture";
import { useToast } from "@hooks/use-toast";
import SuccessToastDescription, {
  ErorrToastDescription,
} from "@components/toast-items";
import { updateUserAction } from "@lib/actions/authActions";
import Spinner from "@components/Spinner";
import useObjectCompare from "@hooks/use-compare-objs";
import FormErrorMessage from "@components/form-error-message";
import { AnimatePresence } from "framer-motion";
import { Checkbox } from "@components/ui/checkbox";
import {
  Tooltip,
  TooltipProvider,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import RejectedFiles from "./rejected-files";
import { useQueryClient } from "@tanstack/react-query";
interface Props {
  userData: {
    isAdmin: boolean;
    isCurrUser: boolean;
    user: User;
  };
}

type DefaultValues = {
  full_name: string;
  role: string;
  avatar_url: string;
};

interface Image extends FileWithPath {
  preview: string;
}
const UpdateUser = ({ userData: { isAdmin, isCurrUser, user } }: Props) => {
  const full_name = user.user_metadata?.full_name || "";
  const avatar_url = user.user_metadata?.avatar_url || "";
  const userRole = user.user_metadata?.role || "User";

  const defaultValues: DefaultValues = {
    full_name,
    avatar_url,
    role: userRole,
  };

  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState<string>(full_name);
  const [file, setFile] = useState<FileWithPath | null>(null);
  const [role, setRole] = useState(userRole);
  const queryClient = useQueryClient();
  const [rejectedFiles, setRejectedFiles] = useState<RejectionFiles[]>([]);
  const [updateClient, setUpdateClient] = useState(false);
  const { toast } = useToast();

  const formValues = {
    full_name: username,
    avatar_url: file || avatar_url,
    role,
  };
  const isEqual = useObjectCompare(defaultValues, formValues);
  const disabled = isEqual || isLoading;
  const formRef = useRef<HTMLFormElement>(null);
  // const image = file ? URL.createObjectURL(file) : avatar_url;
  const errors: { username?: string; role?: string; file?: string } = {};
  if (username.length < 3) errors.username = "Username is too short.";
  if (username.length > 35) errors.username = "Username is too long.";

  // const viewedImage =
  //   file && file instanceof File && (file as any).preview // If file is a File object with a preview
  //     ? (file as any).preview
  //     : typeof file === "string" && file.trim() !== "" // If file is a non-empty string (e.g., a typed URL)
  //     ? file
  //     : avatar_url || "";

  const handleReset = useCallback(() => {
    setUsername(defaultValues.full_name);
    setRole(defaultValues.role);
    setFile(null);
  }, [defaultValues]);

  async function handleUpdateUser(e: FormEvent) {
    e.preventDefault();
    // if(disabled) return

    const formData = new FormData();
    formData.append("username", username);
    formData.append("role", role);
    formData.append("avatar_url", file || "");
    formData.append("isCurrUser", String(isCurrUser));
    formData.append("id", String(user.id));
    formData.append("currUserPic", avatar_url);
    setIsLoading(true);
    try {
      const { error } = await updateUserAction(formData);
      if (error) throw new Error(error);

      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast({
        className: "bg-primary  text-primary-foreground",
        title: `Done.`,
        description: (
          <SuccessToastDescription message={"User detials has been updated."} />
        ),
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Something went wrong.",
        description: <ErorrToastDescription error={error.message} />,
      });
    } finally {
      setIsLoading(false);
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
    <div className="max-w-[760px] mt-20  w-full">
      <section className=" space-y-5 p-6 rounded-xl bg-card/30 border shadow-lg">
        <h2 className=" text-xl sm:text-base font-semibold border-b pb-2">
          Profile details
        </h2>
        <div className=" flex flex-col md:flex-row md:items-center justify-between gap-5">
          <Label htmlFor="email">Email:</Label>
          <Input
            disabled={true}
            id="email"
            value={user?.email}
            className=" md:flex-1   md:max-w-[85%]"
          />
        </div>

        <form onSubmit={handleUpdateUser} ref={formRef} className=" space-y-5 ">
          <div className=" space-y-2">
            <div className=" flex flex-col md:flex-row md:items-center   justify-between gap-5">
              <Label htmlFor="username">Username:</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="md:flex-1 md:max-w-[85%]"
              />
              {/* <FormErrorMessage  >adas</FormErrorMessage> */}
            </div>
            <AnimatePresence>
              {errors.username && (
                <FormErrorMessage>{errors.username}</FormErrorMessage>
              )}
            </AnimatePresence>
          </div>

          {isAdmin && (
            <div className=" flex flex-col   md:flex-row md:items-center justify-between gap-5">
              <Label htmlFor="role">Role:</Label>
              <div className="flex  items-center justify-between gap-5  md:max-w-[85%]  flex-1  ">
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className=" flex-1 ">
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
                      <div className=" inline">
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
          <div className=" flex flex-col md:flex-row items-center  justify-end gap-2">
            <Button
              onClick={handleReset}
              disabled={disabled}
              type="button"
              variant="secondary"
              size="sm"
              className=" w-full md:w-fit"
            >
              Reset
            </Button>
            <Button
              type="submit"
              disabled={disabled}
              size="sm"
              className=" w-full md:w-fit"
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
  );
};

export default UpdateUser;
