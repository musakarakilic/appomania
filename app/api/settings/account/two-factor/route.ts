import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const twoFactorSchema = z.object({
  isTwoFactorEnabled: z.boolean()
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const validatedData = twoFactorSchema.parse(body)

    // İki faktörlü doğrulama etkinleştiriliyorsa, kullanıcının şifresi olmalı
    if (validatedData.isTwoFactorEnabled) {
      const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { password: true }
      })

      if (!user?.password) {
        return new NextResponse(
          "You must set a password before enabling two-factor authentication", 
          { status: 400 }
        )
      }
    }

    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        isTwoFactorEnabled: validatedData.isTwoFactorEnabled
      }
    })

    return NextResponse.json({
      isTwoFactorEnabled: updatedUser.isTwoFactorEnabled
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(error.errors[0].message, { status: 400 })
    }

    console.error("[TWO_FACTOR_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 