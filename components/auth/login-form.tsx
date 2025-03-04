"use client" // This indicates that the component will only run on the client side.

import * as z from "zod" // Importing the zod library as z. This library is used for data validation and schema definition.

import { useState, useTransition } from "react" // Importing useState and useTransition hooks from React.
import { useForm } from "react-hook-form" // Importing useForm hook from react-hook-form for form management.
import { useSearchParams } from "next/navigation" // Importing useSearchParams hook to get query parameters from the URL.
import { zodResolver } from "@hookform/resolvers/zod" // Importing the resolver that integrates zod with react-hook-form.
import Link from "next/link" // Importing Link component from Next.js to create links.

import { LoginSchema } from "@/schemas" // Importing the zod schema used for the login form.
import { Input } from "../ui/input" // Importing the Input component.

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form" // Importing components that make up the form structure.

import { CardWrapper } from "@/components/auth/card-wrapper" // Importing the card component that wraps the form.
import { Button } from "../ui/button" // Importing the Button component.

import { FormError } from "@/components/form-error" // Importing the component used to display form errors.
import { FormSuccess } from "@/components/form-success" // Importing the component used to display success messages.
import { login } from "@/actions/login" // Importing the login function that performs the login action.
import { Social } from "./social"

const LoginForm = () => {
  // Using the useSearchParams hook to get query parameters from the URL.
  const searchParams = useSearchParams();
  // If the "error" parameter in the URL is "OAuthAccountNotLinked", we set an error message.
  const urlError = searchParams?.get("error") === "OAuthAccountNotLinked" 
  ? "Email already in use with different provider!" // If the email is associated with another provider, we show this error message.
  : "";

  // Using useState hook for state management.
  const [showTwoFactor, setShowTwoFactor] = useState(false); // State that controls whether to show the two-factor authentication code.
  const [error, setError] = useState<string | undefined>(""); // State that holds error messages.
  const [success, setSuccess] = useState<string | undefined>(""); // State that holds success messages.
  const [isPending, startTransition] = useTransition(); // Using useTransition hook to manage loading state during transitions.

  // Using useForm hook for form management. Setting up form validation using the zod schema.
  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema), // Integrating the zod schema with react-hook-form.
    defaultValues: {
      email: "", // Default email value is empty.
      password: "", // Default password value is empty.
    }
  });

  // Function that runs when the form is submitted.
  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setError(""); // Resetting the error state.
    setSuccess(""); // Resetting the success state.

    // Using startTransition to manage loading state.
    startTransition(() => {
      // Performing the login action.
      login(values)
        .then((data) => {
          if (data?.error) { // If an error occurs,
            form.reset(); // Resetting the form.
            setError(data.error); // Setting the error message.
          }

          if (data?.success) { // If login is successful,
            form.reset(); // Resetting the form.
            setSuccess(data.success); // Setting the success message.
          }

          if (data?.twoFactor) { // If two-factor authentication is required,
            setShowTwoFactor(true); // Showing the two-factor authentication code.
          }
        })
        .catch(() => setError("Something went wrong!")); // If an error occurs, showing a general error message.
    });
  };

  // Form's JSX structure.
  return (
    <div className="w-full space-y-6 sm:max-w-[400px] p-4">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your account to continue
        </p>
      </div>

      <Social />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            OR
          </span>
        </div>
      </div>

      <Form {...form}>
        <form 
          onSubmit={form.handleSubmit(onSubmit)} // Form submission triggers the onSubmit function.
          className="space-y-4"
        >
          {showTwoFactor ? (
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium">
                    Two Factor Code*
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="123456"
                      className="rounded-full h-11 px-4 border-gray-300"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <>
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
              <FormField 
                control={form.control}
                name="password"
                render={({field}) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium">
                      Password*
                    </FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        disabled={isPending}
                        placeholder="Enter your password"
                        type="password"
                        className="rounded-full h-11 px-4 border-gray-300"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
          <Button
            size="sm"
            variant="link"
            asChild
            className="px-0 font-normal"
          >
            <a href="/auth/reset" className="text-xs text-muted-foreground hover:text-primary">
              Forgot password?
            </a>
          </Button>
          <FormError message={error || urlError} /> 
          <FormSuccess message={success} /> 
          <Button
            disabled={isPending}
            type="submit"
            className="w-full rounded-full bg-black hover:bg-gray-900 text-white h-11"
          >
            {showTwoFactor ? "Confirm" : "Sign in"}
          </Button>
        </form>
      </Form>

      <div className="flex flex-col gap-2 text-center mt-6">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <a href="/auth/register" className="underline hover:text-primary">
            Sign up
          </a>
        </p>
        <a href="/" className="text-sm text-muted-foreground hover:text-primary underline">
          Back to Home
        </a>
      </div>
    </div>
  );
};

export default LoginForm; // Exporting LoginForm component.
