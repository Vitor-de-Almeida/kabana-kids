-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "WaitlistStatus" AS ENUM ('pending', 'contacted', 'enrolled', 'discarded');

-- CreateEnum
CREATE TYPE "DesiredClassroom" AS ENUM ('nursery', 'toddler', 'preschool', 'undecided');

-- CreateTable
CREATE TABLE "waitlist_entries" (
    "id" TEXT NOT NULL,
    "guardian_name" VARCHAR(120) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "child_name" VARCHAR(120) NOT NULL,
    "child_birth_date" DATE NOT NULL,
    "desired_classroom" "DesiredClassroom" NOT NULL,
    "message" VARCHAR(1000),
    "status" "WaitlistStatus" NOT NULL DEFAULT 'pending',
    "consented_at" TIMESTAMP(3) NOT NULL,
    "privacy_policy_version" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "waitlist_entries_pkey" PRIMARY KEY ("id")
);

