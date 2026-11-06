import { prisma } from "../../db.ts"
import type { LoginEvent } from "../../generated/prisma/client.ts"

const RECENT_LOGINS = 10

// A própria pessoa vê os últimos acessos e nota algo estranho
export function listMyLogins(userId: string): Promise<LoginEvent[]> {
  return prisma.loginEvent.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: RECENT_LOGINS })
}
