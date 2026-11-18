import { prisma } from "../../db.ts"
import type { User } from "../../generated/prisma/client.ts"
import type { SessionUser } from "../../security/session.ts"
import { recordAudit } from "../audit/recordAudit.ts"

// Equipe da escola; famílias chegam no passo 2.9
export async function listUsers(actor: SessionUser, requestId: string): Promise<User[]> {
  const users = await prisma.user.findMany({ orderBy: [{ role: "asc" }, { name: "asc" }], take: 200 })

  await recordAudit({ userId: actor.id, action: "user.listed", targetType: "user", targetId: null, requestId })
  return users
}

export function findUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } })
}
