import type { Request, Response } from "express"

import { createSession } from "../../actions/auth/createSession.ts"
import { revokeSession } from "../../actions/auth/revokeSession.ts"
import { getCurrentUser } from "../../middleware/requireAuth.ts"
import { getRequestId } from "../../middleware/requestContext.ts"
import { userResource } from "../../resources/userResource.ts"
import type { CreateSessionInput } from "../../schemas/auth/createSession.ts"
import { SESSION_COOKIE, readSessionToken, sessionCookieOptions } from "../../security/session.ts"

// Cortados no tamanho das colunas
function loginClient(request: Request) {
  return { ip: (request.ip ?? "").slice(0, 45), userAgent: (request.get("user-agent") ?? "").slice(0, 512) }
}

export async function storeSession(request: Request, response: Response): Promise<void> {
  const input = request.body as CreateSessionInput
  const result = await createSession(input, readSessionToken(request), loginClient(request), getRequestId(response))

  switch (result.kind) {
    case "created":
      response.cookie(SESSION_COOKIE, result.token, sessionCookieOptions())
      response.status(201).json({ data: userResource(result.user) })
      return
    case "two_factor_required":
      response.status(401).json({ message: "Digite o código de 6 números do app autenticador.", twoFactorRequired: true })
      return
    case "temporary_password_expired":
      response.status(401).json({ message: "Esta senha temporária expirou ou já foi usada. Peça uma nova a quem cuida das contas da escola." })
      return
    case "invalid_two_factor_code":
      response.status(401).json({ message: "Código inválido ou expirado. Confira o app e tente de novo.", twoFactorRequired: true })
      return
    case "invalid_credentials":
      // Mesma mensagem para e-mail inexistente e senha errada
      response.status(401).json({ message: "E-mail ou senha inválidos." })
  }
}

export async function destroySession(_request: Request, response: Response): Promise<void> {
  await revokeSession(getCurrentUser(response), getRequestId(response))

  response.clearCookie(SESSION_COOKIE, sessionCookieOptions())
  response.status(204).end()
}

export function showCurrentUser(_request: Request, response: Response): void {
  response.json({ data: userResource(getCurrentUser(response)) })
}
