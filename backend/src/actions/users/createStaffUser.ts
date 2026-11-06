import { randomBytes } from "node:crypto"

import { prisma } from "../../db.ts"
import { Prisma } from "../../generated/prisma/client.ts"
import type { User } from "../../generated/prisma/client.ts"
import { logger } from "../../logger.ts"
import { sendMail } from "../../mail/sendMail.ts"
import type { MailMessage } from "../../mail/sendMail.ts"
import type { CreateStaffUserInput } from "../../schemas/users/createStaffUser.ts"
import { hashPassword } from "../../security/password.ts"
import type { SessionUser } from "../../security/session.ts"
import { issuePasswordLink } from "../passwordReset/issuePasswordLink.ts"
import { recordAudit } from "../audit/recordAudit.ts"

/** Retorna null se o e-mail já tem conta. A pessoa cria a senha pelo convite (D45). */
export async function createStaffUser(
  actor: SessionUser,
  input: CreateStaffUserInput,
  requestId: string,
): Promise<User | null> {
  if (await prisma.user.findUnique({ where: { email: input.email } })) {
    return null
  }

  // Senha que ninguém conhece: a conta só abre pelo link do convite
  const unusablePasswordHash = await hashPassword(randomBytes(32).toString("base64url"))

  let created: { user: User; message: MailMessage }
  try {
    created = await prisma.$transaction(async (transaction) => {
      const user = await transaction.user.create({
        data: {
          name: input.name,
          email: input.email,
          role: input.role,
          passwordHash: unusablePasswordHash,
          mustChangePassword: true,
        },
      })
      const message = await issuePasswordLink(user, "invite", transaction)
      await recordAudit(
        { userId: actor.id, action: "user.created", targetType: "user", targetId: user.id, requestId },
        transaction,
      )
      return { user, message }
    })
  } catch (error) {
    // Dois pedidos ao mesmo tempo com o mesmo e-mail
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return null
    }
    throw error
  }

  await sendMail(created.message)
  logger.info("user.created", { request_id: requestId, user_id: created.user.id, role: created.user.role, actor_id: actor.id })
  return created.user
}
