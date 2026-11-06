import { prisma } from "../../db.ts"
import { logger } from "../../logger.ts"
import type { SessionUser } from "../../security/session.ts"
import { checkTwoFactorCode } from "./checkTwoFactorCode.ts"

// O 2FA só liga depois que a pessoa prova que o app gera o código
export async function confirmTwoFactorSetup(user: SessionUser, code: string, requestId: string): Promise<boolean> {
  const saved = await prisma.user.findUniqueOrThrow({ where: { id: user.id } })
  if (saved.twoFactorEnabledAt || !(await checkTwoFactorCode(saved, code))) {
    return false
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { twoFactorEnabledAt: new Date() } }),
    // Outras sessões abertas antes do 2FA são encerradas
    prisma.session.deleteMany({ where: { userId: user.id, id: { not: user.sessionId } } }),
  ])

  logger.info("user.two_factor_enabled", { request_id: requestId, user_id: user.id })
  return true
}
