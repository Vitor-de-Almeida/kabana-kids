import { prisma } from "../../db.ts"
import { logger } from "../../logger.ts"
import { sendMail } from "../../mail/sendMail.ts"
import { recordAudit } from "../audit/recordAudit.ts"
import { issuePasswordLink } from "./issuePasswordLink.ts"

// "Esqueci minha senha": a resposta é sempre a mesma, exista ou não a conta
export async function requestPasswordReset(email: string, requestId: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email } })

  // O dono só recupera pelo terminal (D41)
  if (!user || user.isOwner === true) {
    logger.info("password_reset.request_ignored", { request_id: requestId })
    return
  }

  const message = await prisma.$transaction(async (transaction) => {
    const issued = await issuePasswordLink(user, "reset", transaction)
    await recordAudit(
      {
        userId: null,
        action: "user.password_reset_requested",
        targetType: "user",
        targetId: user.id,
        requestId,
        origin: "site",
      },
      transaction,
    )
    return issued
  })

  // Sem esperar o envio: o tempo de resposta não revela se a conta existe
  sendMail(message).catch(() => {
    logger.error("mail.send_failed", { request_id: requestId, user_id: user.id })
  })
  logger.info("password_reset.requested", { request_id: requestId, user_id: user.id })
}
