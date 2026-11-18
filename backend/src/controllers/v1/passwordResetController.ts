import type { Request, Response } from "express"

import { completePasswordReset } from "../../actions/passwordReset/completePasswordReset.ts"
import { requestPasswordReset } from "../../actions/passwordReset/requestPasswordReset.ts"
import { getRequestId } from "../../middleware/requestContext.ts"
import type { CompletePasswordResetInput } from "../../schemas/auth/completePasswordReset.ts"
import type { RequestPasswordResetInput } from "../../schemas/auth/requestPasswordReset.ts"

const INVALID_LINK = "Este link é inválido ou expirou. Peça um novo."

export async function storePasswordResetRequest(request: Request, response: Response): Promise<void> {
  const { email } = request.body as RequestPasswordResetInput
  await requestPasswordReset(email, getRequestId(response))

  // Sempre igual: não revela se o e-mail tem conta (seguranca.md)
  response.status(202).json({
    message: "Se o e-mail estiver cadastrado, você vai receber um link em alguns minutos. Confira também a caixa de spam.",
  })
}

export async function storePasswordReset(request: Request, response: Response): Promise<void> {
  const input = request.body as CompletePasswordResetInput
  const completed = await completePasswordReset(input, getRequestId(response))

  if (!completed) {
    response.status(422).json({ message: INVALID_LINK, errors: { token: [INVALID_LINK] } })
    return
  }
  response.status(204).end()
}
