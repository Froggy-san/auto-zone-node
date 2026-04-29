import { ResetPasswordSchema } from "@/lib/types"
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
import { signUp, resetPasswordAction } from "@/lib/actions/authActions"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"

type sginUpSchemaTypes = z.infer<typeof ResetPasswordSchema>

const Page = () => {
  const searchParams = useSearchParams()
  const code = searchParams.get("code")

  const [isShowPass, setIsShowPass] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const router = useRouter()
  const form = useForm<z.infer<typeof ResetPasswordSchema>>({
    mode: "onChange",
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const isLoading = form.formState.isSubmitting

  async function onSubmit({ password }: sginUpSchemaTypes) {
    try {
      // const token = localStorage.getItem("auto-zone-token");
      if (!code) throw new Error("invaild Auth Token Provided.")
      const error = await resetPasswordAction(password, code)

      if (error) {
        console.log(error)
        throw new Error(error)
      }
      toast({
        className: "bg-primary  text-primary-foreground",
        title: "Done.",
        description: (
          <SuccessToastDescription message="Password has been reset successfully." />
        ),
      })
      queryClient.invalidateQueries({ queryKey: ["user"] })
      router.replace("/")
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
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <h1 className="text-xl font-bold sm:text-3xl">Reset Password</h1>

          <div className="my-7 space-y-3">
            <PasswordShowHide<sginUpSchemaTypes>
              onChange={setIsShowPass}
              disabled={isLoading}
              show={isShowPass}
              labelText={"Password"}
              fieldName={"password"}
              placeholder="Password"
              control={form.control}
              description="Enter your new password."
            />

            <PasswordShowHide<sginUpSchemaTypes>
              onChange={setIsShowPass}
              disabled={isLoading}
              placeholder="Confirm password"
              show={isShowPass}
              labelText={"Confirm password"}
              fieldName={"confirmPassword"}
              control={form.control}
              description="Confirm your new password."
            />
          </div>

          <Button
            disabled={isLoading}
            type="submit"
            size="sm"
            className="w-full overflow-hidden"
          >
            {!isLoading ? "Confirm" : <Spinner />}
          </Button>
        </form>
      </Form>
    </div>
  )
}

export default Page
