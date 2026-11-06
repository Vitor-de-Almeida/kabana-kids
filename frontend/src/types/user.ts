// admin = dono da escola, um só (D40)
export type UserRole = "admin" | "manager" | "teacher" | "parent"

export type User = {
  id: string
  name: string
  email: string
  role: UserRole
  isOwner: boolean
  twoFactorEnabled: boolean
  // Precisa ativar o 2FA antes de usar o painel (D42)
  twoFactorSetupRequired: boolean
  // Entrou com senha temporária: precisa criar uma nova (D41)
  mustChangePassword: boolean
}

export type TeamMember = {
  id: string
  name: string
  email: string
  role: UserRole
  isOwner: boolean
  twoFactorEnabled: boolean
  mustChangePassword: boolean
  createdAt: string
}

export type NewTeamMemberInput = {
  name: string
  email: string
  role: "manager" | "teacher"
}

export type LoginEvent = {
  ip: string
  userAgent: string
  createdAt: string
}

export type LoginInput = {
  email: string
  password: string
  /** Código de 6 números do app autenticador (2FA) */
  code?: string
}

export type LoginResult = { kind: "loggedIn"; user: User } | { kind: "twoFactorRequired" }

export type ChangePasswordInput = {
  currentPassword: string
  newPassword: string
}

export type TwoFactorSetup = {
  /** Chave em base32 para digitar no app */
  secret: string
  /** Endereço otpauth:// que abre o app no celular */
  setupUri: string
}
