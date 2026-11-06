import { config } from "../../config.ts"
import { prisma } from "../../db.ts"
import type { WaitlistEntry } from "../../generated/prisma/client.ts"
import { logger } from "../../logger.ts"
import type { StoreWaitlistEntryInput } from "../../schemas/waitlist/storeWaitlistEntry.ts"

export async function createWaitlistEntry(input: StoreWaitlistEntryInput, requestId: string): Promise<WaitlistEntry> {
  // Campo a campo: status e datas nunca vêm do cliente
  const entry = await prisma.waitlistEntry.create({
    data: {
      guardianName: input.guardianName,
      email: input.email,
      phone: input.phone,
      childName: input.childName,
      childBirthDate: new Date(input.childBirthDate),
      desiredClassroom: input.desiredClassroom,
      message: input.message ?? null,
      consentedAt: new Date(),
      privacyPolicyVersion: config.privacyPolicyVersion,
    },
  })

  logger.info("waitlist_entry.created", { request_id: requestId, waitlist_entry_id: entry.id })

  return entry
}
