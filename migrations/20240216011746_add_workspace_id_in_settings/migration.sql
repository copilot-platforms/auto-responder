/*
  Warnings:

  - Added the required column `workspaceId` to the `Setting` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Setting" ADD COLUMN     "workspaceId" UUID NOT NULL;
