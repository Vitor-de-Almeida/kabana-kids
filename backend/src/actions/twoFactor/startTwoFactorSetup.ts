import { prisma } from "../../db.ts"
import { logger } from "../../logger.ts"
import { encryptSecret } from "../../security/secretBox.ts"
import type { SessionUser } from "../../security/session.ts"
import { createTotpSecret, totpSetupUri } from "../../security/totp.ts"

type TwoFactorSetup = { secret: string; setupUri: string }

/** Retorna null se o 2FA já está ativo (não pode ser trocado pelo site). */
export async function startTwoFactorSetup(user: SessionUser, requestId: string): Promise<TwoFactorSetup | null> {
  if (user.twoFactorEnabled) {
    return null
  }

  const secret = createTotpSecret()
  await prisma.user.update({
    where: { id: user.id },
    data: { twoFactorSecret: encryptSecret(secret), twoFactorLastStep: null },
  })

  logger.info("user.two_factor_setup_started", { request_id: requestId, user_id: user.id })

  // O segredo vai só para a própria pessoa, nesta resposta
  return { secret, setupUri: totpSetupUri(secret, user.email) }
}
