import { prisma } from "../../db.ts"
import type { User } from "../../generated/prisma/client.ts"
import { logger } from "../../logger.ts"
import { sendMail } from "../../mail/sendMail.ts"
import type { SessionUser } from "../../security/session.ts"
import { recordAudit } from "../audit/recordAudit.ts"
import { issuePasswordLink } from "./issuePasswordLink.ts"

// Aba Equipe. Chame só depois da Policy canResetPassword. Ninguém vê senha (D45).
export async function sendPasswordResetLink(actor: SessionUser, target: User, requestId: string): Promise<void> {
  const message = await prisma.$transaction(async (transaction) => {
    const issued = await issuePasswordLink(target, "reset", transaction)
    // Derruba todos os aparelhos logados da pessoa na hora
    await transaction.session.deleteMany({ where: { userId: target.id } })
    await recordAudit(
      { userId: actor.id, action: "user.password_reset_link_sent", targetType: "user", targetId: target.id, requestId },
      transaction,
    )
    return issued
  })

  await sendMail(message)
  logger.info("user.password_reset_link_sent", { request_id: requestId, user_id: target.id, actor_id: actor.id })
}
