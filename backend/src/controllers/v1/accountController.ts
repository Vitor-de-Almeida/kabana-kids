import type { Request, Response } from "express"

import { listMyLogins } from "../../actions/auth/listMyLogins.ts"
import { confirmTwoFactorSetup } from "../../actions/twoFactor/confirmTwoFactorSetup.ts"
import { startTwoFactorSetup } from "../../actions/twoFactor/startTwoFactorSetup.ts"
import { changePassword } from "../../actions/users/changePassword.ts"
import { getCurrentUser } from "../../middleware/requireAuth.ts"
import { getRequestId } from "../../middleware/requestContext.ts"
import { loginEventResource } from "../../resources/loginEventResource.ts"
import type { ChangePasswordInput } from "../../schemas/auth/changePassword.ts"
import type { ConfirmTwoFactorInput } from "../../schemas/auth/confirmTwoFactor.ts"

const FIELD_ERROR = "Confira os campos destacados."

export async function updatePassword(request: Request, response: Response): Promise<void> {
  const input = request.body as ChangePasswordInput
  const result = await changePassword(getCurrentUser(response), input, getRequestId(response))

  if (result === "wrong_current_password") {
    response.status(422).json({ message: FIELD_ERROR, errors: { currentPassword: ["A senha atual está incorreta."] } })
    return
  }
  if (result === "too_similar") {
    response.status(422).json({
      message: FIELD_ERROR,
      errors: { newPassword: ["A nova senha é parecida demais com a atual. Escolha uma bem diferente."] },
    })
    return
  }
  response.status(204).end()
}

export async function indexMyLogins(_request: Request, response: Response): Promise<void> {
  const logins = await listMyLogins(getCurrentUser(response).id)
  response.json({ data: logins.map(loginEventResource) })
}

export async function storeTwoFactorSetup(_request: Request, response: Response): Promise<void> {
  const setup = await startTwoFactorSetup(getCurrentUser(response), getRequestId(response))

  if (!setup) {
    response.status(409).json({ message: "A verificação em duas etapas já está ativa nesta conta." })
    return
  }
  // Segredo: nunca guardar em cache do navegador ou de proxies
  response.setHeader("Cache-Control", "no-store")
  response.status(201).json({ data: setup })
}

export async function confirmTwoFactor(request: Request, response: Response): Promise<void> {
  const { code } = request.body as ConfirmTwoFactorInput
  const confirmed = await confirmTwoFactorSetup(getCurrentUser(response), code, getRequestId(response))

  if (!confirmed) {
    response.status(422).json({ message: FIELD_ERROR, errors: { code: ["Código inválido ou expirado. Confira o app e tente de novo."] } })
    return
  }
  response.status(204).end()
}
