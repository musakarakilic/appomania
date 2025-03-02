import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function GET() {
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
        password: true
      }
    })

    if (!user) {
      return new NextResponse("Not found", { status: 404 })
    }

    return NextResponse.json({
      hasPassword: !!user.password
    })
  } catch (error) {
    console.error("[PASSWORD_STATUS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 