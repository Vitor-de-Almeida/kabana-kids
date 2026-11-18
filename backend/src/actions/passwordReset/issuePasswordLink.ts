import { prisma } from "../../db.ts"
import type { Prisma, User } from "../../generated/prisma/client.ts"
import { passwordLinkEmail } from "../../mail/passwordLinkEmail.ts"
import type { PasswordLinkPurpose } from "../../mail/passwordLinkEmail.ts"
import type { MailMessage } from "../../mail/sendMail.ts"
import {
  LINK_VALIDITY,
  createPasswordResetToken,
  hashPasswordResetToken,
  passwordResetLink,
} from "../../security/passwordResetToken.ts"

type Database = typeof prisma | Prisma.TransactionClient

/**
 * Cria um link novo e cancela os anteriores da pessoa.
 * Devolve o e-mail pronto; quem chama decide quando enviar.
 */
export async function issuePasswordLink(
  user: User,
  purpose: PasswordLinkPurpose,
  database: Database = prisma,
): Promise<MailMessage> {
  const token = createPasswordResetToken()
  const validity = LINK_VALIDITY[purpose]

  // Só o link mais recente vale (D45)
  await database.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } })
  await database.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashPasswordResetToken(token),
      purpose,
      expiresAt: new Date(Date.now() + validity.ms),
    },
  })

  return passwordLinkEmail(user.email, purpose, passwordResetLink(token), validity.label)
}
