/*
  Warnings:

  - Added the required column `topic` to the `Channel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Channel" ADD COLUMN     "topic" TEXT NOT NULL;
