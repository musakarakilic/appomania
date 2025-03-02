import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({ message: "Unauthorized" }), 
        { status: 401 }
      );
    }

    const body = await req.json();


    const { customerName, customerPhone, appointmentServices, startTime, endTime } = body;

    // Önce mevcut appointment services'leri sil
    await db.appointmentService.deleteMany({
      where: {
        appointmentId: params.id
      }
    });

    // Randevuyu güncelle
    const updatedAppointment = await db.appointment.update({
      where: {
        id: params.id,
        userId: session.user.id
      },
      data: {
        customerName,
        customerPhone,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        appointmentServices: {
          create: appointmentServices.map(({ serviceId }: { serviceId: string }) => ({
            serviceId
          }))
        }
      },
      include: {
        appointmentServices: {
          include: {
            service: true
          }
        }
      }
    });

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error("[APPOINTMENT_PATCH]", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal Error" }), 
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({ message: "Unauthorized" }), 
        { status: 401 }
      );
    }

    await db.appointment.delete({
      where: {
        id: params.id,
        userId: session.user.id
      }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[APPOINTMENT_DELETE]", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal Error" }), 
      { status: 500 }
    );
  }
} 