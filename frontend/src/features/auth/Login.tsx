import { LoginFormSchema } from "@/lib/types"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"

import { LoaderCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import PasswordShowHide from "@/components/password-show-hide"

import { FcGoogle } from "react-icons/fc"

// import SuccessToastDescription, {
//   ErorrToastDescription,
// } from "@/components/toast-items"

import { useQueryClient } from "@tanstack/react-query"
import { Link, useNavigate, useSearchParams } from "react-router"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { login } from "@/services/authApi"
import { toast } from "sonner"

type LoginFormSchemaTypes = z.infer<typeof LoginFormSchema>
const Login = () => {
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get("redirect") ?? ""
  const navigate = useNavigate()
  const [isShowPass, setIsShowPass] = useState(false)

  const form = useForm<z.infer<typeof LoginFormSchema>>({
    mode: "onChange",
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      email: "admin@admin.com",
      password: "test123456",
    },
  })

  const isLoading = form.formState.isSubmitting

  // async function handleGoogleSginIn() {
  //   const { data, error } = await supabase.auth.signInWithOAuth({
  //     provider: "google",
  //     options: {
  //       redirectTo: "http://localhost:3000",
  //     },
  //   });

  //   console.log(data);
  //   if (error)
  //     toast({
  //       variant: "destructive",
  //       title: "Uh oh! Something went wrong.",
  //       description: <ErorrToastDescription error={error.message} />,
  //     });
  // }

  async function onSubmit({
    email,
    password,
  }: z.infer<typeof LoginFormSchema>) {
    try {
      await login(email, password)
      queryClient.invalidateQueries({ queryKey: ["user"] })
      navigate(redirect || "/")
      // toast({
      //   className: "bg-primary  text-primary-foreground",
      //   title: "Welcome back.",
      //   description: (
      //     <SuccessToastDescription message="Glad to see you again." />
      //   ),
      // });
    } catch (error: any) {
      console.log(error)
      toast.error(`Login failed. ${error.message}.`)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-[97%] max-w-[700px] space-y-7">
        <Link to="/" className="inline-block">
          <img
            src="/autozone-logo.svg"
            alt="Auto zone logo"
            className="w-[200px]"
          />
        </Link>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="Provide a vaild email address"
                  autoComplete="off"
                />
                <FieldDescription>
                  Provide a valid email address.
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
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
                <FieldDescription>Provide a valid password.</FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <div className="flex flex-col gap-2 pt-10">
            <Button type="submit" disabled={isLoading}>
              {!isLoading ? (
                "Login"
              ) : (
                <LoaderCircle size={20} className="animate-spin" />
              )}
            </Button>
            <Button variant="secondary" asChild disabled={isLoading}>
              <Link to="/signup">Don&apos;t have an account? Sign up</Link>
            </Button>
          </div>
        </form>

        <Button
          disabled={isLoading}
          variant="outline"
          className="mt-4 w-full gap-5"
        >
          <FcGoogle size={20} />
          Sign in with Google
        </Button>

        <Link
          to="/forgot-password"
          className="inline-block text-xs text-muted-foreground hover:underline hover:underline-offset-2"
        >
          Forgot Password
        </Link>
      </div>
    </main>
  )
}

export default Login
