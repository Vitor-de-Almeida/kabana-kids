-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'manager';

-- AlterTable
ALTER TABLE "audit_logs" ADD COLUMN     "operator" VARCHAR(100),
ADD COLUMN     "origin" VARCHAR(20) NOT NULL DEFAULT 'panel',
ADD COLUMN     "result" VARCHAR(20) NOT NULL DEFAULT 'success',
ALTER COLUMN "user_id" DROP NOT NULL,
ALTER COLUMN "request_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_owner" BOOLEAN,
ADD COLUMN     "login_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "must_change_password" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "temporary_password_expires_at" TIMESTAMP(3),
ADD COLUMN     "temporary_password_used_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "login_events" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "ip" VARCHAR(45) NOT NULL,
    "user_agent" VARCHAR(512) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "login_events_user_id_created_at_idx" ON "login_events"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "users_is_owner_key" ON "users"("is_owner");

-- AddForeignKey
ALTER TABLE "login_events" ADD CONSTRAINT "login_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

