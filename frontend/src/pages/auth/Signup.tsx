import { SignUpFormSchema } from "@/lib/types"
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
import { Input } from "@/components/ui/input"
import PasswordShowHide from "@/components/password-show-hide"
import Link from "next/link"
import Image from "next/image"
import Logo from "../../../../public/autozone-logo.svg"
import Spinner from "@/components/Spinner"
import { useToast } from "@/hooks/use-toast"
import SuccessToastDescription, {
  ErorrToastDescription,
} from "@/components/toast-items"
import { signUp } from "@/lib/actions/authActions"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"

type sginUpSchemaTypes = z.infer<typeof SignUpFormSchema>

const Page = () => {
  const [isShowPass, setIsShowPass] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const router = useRouter()
  const form = useForm<z.infer<typeof SignUpFormSchema>>({
    mode: "onChange",
    resolver: zodResolver(SignUpFormSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const isLoading = form.formState.isSubmitting

  async function onSubmit({ email, username, password }: sginUpSchemaTypes) {
    try {
      // const token = localStorage.getItem("auto-zone-token");

      const { error } = await signUp({
        email,
        full_name: username,
        password,
        role: "User",
      })

      if (error) throw new Error(error)
      toast({
        className: "bg-primary  text-primary-foreground",
        title: "Done.",
        description: (
          <SuccessToastDescription message="Account created successfully." />
        ),
      })
      queryClient.invalidateQueries({ queryKey: ["user"] })
      router.push("/")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: <ErorrToastDescription error={error.message} />,
      })
    }
  }

  return (
    <div className="w-[700px] max-w-[700px] min-w-[97%px] space-y-7">
      <Link href="/">
        <Image src={Logo} alt="Auto zone logo" className="w-[200px]" />
      </Link>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row">
            <FormField
              disabled={isLoading}
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="YourEmail@gmail.com"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Enter a vaild email.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={isLoading}
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormDescription>
                    Etner your public display name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <PasswordShowHide<sginUpSchemaTypes>
            onChange={setIsShowPass}
            disabled={isLoading}
            show={isShowPass}
            labelText={"Password"}
            fieldName={"password"}
            placeholder="Password"
            control={form.control}
            description="Enter your password."
          />

          <PasswordShowHide<sginUpSchemaTypes>
            onChange={setIsShowPass}
            disabled={isLoading}
            placeholder="Confirm password"
            show={isShowPass}
            labelText={"Confirm password"}
            fieldName={"confirmPassword"}
            control={form.control}
            description="Confirm your password."
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
              <Link href="/login">Already have an account? Login</Link>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default Page
