"use client"

import { signIn } from "next-auth/react"
import { FcGoogle } from "react-icons/fc"
import { FaGithub } from "react-icons/fa"

import { Button } from "../ui/button"
import { DEFAULT_LOGIN_REDIRECT } from "@/routes"

export const Social = () => {
    const onClick = (provider: "google" | "github") => {
        signIn(provider, {
            callbackUrl: DEFAULT_LOGIN_REDIRECT,
        })
    }

    return (
        <div className="flex flex-col w-full gap-y-2">
            <Button
                size="lg"
                className="w-full relative flex items-center justify-center gap-x-2 rounded-full bg-white hover:bg-gray-50 text-black font-normal border border-gray-300"
                variant="outline"
                onClick={() => onClick("google")}
            >
                <FcGoogle className="h-5 w-5 absolute left-4" />
                <span>Sign up with Google</span>
            </Button>
            <Button
                size="lg"
                className="w-full relative flex items-center justify-center gap-x-2 rounded-full bg-black hover:bg-gray-900 text-white font-normal"
                onClick={() => onClick("github")}
            >
                <FaGithub className="h-5 w-5 absolute left-4" />
                <span>Sign up with Github</span>
            </Button>
        </div>
    )
}