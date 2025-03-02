import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/auth"
import { Prisma } from "@prisma/client"

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({ message: "Unauthorized" }), 
        { status: 401 }
      );
    }

    const body = await req.json();
    const { customerName, customerPhone, serviceIds, startTime, endTime } = body;

    // Validasyon
    if (!customerName || !customerPhone || !serviceIds || serviceIds.length === 0 || !startTime || !endTime) {
      return new NextResponse(
        JSON.stringify({ message: "Tüm alanlar gereklidir" }), 
        { status: 400 }
      );
    }

    // Önce randevuyu oluştur
    const appointment = await db.appointment.create({
      data: {
        customerName,
        customerPhone,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        userId: session.user.id
      }
    });

    // Seçilen hizmetleri randevuya bağla
    await Promise.all(
      serviceIds.map((serviceId: string) =>
        db.appointmentService.create({
          data: {
            appointmentId: appointment.id,
            serviceId
          }
        })
      )
    );

    // Randevuyu hizmetlerle birlikte getir
    const appointmentWithServices = await db.appointment.findUnique({
      where: { id: appointment.id },
      include: {
        appointmentServices: {
          include: {
            service: true
          }
        }
      }
    });

    return NextResponse.json(appointmentWithServices);
  } catch (error) {
    console.error("[APPOINTMENTS_POST]", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal Error" }), 
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({ message: "Oturum açmanız gerekiyor" }), 
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    let appointments
    if (startDate && endDate) {
      const start = new Date(startDate)
      start.setHours(0, 0, 0, 0)
      
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)

      appointments = await db.appointment.findMany({
        where: {
          userId: session.user.id,
          startTime: {
            gte: start,
            lte: end
          }
        },
        include: {
          appointmentServices: {
            include: {
              service: true
            }
          }
        },
        orderBy: {
          startTime: "asc"
        }
      })
    } else {
      appointments = await db.appointment.findMany({
        where: {
          userId: session.user.id
        },
        include: {
          appointmentServices: {
            include: {
              service: true
            }
          }
        },
        orderBy: {
          startTime: "asc"
        }
      })
    }

    return NextResponse.json(appointments)
  } catch (error) {
    console.error("[APPOINTMENTS_GET]", error)
    return new NextResponse(
      JSON.stringify({ message: "Bir hata oluştu" }), 
      { status: 500 }
    )
  }
} 