import { createHash, randomBytes } from "node:crypto"
import type { CookieOptions, Request } from "express"

import { config } from "../config.ts"
import type { User, UserRole } from "../generated/prisma/client.ts"
import { mustHaveTwoFactor } from "./permissions.ts"

// Quem está logado, com o perfil lido do banco
export type SessionUser = {
  id: string
  name: string
  email: string
  role: UserRole
  isOwner: boolean
  twoFactorEnabled: boolean
  // Precisa ativar o 2FA antes de ver dados (D42)
  twoFactorSetupRequired: boolean
  // Entrou com senha temporária: só pode trocar a senha (D41)
  mustChangePassword: boolean
  sessionId: string
}

export function toSessionUser(user: User, sessionId: string): SessionUser {
  const twoFactorEnabled = user.twoFactorEnabledAt !== null
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isOwner: user.isOwner === true,
    twoFactorEnabled,
    twoFactorSetupRequired: !twoFactorEnabled && mustHaveTwoFactor(user.role, user.loginCount),
    mustChangePassword: user.mustChangePassword,
    sessionId,
  }
}

// Regras da sessão (D17 e D28)
export const SESSION_IDLE_MS = 60 * 60 * 1000
export const SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000

const isProduction = config.env === "production"

// __Host- obriga HTTPS, Path=/ e nenhum Domain
export const SESSION_COOKIE = isProduction ? "__Host-kabana_session" : "kabana_session"

const MAX_TOKEN_LENGTH = 100

export function createSessionToken(): string {
  return randomBytes(32).toString("base64url")
}

// O banco guarda só o hash: um vazamento não abre sessões
export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex")
}

// Sem maxAge: o cookie some ao fechar o navegador
export function sessionCookieOptions(): CookieOptions {
  return { httpOnly: true, secure: isProduction, sameSite: "lax", path: "/" }
}

// Lê só o cookie da sessão (D30)
export function readSessionToken(request: Request): string | null {
  const header = request.headers.cookie
  if (!header) {
    return null
  }

  for (const part of header.split(";")) {
    const [name, ...valueParts] = part.trim().split("=")
    const value = valueParts.join("=")
    if (name === SESSION_COOKIE && value && value.length <= MAX_TOKEN_LENGTH) {
      return value
    }
  }

  return null
}
