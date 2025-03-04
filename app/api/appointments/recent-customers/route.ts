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

    // Son 10 randevuyu al ve müşteri bilgilerini grupla
    const recentAppointments = await db.appointment.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        customerName: true,
        customerPhone: true,
      },
      orderBy: {
        startTime: 'desc',
      },
      take: 10,
      distinct: ['customerPhone'],
    })

    // Müşteri bilgilerini formatla
    const recentCustomers = recentAppointments.map(appointment => ({
      name: appointment.customerName,
      phone: appointment.customerPhone,
    }))

    return NextResponse.json(recentCustomers)
  } catch (error) {
    console.error("[RECENT_CUSTOMERS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 