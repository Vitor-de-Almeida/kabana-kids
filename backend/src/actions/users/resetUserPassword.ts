import { prisma } from "../../db.ts"
import type { User } from "../../generated/prisma/client.ts"
import { logger } from "../../logger.ts"
import type { SessionUser } from "../../security/session.ts"
import { generateTemporaryPassword, temporaryPasswordFields } from "../../security/temporaryPassword.ts"
import { recordAudit } from "../audit/recordAudit.ts"

// Chame só depois da Policy canResetPassword. O 2FA é mantido (D41).
export async function resetUserPassword(actor: SessionUser, target: User, requestId: string): Promise<string> {
  const temporaryPassword = generateTemporaryPassword()
  const passwordFields = await temporaryPasswordFields(temporaryPassword)

  await prisma.$transaction(async (transaction) => {
    // Só os campos da senha: perfil e permissões nunca mudam aqui
    await transaction.user.update({ where: { id: target.id }, data: passwordFields })
    // Derruba todos os aparelhos logados da pessoa
    await transaction.session.deleteMany({ where: { userId: target.id } })
    await recordAudit(
      { userId: actor.id, action: "user.password_reset", targetType: "user", targetId: target.id, requestId },
      transaction,
    )
  })

  logger.info("user.password_reset", { request_id: requestId, user_id: target.id, actor_id: actor.id })
  return temporaryPassword
}
