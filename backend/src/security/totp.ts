import { createHmac, randomBytes, timingSafeEqual } from "node:crypto"

// TOTP (RFC 6238): o mesmo padrão do Google Authenticator
const STEP_SECONDS = 30
const DIGITS = 6
const SECRET_BYTES = 20
// Aceita o código anterior e o próximo: relógios atrasam
const ALLOWED_DRIFT_STEPS = 1
const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
const ISSUER = "Kabana Kids"

function base32Encode(bytes: Buffer): string {
  let bits = ""
  for (const byte of bytes) {
    bits += byte.toString(2).padStart(8, "0")
  }

  let text = ""
  for (let index = 0; index < bits.length; index += 5) {
    text += BASE32_ALPHABET[parseInt(bits.slice(index, index + 5).padEnd(5, "0"), 2)]
  }
  return text
}

function base32Decode(text: string): Buffer {
  let bits = ""
  for (const char of text.replace(/=+$/, "").toUpperCase()) {
    const value = BASE32_ALPHABET.indexOf(char)
    if (value === -1) {
      throw new Error("Segredo do 2FA em formato inválido")
    }
    bits += value.toString(2).padStart(5, "0")
  }

  const bytes: number[] = []
  for (let index = 0; index + 8 <= bits.length; index += 8) {
    bytes.push(parseInt(bits.slice(index, index + 8), 2))
  }
  return Buffer.from(bytes)
}

/** Segredo em base32, o formato que os apps autenticadores aceitam. */
export function createTotpSecret(): string {
  return base32Encode(randomBytes(SECRET_BYTES))
}

export function currentTotpStep(now: number = Date.now()): number {
  return Math.floor(now / 1000 / STEP_SECONDS)
}

export function totpCodeAt(secret: string, step: number): string {
  const counter = Buffer.alloc(8)
  counter.writeBigUInt64BE(BigInt(step))
  const hmac = createHmac("sha1", base32Decode(secret)).update(counter).digest()

  // "Truncamento dinâmico" da RFC 4226
  const offset = (hmac[hmac.length - 1] ?? 0) & 0x0f
  const binary = hmac.readUInt32BE(offset) & 0x7fffffff
  return String(binary % 10 ** DIGITS).padStart(DIGITS, "0")
}

/** Retorna o passo do código aceito, ou null. Rejeita passos já usados. */
export function verifyTotp(secret: string, code: string, lastUsedStep: number | null, now?: number): number | null {
  if (!/^\d{6}$/.test(code)) {
    return null
  }

  const current = currentTotpStep(now)
  for (let drift = -ALLOWED_DRIFT_STEPS; drift <= ALLOWED_DRIFT_STEPS; drift++) {
    const step = current + drift
    const expected = Buffer.from(totpCodeAt(secret, step))
    const isUnused = lastUsedStep === null || step > lastUsedStep
    if (isUnused && timingSafeEqual(expected, Buffer.from(code))) {
      return step
    }
  }
  return null
}

// Endereço que o app autenticador entende
export function totpSetupUri(secret: string, accountEmail: string): string {
  const label = encodeURIComponent(`${ISSUER}:${accountEmail}`)
  return `otpauth://totp/${label}?secret=${secret}&issuer=${encodeURIComponent(ISSUER)}&digits=${DIGITS}&period=${STEP_SECONDS}`
}
