// Testes das travas do próprio banco (D40 e D44): valem até fora da API.
import { afterAll, beforeEach, describe, expect, it } from "vitest"

import { purgeExpiredData } from "../../src/actions/retention/purgeExpiredData.ts"
import { prisma } from "../../src/db.ts"
import type { User } from "../../src/generated/prisma/client.ts"
import { cleanDatabase, createTestUser } from "../helpers.ts"

describe("database rules", () => {
  let owner: User

  beforeEach(async () => {
    await cleanDatabase()
    owner = await createTestUser("admin")
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  // Nunca dois donos
  it("refuses a second owner", async () => {
    await expect(createTestUser("admin", "outro-dono@example.com")).rejects.toThrow()
    await expect(
      prisma.user.update({ where: { id: (await createTestUser("manager")).id }, data: { role: "admin", isOwner: true } }),
    ).rejects.toThrow()
  })

  // O dono não é apagado nem rebaixado
  it("protects the owner from removal and demotion", async () => {
    await expect(prisma.user.delete({ where: { id: owner.id } })).rejects.toThrow()
    await expect(prisma.user.update({ where: { id: owner.id }, data: { role: "manager", isOwner: null } })).rejects.toThrow()
  })

  // Perfil admin sem ser dono é recusado
  it("refuses an admin that is not the owner", async () => {
    await expect(prisma.user.update({ where: { id: owner.id }, data: { isOwner: null } })).rejects.toThrow()
  })

  // Auditoria: ninguém altera nem apaga registro recente
  it("refuses to change or delete recent audit entries", async () => {
    const audit = await prisma.auditLog.create({
      data: { userId: owner.id, action: "teste", targetType: "user", targetId: owner.id, requestId: null },
    })

    await expect(prisma.auditLog.update({ where: { id: audit.id }, data: { action: "outra" } })).rejects.toThrow()
    await expect(prisma.auditLog.delete({ where: { id: audit.id } })).rejects.toThrow()
  })

  // Histórico de logins também é protegido
  it("refuses to change login history", async () => {
    const event = await prisma.loginEvent.create({ data: { userId: owner.id, ip: "203.0.113.1", userAgent: "teste" } })

    await expect(prisma.loginEvent.update({ where: { id: event.id }, data: { ip: "0.0.0.0" } })).rejects.toThrow()
    await expect(prisma.loginEvent.delete({ where: { id: event.id } })).rejects.toThrow()
  })

  // Depois de 10 anos, a rotina de limpeza apaga
  it("lets the purge delete history older than 10 years", async () => {
    const elevenYearsAgo = new Date()
    elevenYearsAgo.setUTCFullYear(elevenYearsAgo.getUTCFullYear() - 11)
    await prisma.auditLog.create({
      data: { userId: owner.id, action: "antigo", targetType: "user", targetId: null, requestId: null, createdAt: elevenYearsAgo },
    })
    await prisma.loginEvent.create({ data: { userId: owner.id, ip: "203.0.113.1", userAgent: "teste", createdAt: elevenYearsAgo } })

    const result = await purgeExpiredData()

    expect(result.deletedHistory).toBe(2)
    expect(await prisma.auditLog.count()).toBe(0)
  })
})
