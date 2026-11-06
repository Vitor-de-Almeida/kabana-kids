import { randomInt } from "node:crypto"

import { hashPassword } from "./password.ts"

export const TEMPORARY_PASSWORD_HOURS = 24
const LENGTH = 16

// Sem caracteres que se confundem (0/O, 1/l/I)
const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ"
const LOWER = "abcdefghijkmnopqrstuvwxyz"
const DIGITS = "23456789"
const SPECIAL = "!@#$%&*?"
const ALL = UPPER + LOWER + DIGITS + SPECIAL

function pick(characters: string): string {
  return characters[randomInt(characters.length)] ?? ""
}

/** Senha aleatória que já cumpre as regras da D32. Ninguém a escolhe. */
export function generateTemporaryPassword(): string {
  const characters = [pick(UPPER), pick(LOWER), pick(DIGITS), pick(SPECIAL)]
  while (characters.length < LENGTH) {
    characters.push(pick(ALL))
  }

  // Embaralha (Fisher-Yates) com sorteio criptográfico
  for (let index = characters.length - 1; index > 0; index--) {
    const other = randomInt(index + 1)
    ;[characters[index], characters[other]] = [characters[other] ?? "", characters[index] ?? ""]
  }
  return characters.join("")
}

// Campos que transformam a senha em temporária (D41)
export async function temporaryPasswordFields(password: string, now: Date = new Date()) {
  return {
    passwordHash: await hashPassword(password),
    mustChangePassword: true,
    temporaryPasswordExpiresAt: new Date(now.getTime() + TEMPORARY_PASSWORD_HOURS * 60 * 60 * 1000),
    temporaryPasswordUsedAt: null,
  }
}
