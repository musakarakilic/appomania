import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/auth"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const services = await db.service.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        name: "asc"
      }
    })


    // Servisleri direkt olarak JSON olarak dön
    return NextResponse.json(services)

  } catch (error) {
    console.error("[SERVICES_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 