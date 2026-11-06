import { prisma } from "../../db.ts"
import { logger } from "../../logger.ts"
import type { SessionUser } from "../../security/session.ts"
import { recordAudit } from "../audit/recordAudit.ts"

// Apaga os dados pessoais; fica só a prova do consentimento
export const ANONYMIZED_FIELDS = {
  guardianName: null,
  email: null,
  phone: null,
  childName: null,
  childBirthDate: null,
  desiredClassroom: null,
  message: null,
} as const

/** Retorna false se o cadastro não existe ou já foi anonimizado. */
export async function anonymizeWaitlistEntry(id: string, user: SessionUser, requestId: string): Promise<boolean> {
  const anonymized = await prisma.$transaction(async (transaction) => {
    const result = await transaction.waitlistEntry.updateMany({
      where: { id, anonymizedAt: null },
      data: { ...ANONYMIZED_FIELDS, anonymizedAt: new Date() },
    })
    if (result.count === 0) {
      return false
    }

    await recordAudit(
      { userId: user.id, action: "waitlist_entry.anonymized", targetType: "waitlist_entry", targetId: id, requestId },
      transaction,
    )
    return true
  })

  if (anonymized) {
    logger.info("waitlist_entry.anonymized", { request_id: requestId, user_id: user.id, waitlist_entry_id: id })
  }

  return anonymized
}
