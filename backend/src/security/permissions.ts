import type { UserRole } from "../generated/prisma/client.ts"

// Quem pode o quê (D40). Perfil novo = uma linha nesta tabela.
// A recuperação do dono não está aqui: ela não existe por HTTP.
export type Permission =
  | "waitlist.view"
  | "waitlist.anonymize"
  | "users.view"
  | "users.create"
  | "users.password.change_own"
  | "users.password.reset"

const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  admin: [
    "waitlist.view",
    "waitlist.anonymize",
    "users.view",
    "users.create",
    "users.password.change_own",
    "users.password.reset",
  ],
  manager: ["waitlist.view", "waitlist.anonymize", "users.view", "users.password.change_own", "users.password.reset"],
  teacher: ["users.password.change_own"],
  parent: ["users.password.change_own"],
}

// De quais perfis cada um pode redefinir a senha
const RESETTABLE_ROLES: Record<UserRole, readonly UserRole[]> = {
  admin: ["manager", "teacher", "parent"],
  manager: ["teacher", "parent"],
  teacher: [],
  parent: [],
}

// Quais perfis cada um pode criar (famílias: passo 2.9)
const CREATABLE_ROLES: Record<UserRole, readonly UserRole[]> = {
  admin: ["manager", "teacher"],
  manager: [],
  teacher: [],
  parent: [],
}

// Logins sem 2FA para quem não vê dados de crianças (D42)
export const LOGINS_BEFORE_TWO_FACTOR = 3
const TWO_FACTOR_FROM_FIRST_LOGIN: readonly UserRole[] = ["admin", "manager"]

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission)
}

export function canResetRole(actorRole: UserRole, targetRole: UserRole): boolean {
  return RESETTABLE_ROLES[actorRole].includes(targetRole)
}

export function canCreateRole(actorRole: UserRole, targetRole: UserRole): boolean {
  return CREATABLE_ROLES[actorRole].includes(targetRole)
}

export function mustHaveTwoFactor(role: UserRole, loginCount: number): boolean {
  return TWO_FACTOR_FROM_FIRST_LOGIN.includes(role) || loginCount > LOGINS_BEFORE_TWO_FACTOR
}
