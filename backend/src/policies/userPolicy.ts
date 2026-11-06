import type { User, UserRole } from "../generated/prisma/client.ts"
import { canCreateRole, canResetRole, hasPermission } from "../security/permissions.ts"
import type { SessionUser } from "../security/session.ts"

export function canListUsers(actor: SessionUser): boolean {
  return hasPermission(actor.role, "users.view")
}

// Só o dono cria contas, e nunca outro admin (D40)
export function canCreateUser(actor: SessionUser, role: UserRole): boolean {
  return actor.isOwner && hasPermission(actor.role, "users.create") && canCreateRole(actor.role, role)
}

// Nunca a própria conta (use "Trocar senha") nem a do dono (só pelo terminal)
export function canResetPassword(actor: SessionUser, target: User): boolean {
  return (
    hasPermission(actor.role, "users.password.reset") &&
    target.id !== actor.id &&
    target.isOwner !== true &&
    canResetRole(actor.role, target.role)
  )
}
