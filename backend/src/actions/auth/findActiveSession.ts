import { prisma } from "../../db.ts"
import { SESSION_IDLE_MS, hashSessionToken, toSessionUser } from "../../security/session.ts"
import type { SessionUser } from "../../security/session.ts"

// Evita uma escrita no banco a cada clique
const TOUCH_INTERVAL_MS = 60 * 1000

export async function findActiveSession(token: string): Promise<SessionUser | null> {
  const session = await prisma.session.findUnique({
    where: { tokenHash: hashSessionToken(token) },
    include: { user: true },
  })
  if (!session) {
    return null
  }

  const now = Date.now()
  const isExpired = session.expiresAt.getTime() <= now
  const isIdle = session.lastUsedAt.getTime() + SESSION_IDLE_MS <= now
  if (isExpired || isIdle) {
    await prisma.session.delete({ where: { id: session.id } })
    return null
  }

  if (now - session.lastUsedAt.getTime() > TOUCH_INTERVAL_MS) {
    await prisma.session.update({ where: { id: session.id }, data: { lastUsedAt: new Date(now) } })
  }

  return toSessionUser(session.user, session.id)
}
