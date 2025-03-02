import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const accountSettingsSchema = z.object({
  name: z.string().min(1, "İsim gereklidir"),
  email: z.string().email("Geçerli bir email adresi giriniz"),
  isTwoFactorEnabled: z.boolean(),
})

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await db.user.findUnique({
      where: {
        id: session.user.id
      },
      select: {
        name: true,
        email: true,
        isTwoFactorEnabled: true,
      }
    })

    if (!user) {
      return new NextResponse("Not found", { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("[ACCOUNT_SETTINGS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = accountSettingsSchema.parse(body)

    // Email değişikliği varsa, mevcut email'in başka bir kullanıcı tarafından kullanılmadığından emin ol
    if (validatedData.email !== session.user.email) {
      const existingUser = await db.user.findUnique({
        where: {
          email: validatedData.email
        }
      })

      if (existingUser) {
        return NextResponse.json({ error: "Email already in use" }, { status: 400 })
      }
    }

    const user = await db.user.update({
      where: {
        id: session.user.id
      },
      data: {
        name: validatedData.name,
        email: validatedData.email,
        isTwoFactorEnabled: validatedData.isTwoFactorEnabled
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data", issues: error.issues }, { status: 400 })
    }

    console.error("[ACCOUNT_SETTINGS_POST]", error)
    return NextResponse.json({ error: "Internal Error" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { name, email } = body

    const user = await db.user.update({
      where: { id: session.user.id },
      data: { name, email },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("[SETTINGS_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 