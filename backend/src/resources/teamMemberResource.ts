import type { User } from "../generated/prisma/client.ts"

// Aba Equipe: nunca devolve hash, segredo do 2FA nem datas da senha
export function teamMemberResource(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isOwner: user.isOwner === true,
    twoFactorEnabled: user.twoFactorEnabledAt !== null,
    mustChangePassword: user.mustChangePassword,
    createdAt: user.createdAt.toISOString(),
  }
}
