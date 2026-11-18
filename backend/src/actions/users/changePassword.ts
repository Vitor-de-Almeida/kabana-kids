import { prisma } from "../../db.ts"
import { logger } from "../../logger.ts"
import { recordAudit } from "../audit/recordAudit.ts"
import type { ChangePasswordInput } from "../../schemas/auth/changePassword.ts"
import { hashPassword, verifyPassword } from "../../security/password.ts"
import { isSimilarPassword } from "../../security/passwordSimilarity.ts"
import type { SessionUser } from "../../security/session.ts"

export type ChangePasswordResult = "changed" | "wrong_current_password" | "too_similar"

export async function changePassword(
  user: SessionUser,
  input: ChangePasswordInput,
  requestId: string,
): Promise<ChangePasswordResult> {
  const saved = await prisma.user.findUniqueOrThrow({ where: { id: user.id } })
  if (!(await verifyPassword(input.currentPassword, saved.passwordHash))) {
    return "wrong_current_password"
  }

  // A senha antiga só existe aqui, digitada agora pela pessoa
  if (isSimilarPassword(input.currentPassword, input.newPassword)) {
    return "too_similar"
  }

  const passwordHash = await hashPassword(input.newPassword)
  await prisma.$transaction(async (transaction) => {
    // Também encerra a senha temporária, se houver (D41)
    await transaction.user.update({
      where: { id: user.id },
      data: { passwordHash, mustChangePassword: false, temporaryPasswordExpiresAt: null, temporaryPasswordUsedAt: null },
    })
    // Outros aparelhos logados precisam entrar de novo
    await transaction.session.deleteMany({ where: { userId: user.id, id: { not: user.sessionId } } })
    await recordAudit(
      { userId: user.id, action: "user.password_changed", targetType: "user", targetId: user.id, requestId },
      transaction,
    )
  })

  logger.info("user.password_changed", { request_id: requestId, user_id: user.id })

  return "changed"
}
