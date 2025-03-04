"use client"

import { useCallback, useEffect, useState } from "react"
import { BeatLoader } from "react-spinners"
import { useSearchParams } from "next/navigation"
import { newVerification } from "@/actions/new-verification"
import { FormError } from "../form-error"
import { FormSuccess } from "../form-success"

const NewVerificationForm = () => {
  const [error, setError] = useState<string | undefined>()
  const [success, setSuccess] = useState<string | undefined>()

  const searchParams = useSearchParams()
  const token = searchParams?.get("token")

  const onSubmit = useCallback(() => {
    if (success || error) return;

    if (!token) {
      setError("Missing token!")
      return
    }

    newVerification(token)
      .then((data) => {
        setSuccess(data.success)
        setError(data.error)
      })
      .catch(() => {
        setError("Something went wrong!")
      })
  }, [token, success, error])

  useEffect(() => {
    onSubmit()
  }, [onSubmit])

  return (
    <div className="w-full space-y-6 sm:max-w-[400px] p-4">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Verify your email
        </h1>
        <p className="text-sm text-muted-foreground">
          Please wait while we verify your email
        </p>
      </div>

      <div className="flex items-center w-full justify-center p-8">
        {!success && !error && (
          <BeatLoader color="#000" />
        )}
        <FormSuccess message={success} />
        {!success && (
          <FormError message={error} />
        )}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Back to{" "}
        <a href="/auth/login" className="underline hover:text-primary">
          Login
        </a>
      </p>
    </div>
  )
}

export default NewVerificationForm