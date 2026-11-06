import { createHash, randomBytes } from "node:crypto"

import { config } from "../config.ts"
import type { PasswordLinkPurpose } from "../mail/passwordLinkEmail.ts"

// Prazos do link (D45): redefinição curta, convite um pouco maior
export const LINK_VALIDITY: Record<PasswordLinkPurpose, { ms: number; label: string }> = {
  reset: { ms: 30 * 60 * 1000, label: "30 minutos" },
  invite: { ms: 24 * 60 * 60 * 1000, label: "24 horas" },
}

export function createPasswordResetToken(): string {
  return randomBytes(32).toString("base64url")
}

// O banco guarda só o hash: um vazamento não abre contas
export function hashPasswordResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex")
}

// Depois do "#": o navegador não manda o token ao servidor nem a outros sites
export function passwordResetLink(token: string): string {
  return `${config.frontendUrl}/redefinir-senha#token=${token}`
}
