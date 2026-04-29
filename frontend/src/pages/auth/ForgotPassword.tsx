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

import {
  loginUser,
  resetPasswordRequestAction,
  signinWithGoogle,
} from "@/lib/actions/authActions"
import { useToast } from "@/hooks/use-toast"
import SuccessToastDescription, {
  ErorrToastDescription,
} from "@/components/toast-items"
import { useSearchParams } from "next/navigation"
import { createClient } from "@utils/supabase/client"
import { useQueryClient } from "@tanstack/react-query"
import { Label } from "@components/ui/label"

type LoginFormSchemaTypes = z.infer<typeof LoginFormSchema>
const Page = () => {
  const queryClient = useQueryClient()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") ?? ""
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      setLoading(true)
      const error = await resetPasswordRequestAction(email)

      if (error) throw new Error(error)
      //   queryClient.invalidateQueries({ queryKey: ["user"] });
      toast({
        className: "bg-primary  text-primary-foreground",
        title: "Welcome back.",
        description: (
          <SuccessToastDescription message="A confirmation email has been sent to your email." />
        ),
      })
    } catch (error: any) {
      console.log(error.message)
      toast({
        variant: "destructive",
        // title: "Uh oh! Something went wrong.",
        description: <ErorrToastDescription error={error.message} />,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-[700px] max-w-[700px] min-w-[97%px] space-y-10">
      <Link href="/">
        <Image src={Logo} alt="Auto zone logo" className="w-[200px]" />
      </Link>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-4">
          <Label htmlFor="email">Email</Label>

          <Input
            type="email"
            id="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <p className={"text-[0.8rem] text-muted-foreground"}>
            Forgot password?, Enter your email and we will send you an email to
            reset it.
          </p>
        </div>

        <Button type="submit" disabled={loading}>
          {!loading ? (
            "Send"
          ) : (
            <LoaderCircle size={20} className="animate-spin" />
          )}
        </Button>
        {/* <Button variant="secondary" asChild disabled={isLoading}>
              <Link href="/signup">Don&apos;t have and account? Login</Link>
            </Button> */}
      </form>
    </div>
  )
}

export default Page
