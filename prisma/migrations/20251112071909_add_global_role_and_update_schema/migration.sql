/*
  Warnings:

  - You are about to drop the column `instructorName` on the `Certificate` table. All the data in the column will be lost.
  - You are about to drop the column `instructorId` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `instructorId` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - Added the required column `ownerName` to the `Certificate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerId` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creatorId` to the `Quiz` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GlobalRole" AS ENUM ('SYSTEM_ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "CourseRoleType" AS ENUM ('INSTRUCTOR', 'TEACHING_ASSISTANT', 'STUDENT');

-- CreateEnum
CREATE TYPE "CoursePermission" AS ENUM ('MANAGE_COURSE', 'MANAGE_CONTENT', 'MANAGE_USERS', 'GRADE_ASSIGNMENTS', 'VIEW_ANALYTICS', 'MODERATE_COMMENTS');

-- DropForeignKey
ALTER TABLE "Course" DROP CONSTRAINT "Course_instructorId_fkey";

-- DropForeignKey
ALTER TABLE "Quiz" DROP CONSTRAINT "Quiz_instructorId_fkey";

-- DropIndex
DROP INDEX "Course_instructorId_idx";

-- DropIndex
DROP INDEX "Quiz_instructorId_idx";

-- AlterTable
ALTER TABLE "Certificate" DROP COLUMN "instructorName",
ADD COLUMN     "ownerName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Course" DROP COLUMN "instructorId",
ADD COLUMN     "ownerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Quiz" DROP COLUMN "instructorId",
ADD COLUMN     "creatorId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "globalRole" "GlobalRole" NOT NULL DEFAULT 'USER';

-- DropEnum
DROP TYPE "UserRole";

-- CreateTable
CREATE TABLE "RolePermissionTemplate" (
    "id" TEXT NOT NULL,
    "roleType" "CourseRoleType" NOT NULL,
    "permission" "CoursePermission" NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RolePermissionTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseRole" (
    "id" TEXT NOT NULL,
    "role" "CourseRoleType" NOT NULL,
    "permissions" "CoursePermission"[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "CourseRole_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RolePermissionTemplate_roleType_idx" ON "RolePermissionTemplate"("roleType");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermissionTemplate_roleType_permission_key" ON "RolePermissionTemplate"("roleType", "permission");

-- CreateIndex
CREATE INDEX "CourseRole_userId_idx" ON "CourseRole"("userId");

-- CreateIndex
CREATE INDEX "CourseRole_courseId_idx" ON "CourseRole"("courseId");

-- CreateIndex
CREATE INDEX "CourseRole_role_idx" ON "CourseRole"("role");

-- CreateIndex
CREATE INDEX "CourseRole_isActive_idx" ON "CourseRole"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "CourseRole_userId_courseId_role_key" ON "CourseRole"("userId", "courseId", "role");

-- CreateIndex
CREATE INDEX "Course_ownerId_idx" ON "Course"("ownerId");

-- CreateIndex
CREATE INDEX "Quiz_creatorId_idx" ON "Quiz"("creatorId");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseRole" ADD CONSTRAINT "CourseRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseRole" ADD CONSTRAINT "CourseRole_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseRole" ADD CONSTRAINT "CourseRole_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
