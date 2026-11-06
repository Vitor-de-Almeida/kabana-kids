// Testes da rotina que aplica os prazos de guarda (D26).
import { afterAll, beforeEach, describe, expect, it } from "vitest"

import { purgeExpiredData } from "../../src/actions/retention/purgeExpiredData.ts"
import { prisma } from "../../src/db.ts"
import { cleanDatabase, createTestUser } from "../helpers.ts"

const NOW = new Date("2030-06-15T12:00:00Z")

function yearsAgo(years: number): Date {
  const date = new Date(NOW)
  date.setUTCFullYear(date.getUTCFullYear() - years)
  return date
}

// Dados fictícios, com a data de cadastro escolhida
function createEntryAt(createdAt: Date) {
  return prisma.waitlistEntry.create({
    data: {
      guardianName: "Ana Almeida",
      email: "ana@example.com",
      phone: "(11) 90000-0000",
      childName: "Manu",
      childBirthDate: new Date("2024-03-10"),
      desiredClassroom: "toddler",
      consentedAt: createdAt,
      privacyPolicyVersion: "rascunho",
      createdAt,
    },
  })
}

describe("purgeExpiredData", () => {
  beforeEach(async () => {
    await cleanDatabase()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  // Até 5 anos: nada muda
  it("keeps entries younger than 5 years", async () => {
    const entry = await createEntryAt(yearsAgo(4))

    await purgeExpiredData(NOW)

    const saved = await prisma.waitlistEntry.findUniqueOrThrow({ where: { id: entry.id } })
    expect(saved.childName).toBe("Manu")
    expect(saved.anonymizedAt).toBeNull()
  })

  // Mais de 5 anos: some o dado pessoal, fica o consentimento
  it("anonymizes entries older than 5 years", async () => {
    const entry = await createEntryAt(yearsAgo(6))

    const result = await purgeExpiredData(NOW)

    const saved = await prisma.waitlistEntry.findUniqueOrThrow({ where: { id: entry.id } })
    expect(result.anonymizedEntries).toBe(1)
    expect(saved).toMatchObject({ guardianName: null, email: null, childName: null, privacyPolicyVersion: "rascunho" })
    expect(saved.anonymizedAt).toEqual(NOW)
  })

  // Mais de 10 anos: o registro inteiro é apagado
  it("deletes entries older than 10 years", async () => {
    await createEntryAt(yearsAgo(11))

    const result = await purgeExpiredData(NOW)

    expect(result.deletedEntries).toBe(1)
    expect(await prisma.waitlistEntry.count()).toBe(0)
  })

  // Sessões vencidas são apagadas; as válidas ficam
  it("deletes expired sessions only", async () => {
    const user = await createTestUser("admin")
    const base = { userId: user.id, lastUsedAt: NOW }
    await prisma.session.create({ data: { ...base, tokenHash: "a".repeat(64), expiresAt: new Date(NOW.getTime() - 1000) } })
    await prisma.session.create({ data: { ...base, tokenHash: "b".repeat(64), expiresAt: new Date(NOW.getTime() + 1000) } })

    const result = await purgeExpiredData(NOW)

    expect(result.deletedSessions).toBe(1)
    expect(await prisma.session.count()).toBe(1)
  })
})
