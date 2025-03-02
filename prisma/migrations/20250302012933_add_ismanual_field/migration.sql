/*
  Warnings:

  - You are about to drop the column `x` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `y` on the `Appointment` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "AppointmentService" DROP CONSTRAINT "AppointmentService_serviceId_fkey";

-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "x",
DROP COLUMN "y";

-- AddForeignKey
ALTER TABLE "AppointmentService" ADD CONSTRAINT "AppointmentService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
