import { LoginFormSchema } from "@/lib/types"
import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { LoaderCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import PasswordShowHide from "@/components/password-show-hide"
import Link from "next/link"

import Image from "next/image"
import Logo from "../../../../public/autozone-logo.svg"
import { FcGoogle } from "react-icons/fc"

import { loginUser, signinWithGoogle } from "@/lib/actions/authActions"
import { useToast } from "@/hooks/use-toast"
import SuccessToastDescription, {
  ErorrToastDescription,
} from "@/components/toast-items"
import { useSearchParams } from "next/navigation"
import { createClient } from "@utils/supabase/client"
import { useQueryClient } from "@tanstack/react-query"

type LoginFormSchemaTypes = z.infer<typeof LoginFormSchema>
const Page = () => {
  const queryClient = useQueryClient()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") ?? ""

  const [isShowPass, setIsShowPass] = useState(false)
  const { toast } = useToast()
  const form = useForm<z.infer<typeof LoginFormSchema>>({
    mode: "onChange",
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      username: "admin@admin.com",
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

  async function onSubmit(values: z.infer<typeof LoginFormSchema>) {
    try {
      const error = await loginUser(values, redirect)

      if (error) throw new Error(error)
      queryClient.invalidateQueries({ queryKey: ["user"] })
      // toast({
      //   className: "bg-primary  text-primary-foreground",
      //   title: "Welcome back.",
      //   description: (
      //     <SuccessToastDescription message="Glad to see you again." />
      //   ),
      // });
    } catch (error: any) {
      toast({
        variant: "destructive",
        // title: "Uh oh! Something went wrong.",
        description: <ErorrToastDescription error={error.message} />,
      })
    }
  }

  return (
    <div className="w-[700px] max-w-[700px] min-w-[97%px] space-y-10">
      <Link href="/">
        <Image src={Logo} alt="Auto zone logo" className="w-[200px]" />
      </Link>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            disabled={isLoading}
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="shadcn" {...field} />
                </FormControl>
                <FormDescription>Enter user name.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <PasswordShowHide<LoginFormSchemaTypes>
            onChange={setIsShowPass}
            disabled={isLoading}
            show={isShowPass}
            labelText={"Password"}
            placeholder="Password"
            fieldName={"password"}
            control={form.control}
            description="Enter your password."
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
              <Link href="/signup">Don&apos;t have and account? Login</Link>
            </Button>
          </div>
        </form>
      </Form>

      <Button
        disabled={isLoading}
        variant="outline"
        className="mt-10 w-full gap-5"
        onClick={async () => await signinWithGoogle()}
      >
        <FcGoogle size={20} />
        Sign in with Google
      </Button>

      <Link
        href="/forgot-password"
        className="inline-block text-xs text-muted-foreground hover:underline hover:underline-offset-2"
      >
        Forget Password{" "}
      </Link>
    </div>
  )
}

export default Page
