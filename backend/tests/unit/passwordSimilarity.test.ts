// Testes da regra "a nova senha não pode parecer a anterior" (D32).
import { describe, expect, it } from "vitest"

import { isSimilarPassword } from "../../src/security/passwordSimilarity.ts"

describe("isSimilarPassword", () => {
  // Igual, ou só com maiúsculas trocadas
  it("flags the same password in another letter case", () => {
    expect(isSimilarPassword("Kabana@2025", "Kabana@2025")).toBe(true)
    expect(isSimilarPassword("Kabana@2025", "kABANA@2025")).toBe(true)
  })

  // Até 3 caracteres trocados
  it("flags a password with up to 3 changed characters", () => {
    expect(isSimilarPassword("Kabana@2025", "Kabana@2026")).toBe(true)
    expect(isSimilarPassword("Kabana@2025", "Kabana!2027x")).toBe(true)
  })

  // Mesmas letras, só números e símbolos diferentes
  it("flags the same letters with other numbers and symbols", () => {
    expect(isSimilarPassword("Kabana@2025", "#Kabana-1999!")).toBe(true)
    expect(isSimilarPassword("Escola#Feliz1", "EscolaFeliz!Nova2")).toBe(true)
  })

  // Senha realmente diferente é aceita
  it("accepts a really different password", () => {
    expect(isSimilarPassword("Kabana@2025", "Girassol#Azul88")).toBe(false)
    expect(isSimilarPassword("Ab1!Ab1!Ab", "Lua-Cheia#2031")).toBe(false)
  })
})
