-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "isManual" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "x" DOUBLE PRECISION,
ADD COLUMN     "y" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "AppointmentService" ADD COLUMN     "actualDuration" INTEGER,
ADD COLUMN     "isResizable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;
