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

export async function PATCH(
  req: Request,
  { params }: { params: { serviceId: string } }
) {
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

    // Hizmetin mevcut kullanıcıya ait olduğunu kontrol et
    const existingService = await db.service.findFirst({
      where: {
        AND: [
          { id: params.serviceId },
          { userId: session.user.id }
        ]
      }
    })

    if (!existingService) {
      return new NextResponse("Not found", { status: 404 })
    }

    const service = await db.service.update({
      where: {
        id: params.serviceId
      },
      data: validationResult.data
    })

    return NextResponse.json(service)
  } catch (error) {
    console.error("[SERVICES_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { serviceId: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Hizmetin mevcut kullanıcıya ait olduğunu kontrol et
    const existingService = await db.service.findFirst({
      where: {
        AND: [
          { id: params.serviceId },
          { userId: session.user.id }
        ]
      }
    })

    if (!existingService) {
      return new NextResponse("Not found", { status: 404 })
    }

    await db.service.delete({
      where: {
        id: params.serviceId
      }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[SERVICES_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 