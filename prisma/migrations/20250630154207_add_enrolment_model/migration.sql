/*
  Warnings:

  - You are about to drop the column `classId` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `gradeId` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `Student` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_classId_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_gradeId_fkey";

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "classId",
DROP COLUMN "gradeId",
DROP COLUMN "year";

-- CreateTable
CREATE TABLE "Enrollment" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "classId" INTEGER NOT NULL,
    "gradeId" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_studentId_year_key" ON "Enrollment"("studentId", "year");

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
