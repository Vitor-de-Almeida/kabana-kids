import { prisma } from "../../db.ts"
import { logger } from "../../logger.ts"
import type { SessionUser } from "../../security/session.ts"

export async function revokeSession(user: SessionUser, requestId: string): Promise<void> {
  await prisma.session.deleteMany({ where: { id: user.sessionId } })

  logger.info("session.revoked", { request_id: requestId, user_id: user.id, session_id: user.sessionId })
}
