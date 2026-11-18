// Testes do código de 6 números do 2FA (TOTP, RFC 6238).
import { describe, expect, it } from "vitest"

import { totpCodeAt, verifyTotp } from "../../src/security/totp.ts"

// Segredo de exemplo da própria RFC ("12345678901234567890" em base32)
const RFC_SECRET = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ"

describe("totp", () => {
  // Valores oficiais da RFC 6238 (últimos 6 dígitos)
  it("matches the RFC 6238 test vectors", () => {
    expect(totpCodeAt(RFC_SECRET, Math.floor(59 / 30))).toBe("287082")
    expect(totpCodeAt(RFC_SECRET, Math.floor(1111111109 / 30))).toBe("081804")
  })

  // Aceita o código atual e devolve o passo usado
  it("accepts the current code", () => {
    const now = 1_700_000_000_000
    const step = Math.floor(now / 30_000)

    expect(verifyTotp(RFC_SECRET, totpCodeAt(RFC_SECRET, step), null, now)).toBe(step)
  })

  // Relógio do celular um pouco atrasado ainda funciona
  it("accepts the previous code to allow for clock drift", () => {
    const now = 1_700_000_000_000
    const step = Math.floor(now / 30_000)

    expect(verifyTotp(RFC_SECRET, totpCodeAt(RFC_SECRET, step - 1), null, now)).toBe(step - 1)
  })

  // O mesmo código não vale duas vezes
  it("rejects a code that was already used", () => {
    const now = 1_700_000_000_000
    const step = Math.floor(now / 30_000)

    expect(verifyTotp(RFC_SECRET, totpCodeAt(RFC_SECRET, step), step, now)).toBeNull()
  })

  // Código antigo, errado ou com letras é recusado
  it("rejects old, wrong or malformed codes", () => {
    const now = 1_700_000_000_000
    const step = Math.floor(now / 30_000)

    expect(verifyTotp(RFC_SECRET, totpCodeAt(RFC_SECRET, step - 5), null, now)).toBeNull()
    expect(verifyTotp(RFC_SECRET, "000000", null, now)).toBeNull()
    expect(verifyTotp(RFC_SECRET, "12a456", null, now)).toBeNull()
  })
})
