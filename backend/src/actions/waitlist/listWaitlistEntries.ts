import { prisma } from "../../db.ts"
import type { WaitlistEntry } from "../../generated/prisma/client.ts"
import { logger } from "../../logger.ts"
import type { ListWaitlistEntriesQuery } from "../../schemas/waitlist/listWaitlistEntries.ts"
import type { SessionUser } from "../../security/session.ts"
import { recordAudit } from "../audit/recordAudit.ts"

export const WAITLIST_PAGE_SIZE = 20

type WaitlistPage = { entries: WaitlistEntry[]; total: number }

export async function listWaitlistEntries(
  query: ListWaitlistEntriesQuery,
  user: SessionUser,
  requestId: string,
): Promise<WaitlistPage> {
  // Anonimizados já não têm dados para mostrar
  const where = { anonymizedAt: null }
  const [entries, total] = await prisma.$transaction([
    prisma.waitlistEntry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: WAITLIST_PAGE_SIZE,
      skip: (query.page - 1) * WAITLIST_PAGE_SIZE,
    }),
    prisma.waitlistEntry.count({ where }),
  ])

  // Ver em lote dados de crianças sempre gera auditoria
  await recordAudit({ userId: user.id, action: "waitlist_entry.listed", targetType: "waitlist_entry", targetId: null, requestId })
  logger.info("waitlist_entry.listed", { request_id: requestId, user_id: user.id, page: query.page })

  return { entries, total }
}
