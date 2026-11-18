-- AlterTable
ALTER TABLE "users" ADD COLUMN     "two_factor_enabled_at" TIMESTAMP(3),
ADD COLUMN     "two_factor_last_step" INTEGER,
ADD COLUMN     "two_factor_secret" VARCHAR(255);

-- CreateTable
CREATE TABLE "rate_limit_hits" (
    "key_hash" CHAR(64) NOT NULL,
    "hits" INTEGER NOT NULL,
    "reset_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rate_limit_hits_pkey" PRIMARY KEY ("key_hash")
);

-- CreateIndex
CREATE INDEX "rate_limit_hits_reset_at_idx" ON "rate_limit_hits"("reset_at");
