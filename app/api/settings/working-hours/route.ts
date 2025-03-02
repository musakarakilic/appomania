import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const workingHoursSchema = z.object({
  day: z.string(),
  isOpen: z.boolean(),
  startTime: z.string(),
  endTime: z.string(),
  breakStart: z.string(),
  breakEnd: z.string(),
})

const workingHoursArraySchema = z.array(workingHoursSchema)

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const workingHours = await db.workingHours.findMany({
      where: {
        userId: session.user.id
      }
    })

    return NextResponse.json(workingHours)
  } catch (error) {
    console.error("[WORKING_HOURS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const defaultWorkingHours = [
      { day: "MONDAY", isOpen: true, startTime: "09:00", endTime: "18:00", breakStart: "12:00", breakEnd: "13:00" },
      { day: "TUESDAY", isOpen: true, startTime: "09:00", endTime: "18:00", breakStart: "12:00", breakEnd: "13:00" },
      { day: "WEDNESDAY", isOpen: true, startTime: "09:00", endTime: "18:00", breakStart: "12:00", breakEnd: "13:00" },
      { day: "THURSDAY", isOpen: true, startTime: "09:00", endTime: "18:00", breakStart: "12:00", breakEnd: "13:00" },
      { day: "FRIDAY", isOpen: true, startTime: "09:00", endTime: "18:00", breakStart: "12:00", breakEnd: "13:00" },
      { day: "SATURDAY", isOpen: true, startTime: "09:00", endTime: "14:00", breakStart: "12:00", breakEnd: "12:30" },
      { day: "SUNDAY", isOpen: false, startTime: "09:00", endTime: "18:00", breakStart: "12:00", breakEnd: "13:00" }
    ]

    // Mevcut çalışma saatlerini sil
    await db.workingHours.deleteMany({
      where: {
        userId: session.user.id
      }
    })

    // Yeni çalışma saatlerini oluştur
    for (const hours of defaultWorkingHours) {
      await db.workingHours.create({
        data: {
          ...hours,
          userId: session.user.id
        }
      })
    }

    return NextResponse.json({ message: "Working hours created successfully" })
  } catch (error) {
    console.error("[WORKING_HOURS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { workingHours } = body

    // Validate working hours data
    const validationResult = workingHoursArraySchema.safeParse(workingHours)
    if (!validationResult.success) {
      return new NextResponse("Invalid working hours data", { status: 400 })
    }

    // Önce mevcut çalışma saatlerini silelim
    await db.workingHours.deleteMany({
      where: {
        userId: session.user.id
      }
    })

    // Yeni çalışma saatlerini ekleyelim
    await db.workingHours.createMany({
      data: workingHours.map((hours: z.infer<typeof workingHoursSchema>) => ({
        ...hours,
        userId: session.user.id
      }))
    })

    return NextResponse.json({ message: "Working hours updated successfully" })
  } catch (error) {
    console.error("[WORKING_HOURS_PUT]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}