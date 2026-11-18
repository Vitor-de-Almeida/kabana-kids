import { prisma } from "../../db.ts"
import { logger } from "../../logger.ts"
import { ANONYMIZED_FIELDS } from "../waitlist/anonymizeWaitlistEntry.ts"

// Prazos de guarda (D26)
export const SIMPLE_DATA_YEARS = 5
export const RELEVANT_DATA_YEARS = 10

type PurgeResult = {
  anonymizedEntries: number
  deletedEntries: number
  deletedSessions: number
  deletedRateLimitHits: number
  deletedHistory: number
}

function yearsBefore(date: Date, years: number): Date {
  const result = new Date(date)
  result.setUTCFullYear(result.getUTCFullYear() - years)
  return result
}

export async function purgeExpiredData(now: Date = new Date()): Promise<PurgeResult> {
  const anonymized = await prisma.waitlistEntry.updateMany({
    where: { createdAt: { lt: yearsBefore(now, SIMPLE_DATA_YEARS) }, anonymizedAt: null },
    data: { ...ANONYMIZED_FIELDS, anonymizedAt: now },
  })
  const deleted = await prisma.waitlistEntry.deleteMany({
    where: { createdAt: { lt: yearsBefore(now, RELEVANT_DATA_YEARS) } },
  })
  const sessions = await prisma.session.deleteMany({ where: { expiresAt: { lt: now } } })
  const rateLimitHits = await prisma.rateLimitHit.deleteMany({ where: { resetAt: { lt: now } } })
  await prisma.passwordResetToken.deleteMany({ where: { OR: [{ expiresAt: { lt: now } }, { usedAt: { not: null } }] } })
  // Históricos: o banco só deixa apagar depois de 10 anos (D44)
  const tenYearsAgo = yearsBefore(now, RELEVANT_DATA_YEARS)
  const auditLogs = await prisma.auditLog.deleteMany({ where: { createdAt: { lt: tenYearsAgo } } })
  const loginEvents = await prisma.loginEvent.deleteMany({ where: { createdAt: { lt: tenYearsAgo } } })

  const result = {
    anonymizedEntries: anonymized.count,
    deletedEntries: deleted.count,
    deletedSessions: sessions.count,
    deletedRateLimitHits: rateLimitHits.count,
    deletedHistory: auditLogs.count + loginEvents.count,
  }
  logger.info("retention.purged", {
    anonymized_entries: result.anonymizedEntries,
    deleted_entries: result.deletedEntries,
    deleted_sessions: result.deletedSessions,
    deleted_rate_limit_hits: result.deletedRateLimitHits,
    deleted_history: result.deletedHistory,
  })

  return result
}
