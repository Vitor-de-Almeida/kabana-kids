import type { SessionUser } from "../security/session.ts"

// Nunca devolve o hash da senha nem o ID da sessão
export function userResource(user: SessionUser) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isOwner: user.isOwner,
    twoFactorEnabled: user.twoFactorEnabled,
    twoFactorSetupRequired: user.twoFactorSetupRequired,
    mustChangePassword: user.mustChangePassword,
  }
}
