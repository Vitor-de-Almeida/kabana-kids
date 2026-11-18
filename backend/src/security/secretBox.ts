import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto"

import { config } from "../config.ts"

const ALGORITHM = "aes-256-gcm"
const IV_BYTES = 12

/** Formato salvo: v1.<iv>.<tag>.<texto cifrado> (base64url) */
export function encryptSecret(plainText: string): string {
  const iv = randomBytes(IV_BYTES)
  const cipher = createCipheriv(ALGORITHM, config.twoFactorEncryptionKey, iv)
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()

  return ["v1", iv, tag, encrypted].map((part) => (typeof part === "string" ? part : part.toString("base64url"))).join(".")
}

// GCM confere a "tag": um valor adulterado falha ao abrir
export function decryptSecret(stored: string): string {
  const [version, ivText, tagText, encryptedText] = stored.split(".")
  if (version !== "v1" || !ivText || !tagText || !encryptedText) {
    throw new Error("Segredo criptografado em formato desconhecido")
  }

  const decipher = createDecipheriv(ALGORITHM, config.twoFactorEncryptionKey, Buffer.from(ivText, "base64url"))
  decipher.setAuthTag(Buffer.from(tagText, "base64url"))
  const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedText, "base64url")), decipher.final()])

  return decrypted.toString("utf8")
}
