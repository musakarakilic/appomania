import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

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

    // İlgili AppointmentService kaydını bul
    const appointmentService = await db.appointmentService.findUnique({
      where: { id: params.id },
      include: { appointment: true }
    });

    if (!appointmentService) {
      return new NextResponse(
        JSON.stringify({ message: "AppointmentService not found" }), 
        { status: 404 }
      );
    }

    // Kullanıcının bu randevuya erişim yetkisi var mı kontrol et
    if (appointmentService.appointment.userId !== session.user.id) {
      return new NextResponse(
        JSON.stringify({ message: "Unauthorized" }), 
        { status: 401 }
      );
    }

    // AppointmentService kaydını sil
    await db.appointmentService.delete({
      where: { id: params.id }
    });

    // Eğer randevunun başka hizmeti kalmadıysa, randevuyu da sil
    const remainingServices = await db.appointmentService.count({
      where: { appointmentId: appointmentService.appointmentId }
    });

    if (remainingServices === 0) {
      await db.appointment.delete({
        where: { id: appointmentService.appointmentId }
      });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[APPOINTMENT_SERVICE_DELETE]", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal Error" }), 
      { status: 500 }
    );
  }
} 