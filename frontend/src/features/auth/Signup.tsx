import { SignUpFormSchema } from "@/lib/types"
import React, { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"

import { Input } from "@/components/ui/input"
import PasswordShowHide from "@/components/password-show-hide"

import Spinner from "@/components/Spinner"

// import SuccessToastDescription, {
//   ErorrToastDescription,
// } from "@/components/toast-items"

import { useQueryClient } from "@tanstack/react-query"
import { Link, useNavigate } from "react-router"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { toast } from "sonner"
import { signup } from "@/services/authApi"

type sginUpSchemaTypes = z.infer<typeof SignUpFormSchema>

const Signup = () => {
  const [isShowPass, setIsShowPass] = useState(false)

  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const form = useForm<z.infer<typeof SignUpFormSchema>>({
    mode: "onChange",
    resolver: zodResolver(SignUpFormSchema),
    defaultValues: {
      email: "admin@yahoo.com",
      username: "firstaccount",
      password: "123456",
      confirmPassword: "123456",
    },
  })

  console.log(form.getValues())
  console.log(form.formState.errors, "ERRPR")
  const isLoading = form.formState.isSubmitting

  async function onSubmit({ confirmPassword, ...data }: sginUpSchemaTypes) {
    try {
      // const token = localStorage.getItem("auto-zone-token");

      await signup(data)

      toast.success("Your accout has been created")
      queryClient.invalidateQueries({ queryKey: ["user"] })
      navigate("/")
    } catch (error: any) {
      toast.error(`Failed to create your account: ${error.message}`)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-[700px] max-w-[700px] min-w-[97%px] space-y-7">
        <Link to="/">
          <img
            src="/autozone-logo.svg"
            alt="Auto zone logo"
            className="w-[200px]"
          />
        </Link>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  aria-disabled={isLoading}
                >
                  <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                  <Input
                    {...field}
                    disabled={isLoading}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="Jhon Doe"
                    autoComplete="on"
                  />
                  <FieldDescription>
                    Provide a vaild email address.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="username"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  aria-disabled={isLoading}
                >
                  <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                  <Input
                    disabled={isLoading}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    {...field}
                    placeholder="Jhon Doe"
                    autoComplete="off"
                  />
                  <FieldDescription>What should we call you.</FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                aria-disabled={isLoading}
              >
                <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                <PasswordShowHide
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  value={field.value}
                  onChange={field.onChange}
                  onShow={setIsShowPass}
                  disabled={isLoading}
                  show={isShowPass}
                  placeholder="Password"
                />
                <FieldDescription>
                  Provide a strong password for your account.
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="confirmPassword"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                aria-disabled={isLoading}
              >
                <FieldLabel htmlFor={field.name}>Confirm Password</FieldLabel>
                <PasswordShowHide
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  value={field.value}
                  onChange={field.onChange}
                  onShow={setIsShowPass}
                  disabled={isLoading}
                  show={isShowPass}
                  placeholder="Confirm Password"
                />
                <FieldDescription>Renter your password.</FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <div className="flex flex-col gap-2 pt-10">
            <Button
              disabled={isLoading}
              type="submit"
              size="sm"
              className="overflow-hidden"
            >
              {!isLoading ? "Sign Up" : <Spinner />}
            </Button>
            <Button disabled={isLoading} variant="secondary" size="sm" asChild>
              <Link to="/login">Already have an account? Login</Link>
            </Button>
          </div>
        </form>
      </div>
    </main>
  )
}

export default Signup
