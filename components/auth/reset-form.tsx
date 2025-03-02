"use client"

import * as z from "zod"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { ResetSchema } from "@/schemas"
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
import { reset } from "@/actions/reset"

const ResetForm = () => {
  const [error, setError] = useState<string | undefined>("")
  const [success, setSuccess] = useState<string | undefined>("")
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof ResetSchema>>({
    resolver: zodResolver(ResetSchema),
    defaultValues: {
      email: "",
    }
  })

  const onSubmit = (values: z.infer<typeof ResetSchema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      reset(values)
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
          Forgot password?
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your email to reset your password
        </p>
      </div>

      <Form {...form}>
        <form 
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <FormField 
            control={form.control}
            name="email"
            render={({field}) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">
                  Email*
                </FormLabel>
                <FormControl>
                  <Input 
                    {...field}
                    disabled={isPending}
                    placeholder="Enter your email"
                    type="email"
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
            Send reset email
          </Button>
        </form>
      </Form>

      <div className="flex flex-col gap-2 text-center mt-6">
        <p className="text-sm text-muted-foreground">
          Back to{" "}
          <a href="/auth/login" className="underline hover:text-primary">
            Login
          </a>
        </p>
        <a href="/" className="text-sm text-muted-foreground hover:text-primary underline">
          Back to Home
        </a>
      </div>
    </div>
  )
}

export default ResetForm