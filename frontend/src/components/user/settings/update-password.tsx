"use client";
import FormErrorMessage from "@components/form-error-message";
import PasswordInput from "@components/password-input";
import Spinner from "@components/Spinner";
import SuccessToastDescription, {
  ErorrToastDescription,
} from "@components/toast-items";
import { Button } from "@components/ui/button";
import { Label } from "@components/ui/label";
import { useToast } from "@hooks/use-toast";
import { updateUserAction } from "@lib/actions/authActions";
import { MIN_PASS_LENGTH } from "@lib/constants";
import { User } from "@lib/types";
import { AnimatePresence } from "framer-motion";
import React, { FormEvent, useState } from "react";
interface Props {
  userData: {
    isAdmin: boolean;
    isCurrUser: boolean;
    user: User;
  };
}
const UpdatePassword = ({ userData: { isAdmin, isCurrUser, user } }: Props) => {
  const [password, setPassword] = useState("");
  const [confPass, setConfPass] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const isThirdParty = user.app_metadata.provider != "email";

  let firstFieldError = "";
  let secondFieldError = "";
  if (password !== confPass) {
    firstFieldError = "Passwords don't match.";
    secondFieldError = "Passwords don't match.";
  }
  if (password.length && password.length < MIN_PASS_LENGTH)
    firstFieldError = "Password is too short.";

  if (confPass.length && confPass.length < MIN_PASS_LENGTH)
    secondFieldError = "Confirm password is too short";

  const disabled =
    isThirdParty ||
    isLoading ||
    !password.length ||
    !confPass.length ||
    firstFieldError.length > 0 ||
    secondFieldError.length > 0;

  function handleReset() {
    setPassword("");
    setConfPass("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (disabled) return;

    const formData = new FormData();
    formData.append("id", String(user.id));
    formData.append("password", password);
    formData.append("username", "");
    formData.append("role", "");
    formData.append("avatar_url", "");
    formData.append("isCurrUser", String(isCurrUser));
    formData.append("currUserPic", "");
    setIsLoading(true);
    try {
      const { error } = await updateUserAction(formData);
      if (error) throw new Error(error);

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

  return (
    <section className="space-y-5 max-w-[760px] mt-20  w-full  p-6 rounded-xl bg-card/30 border shadow-lg">
      <h2 className=" text-xl sm:text-base font-semibold border-b pb-2">
        Password
      </h2>
      <form onSubmit={handleSubmit} className=" space-y-5">
        <div>
          <div className=" flex flex-col lg:flex-row lg:items-center   justify-between gap-5">
            <Label htmlFor="password">Password:</Label>
            <PasswordInput
              id="password"
              value={password}
              disabled={isLoading || isThirdParty}
              onChange={(e) => setPassword(e.target.value)}
              className="lg:flex-1 lg:max-w-[80%]"
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
          <div className=" flex flex-col lg:flex-row lg:items-center   justify-between gap-5">
            <Label htmlFor="confirm">Confirm password:</Label>
            <PasswordInput
              id="confirm"
              value={confPass}
              className="lg:flex-1 lg:max-w-[80%]"
              disabled={isLoading || isThirdParty}
              onChange={(e) => setConfPass(e.target.value)}
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
  );
};

export default UpdatePassword;
