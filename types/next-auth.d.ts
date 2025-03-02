import { UserRole } from "@prisma/client"
import NextAuth, { type DefaultSession } from "next-auth"

declare module "next-auth" {
  interface User {
    role: UserRole
    isTwoFactorEnabled: boolean
    provider?: string
  }

  interface Session {
    user: User & DefaultSession["user"]
  }
} 