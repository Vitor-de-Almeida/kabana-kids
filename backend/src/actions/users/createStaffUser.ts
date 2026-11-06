import { prisma } from "../../db.ts"
import { Prisma } from "../../generated/prisma/client.ts"
import type { User } from "../../generated/prisma/client.ts"
import { logger } from "../../logger.ts"
import type { CreateStaffUserInput } from "../../schemas/users/createStaffUser.ts"
import type { SessionUser } from "../../security/session.ts"
import { generateTemporaryPassword, temporaryPasswordFields } from "../../security/temporaryPassword.ts"
import { recordAudit } from "../audit/recordAudit.ts"

type CreatedStaffUser = { user: User; temporaryPassword: string }

/** Retorna null se o e-mail já tem conta. A senha aparece só nesta resposta. */
export async function createStaffUser(
  actor: SessionUser,
  input: CreateStaffUserInput,
  requestId: string,
): Promise<CreatedStaffUser | null> {
  if (await prisma.user.findUnique({ where: { email: input.email } })) {
    return null
  }

  const temporaryPassword = generateTemporaryPassword()
  const passwordFields = await temporaryPasswordFields(temporaryPassword)

  let user: User
  try {
    user = await prisma.$transaction(async (transaction) => {
      const created = await transaction.user.create({
        data: { name: input.name, email: input.email, role: input.role, ...passwordFields },
      })
      await recordAudit(
        { userId: actor.id, action: "user.created", targetType: "user", targetId: created.id, requestId },
        transaction,
      )
      return created
    })
  } catch (error) {
    // Dois pedidos ao mesmo tempo com o mesmo e-mail
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return null
    }
    throw error
  }

  logger.info("user.created", { request_id: requestId, user_id: user.id, role: user.role, actor_id: actor.id })
  return { user, temporaryPassword }
}
