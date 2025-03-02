import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  appointmentReminders: z.boolean(),
  marketingEmails: z.boolean(),
  systemNotifications: z.boolean(),
})

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const settings = await db.notificationSettings.findUnique({
      where: {
        userId: session.user.id
      }
    })

    if (!settings) {
      // Return default settings if none exists
      return NextResponse.json({
        emailNotifications: true,
        smsNotifications: true,
        appointmentReminders: true,
        marketingEmails: false,
        systemNotifications: true,
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("[NOTIFICATION_SETTINGS_GET]", error)
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
    const validatedData = notificationSettingsSchema.parse(body)

    const settings = await db.notificationSettings.upsert({
      where: {
        userId: session.user.id
      },
      create: {
        ...validatedData,
        userId: session.user.id
      },
      update: validatedData
    })

    return NextResponse.json(settings)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 })
    }

    console.error("[NOTIFICATION_SETTINGS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 