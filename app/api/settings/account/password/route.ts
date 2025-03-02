import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { z } from "zod"
import bcrypt from "bcryptjs"

const passwordSchema = z.object({
  currentPassword: z.string().nullable(),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const validatedData = passwordSchema.parse(body)

    const user = await db.user.findUnique({
      where: {
        id: session.user.id
      },
      select: {
        password: true
      }
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    // If user has a password, verify the current password
    if (user.password) {
      if (!validatedData.currentPassword) {
        return new NextResponse("Current password is required", { status: 400 })
      }

      const isValid = await bcrypt.compare(
        validatedData.currentPassword,
        user.password
      )

      if (!isValid) {
        return new NextResponse("Current password is incorrect", { status: 400 })
      }
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(validatedData.newPassword, 10)

    // Update the user's password
    await db.user.update({
      where: {
        id: session.user.id
      },
      data: {
        password: hashedPassword
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(error.errors[0].message, { status: 400 })
    }

    console.error("[PASSWORD_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 