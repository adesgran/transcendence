-- AlterTable
ALTER TABLE "UserChannel" ADD COLUMN     "read_until" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;