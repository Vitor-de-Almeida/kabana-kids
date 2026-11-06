import type { Request, Response } from "express"

import { createStaffUser } from "../../actions/users/createStaffUser.ts"
import { findUserById, listUsers } from "../../actions/users/listUsers.ts"
import { sendPasswordResetLink } from "../../actions/passwordReset/sendPasswordResetLink.ts"
import { getCurrentUser } from "../../middleware/requireAuth.ts"
import { getRequestId } from "../../middleware/requestContext.ts"
import { canCreateUser, canResetPassword } from "../../policies/userPolicy.ts"
import { teamMemberResource } from "../../resources/teamMemberResource.ts"
import type { CreateStaffUserInput } from "../../schemas/users/createStaffUser.ts"
import type { UserParams } from "../../schemas/users/userParams.ts"

const FORBIDDEN = { message: "Você não tem permissão para fazer isso." }

export async function indexUsers(_request: Request, response: Response): Promise<void> {
  const users = await listUsers(getCurrentUser(response), getRequestId(response))
  response.json({ data: users.map(teamMemberResource) })
}

export async function storeUser(request: Request, response: Response): Promise<void> {
  const input = request.body as CreateStaffUserInput
  const actor = getCurrentUser(response)
  if (!canCreateUser(actor, input.role)) {
    response.status(403).json(FORBIDDEN)
    return
  }

  const created = await createStaffUser(actor, input, getRequestId(response))
  if (!created) {
    response.status(422).json({ message: "Confira os campos destacados.", errors: { email: ["Já existe uma conta com este e-mail."] } })
    return
  }
  response.status(201).json({ data: teamMemberResource(created) })
}

export async function storePasswordResetLink(_request: Request, response: Response): Promise<void> {
  const { id } = response.locals.params as UserParams
  const actor = getCurrentUser(response)
  const target = await findUserById(id)

  if (!target) {
    response.status(404).json({ message: "Conta não encontrada." })
    return
  }
  if (!canResetPassword(actor, target)) {
    response.status(403).json(FORBIDDEN)
    return
  }

  await sendPasswordResetLink(actor, target, getRequestId(response))
  response.status(202).json({ message: "Enviamos um link de redefinição para o e-mail da pessoa." })
}
