import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const staffSchema = z.object({
  name: z.string().min(1, "İsim gereklidir"),
  email: z.string().email("Geçerli bir email adresi giriniz").nullable(),
  phone: z.string().nullable(),
  title: z.string().min(1, "Ünvan gereklidir"),
  specialties: z.array(z.string()),
  isActive: z.boolean(),
  imageUrl: z.string().nullable(),
})

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const staff = await db.staff.findMany({
      where: {
        userId: session.user.id
      }
    })

    return NextResponse.json(staff)
  } catch (error) {
    console.error("[STAFF_GET]", error)
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
    const validationResult = staffSchema.safeParse(body)

    if (!validationResult.success) {
      return new NextResponse("Invalid data", { status: 400 })
    }

    const staff = await db.staff.create({
      data: {
        ...validationResult.data,
        userId: session.user.id
      }
    })

    return NextResponse.json(staff)
  } catch (error) {
    console.error("[STAFF_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 