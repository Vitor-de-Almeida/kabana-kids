import { prisma } from "../../db.ts"
import { logger } from "../../logger.ts"
import type { CompletePasswordResetInput } from "../../schemas/auth/completePasswordReset.ts"
import { hashPassword } from "../../security/password.ts"
import { hashPasswordResetToken } from "../../security/passwordResetToken.ts"
import { recordAudit } from "../audit/recordAudit.ts"

/** false quando o link não existe, venceu ou já foi usado. */
export async function completePasswordReset(input: CompletePasswordResetInput, requestId: string): Promise<boolean> {
  const passwordHash = await hashPassword(input.newPassword)
  const now = new Date()

  const userId = await prisma.$transaction(async (transaction) => {
    const token = await transaction.passwordResetToken.findUnique({
      where: { tokenHash: hashPasswordResetToken(input.token) },
    })
    if (!token || token.usedAt || token.expiresAt <= now) {
      return null
    }

    // Só um pedido consegue "gastar" o link, mesmo se chegarem juntos
    const spent = await transaction.passwordResetToken.updateMany({
      where: { id: token.id, usedAt: null },
      data: { usedAt: now },
    })
    if (spent.count === 0) {
      return null
    }

    // Só a senha muda: perfil, permissões e 2FA continuam iguais
    await transaction.user.update({
      where: { id: token.userId },
      data: { passwordHash, mustChangePassword: false, temporaryPasswordExpiresAt: null, temporaryPasswordUsedAt: null },
    })
    await transaction.passwordResetToken.deleteMany({ where: { userId: token.userId, usedAt: null } })
    await transaction.session.deleteMany({ where: { userId: token.userId } })
    await recordAudit(
      {
        userId: token.userId,
        action: token.purpose === "invite" ? "user.password_created" : "user.password_reset_completed",
        targetType: "user",
        targetId: token.userId,
        requestId,
        origin: "site",
      },
      transaction,
    )
    return token.userId
  })

  if (!userId) {
    logger.info("password_reset.invalid_link", { request_id: requestId })
    return false
  }
  logger.info("password_reset.completed", { request_id: requestId, user_id: userId })
  return true
}
