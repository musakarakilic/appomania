"use server"

import { signOut } from "@/auth"

export const logout = async () => {
    // Oturumu sonlandır ve login sayfasına yönlendir
    await signOut({ redirectTo: "/auth/login", redirect: true })
}