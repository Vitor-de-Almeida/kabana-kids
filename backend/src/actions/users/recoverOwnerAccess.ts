import { prisma } from "../../db.ts"
import type { User } from "../../generated/prisma/client.ts"
import { logger } from "../../logger.ts"
import { generateTemporaryPassword, temporaryPasswordFields } from "../../security/temporaryPassword.ts"
import { recordAudit } from "../audit/recordAudit.ts"

// Só pelo terminal (npm run user:reset-access). Não existe rota HTTP (D41).

export type OwnerLookup = { kind: "found"; user: User } | { kind: "not_found" } | { kind: "not_owner"; user: User }

export async function findOwnerByEmail(email: string): Promise<OwnerLookup> {
  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } })
  if (!user) {
    return { kind: "not_found" }
  }
  return user.isOwner === true ? { kind: "found", user } : { kind: "not_owner", user }
}

export async function recordDeniedRecovery(targetId: string | null, operator: string): Promise<void> {
  await recordAudit({
    userId: null,
    action: "user.access_recovery",
    targetType: "user",
    targetId,
    requestId: null,
    origin: "terminal",
    result: "denied",
    operator,
  })
}

/** Nova senha temporária, 2FA desligado e todas as sessões encerradas. */
export async function recoverOwnerAccess(owner: User, operator: string): Promise<string> {
  if (owner.isOwner !== true) {
    throw new Error("A recuperação pelo terminal só vale para o dono da escola")
  }

  const temporaryPassword = generateTemporaryPassword()
  const passwordFields = await temporaryPasswordFields(temporaryPassword)

  await prisma.$transaction(async (transaction) => {
    // Perfil e dados cadastrais não mudam: só senha e 2FA
    await transaction.user.update({
      where: { id: owner.id, isOwner: true },
      data: { ...passwordFields, twoFactorSecret: null, twoFactorEnabledAt: null, twoFactorLastStep: null },
    })
    await transaction.session.deleteMany({ where: { userId: owner.id } })
    await recordAudit(
      {
        userId: null,
        action: "user.access_recovery",
        targetType: "user",
        targetId: owner.id,
        requestId: null,
        origin: "terminal",
        operator,
      },
      transaction,
    )
  })

  logger.info("user.access_recovered", { user_id: owner.id, origin: "terminal" })
  return temporaryPassword
}
