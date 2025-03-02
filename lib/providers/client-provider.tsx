"use client"

import { SessionProvider } from "next-auth/react"

interface ClientProviderProps {
  children: React.ReactNode
}

export const ClientProvider = ({
  children
}: ClientProviderProps) => {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  )
} 