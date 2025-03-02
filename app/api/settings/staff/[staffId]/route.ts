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

export async function PATCH(
  req: Request,
  { params }: { params: { staffId: string } }
) {
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

    // Personelin mevcut kullanıcıya ait olduğunu kontrol et
    const existingStaff = await db.staff.findUnique({
      where: {
        id: params.staffId,
        userId: session.user.id
      }
    })

    if (!existingStaff) {
      return new NextResponse("Not found", { status: 404 })
    }

    const staff = await db.staff.update({
      where: {
        id: params.staffId
      },
      data: validationResult.data
    })

    return NextResponse.json(staff)
  } catch (error) {
    console.error("[STAFF_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { staffId: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Personelin mevcut kullanıcıya ait olduğunu kontrol et
    const existingStaff = await db.staff.findUnique({
      where: {
        id: params.staffId,
        userId: session.user.id
      }
    })

    if (!existingStaff) {
      return new NextResponse("Not found", { status: 404 })
    }

    await db.staff.delete({
      where: {
        id: params.staffId
      }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[STAFF_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 