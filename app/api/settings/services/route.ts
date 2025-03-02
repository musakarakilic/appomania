import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const serviceSchema = z.object({
  name: z.string().min(1, "Hizmet adı gereklidir"),
  description: z.string().nullable(),
  duration: z.number().min(1, "Süre en az 1 dakika olmalıdır"),
  price: z.number().min(0, "Fiyat 0'dan küçük olamaz"),
  color: z.string().nullable(),
  isActive: z.boolean(),
  category: z.string().nullable(),
})

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const services = await db.service.findMany({
      where: {
        AND: [
          { userId: session.user.id }
        ]
      }
    })

    return NextResponse.json(services)
  } catch (error) {
    console.error("[SERVICES_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const validationResult = serviceSchema.safeParse(body)

    if (!validationResult.success) {
      return new NextResponse("Invalid data", { status: 400 })
    }

    const service = await db.service.create({
      data: {
        ...validationResult.data,
        userId: session.user.id
      }
    })

    return NextResponse.json(service)
  } catch (error) {
    console.error("[SERVICES_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 