import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const dates = await db.appointment.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        startTime: true,
      },
      distinct: ['startTime'],
    });

    return NextResponse.json(dates.map(d => d.startTime));
  } catch (error) {
    console.error("[APPOINTMENT_DATES]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 