"use client"

import * as z from "zod"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useSearchParams } from "next/navigation"
import { NewPasswordSchema } from "@/schemas"
import { Input } from "../ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Button } from "../ui/button"
import { FormError } from "@/components/form-error"
import { FormSuccess } from "@/components/form-success"
import { newPassword } from "@/actions/new-password"

const NewPasswordForm = () => {
  const searchParams = useSearchParams()
  const token = searchParams?.get("token")

  const [error, setError] = useState<string | undefined>("")
  const [success, setSuccess] = useState<string | undefined>("")
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof NewPasswordSchema>>({
    resolver: zodResolver(NewPasswordSchema),
    defaultValues: {
      password: "",
    }
  })

  const onSubmit = (values: z.infer<typeof NewPasswordSchema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      newPassword(values, token)
        .then((data) => {
          setError(data?.error)
          setSuccess(data?.success)
        })
    })
  }

  return (
    <div className="w-full space-y-6 sm:max-w-[400px] p-4">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Reset your password
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your new password below
        </p>
      </div>

      <Form {...form}>
        <form 
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <FormField 
            control={form.control}
            name="password"
            render={({field}) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">
                  New Password*
                </FormLabel>
                <FormControl>
                  <Input 
                    {...field}
                    disabled={isPending}
                    placeholder="Enter your new password"
                    type="password"
                    className="rounded-full h-11 px-4 border-gray-300"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button
            disabled={isPending}
            type="submit"
            className="w-full rounded-full bg-black hover:bg-gray-900 text-white h-11"
          >
            Reset password
          </Button>
        </form>
      </Form>

      <p className="text-center text-sm text-muted-foreground">
        Back to{" "}
        <a href="/auth/login" className="underline hover:text-primary">
          Login
        </a>
      </p>
    </div>
  )
}

export default NewPasswordForm