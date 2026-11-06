// Testes do painel da escola: listar e anonimizar cadastros.
import { afterAll, afterEach, beforeEach, describe, expect, it } from "vitest"

import { prisma } from "../../../../src/db.ts"
import {
  FRONTEND_ORIGIN,
  cleanDatabase,
  createTestUser,
  enableTestTwoFactor,
  loginAs,
  startTestServer,
  testTwoFactorCode,
} from "../../../helpers.ts"

// Dados fictícios
function createEntry(childName = "Manu") {
  return prisma.waitlistEntry.create({
    data: {
      guardianName: "Ana Almeida",
      email: "ana@example.com",
      phone: "(11) 90000-0000",
      childName,
      childBirthDate: new Date("2024-03-10"),
      desiredClassroom: "toddler",
      consentedAt: new Date(),
      privacyPolicyVersion: "rascunho",
    },
  })
}

type ListBody = { data: Record<string, string>[]; meta: Record<string, number> }

describe("school waitlist entries", () => {
  let server: Awaited<ReturnType<typeof startTestServer>>

  beforeEach(async () => {
    server = await startTestServer()
    await cleanDatabase()
    const admin = await createTestUser("admin")
    await enableTestTwoFactor(admin.id)
    await createTestUser("teacher")
  })

  function loginAsAdmin(): Promise<string> {
    return loginAs(server.url, "admin@example.com", testTwoFactorCode())
  }

  afterEach(async () => {
    await server.close()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  function list(cookie?: string, query = ""): Promise<Response> {
    return fetch(`${server.url}/api/v1/waitlist-entries${query}`, { headers: cookie ? { Cookie: cookie } : {} })
  }

  function anonymize(id: string, cookie?: string): Promise<Response> {
    return fetch(`${server.url}/api/v1/waitlist-entries/${id}`, {
      method: "DELETE",
      headers: { Origin: FRONTEND_ORIGIN, ...(cookie ? { Cookie: cookie } : {}) },
    })
  }

  // Sem login: 401
  it("asks for login to list entries", async () => {
    const response = await list()

    expect(response.status).toBe(401)
  })

  // Professor não vê os cadastros
  it("blocks a teacher from listing entries", async () => {
    const cookie = await loginAs(server.url, "teacher@example.com")

    const response = await list(cookie)

    expect(response.status).toBe(403)
  })

  // Admin sem 2FA ativo não vê dados de crianças
  it("blocks an admin without two-factor from listing", async () => {
    await prisma.user.update({ where: { email: "admin@example.com" }, data: { twoFactorEnabledAt: null } })
    const cookie = await loginAs(server.url, "admin@example.com")

    const response = await list(cookie)

    expect(response.status).toBe(403)
    expect(await response.json()).toMatchObject({ twoFactorSetupRequired: true })
  })

  // Gerente com 2FA também vê os cadastros
  it("lets a manager with two-factor list entries", async () => {
    const manager = await createTestUser("manager")
    await enableTestTwoFactor(manager.id)
    const cookie = await loginAs(server.url, "manager@example.com", testTwoFactorCode())

    const response = await list(cookie)

    expect(response.status).toBe(200)
  })

  // Gerente sem 2FA: bloqueado desde o primeiro acesso
  it("blocks a manager without two-factor from the first login", async () => {
    await createTestUser("manager")
    const cookie = await loginAs(server.url, "manager@example.com")

    const response = await list(cookie)

    expect(response.status).toBe(403)
  })

  // Admin vê os cadastros, paginados
  it("lists entries for an admin with pagination", async () => {
    await createEntry()
    const cookie = await loginAsAdmin()

    const response = await list(cookie)
    const body = (await response.json()) as ListBody

    expect(response.status).toBe(200)
    expect(body.meta).toEqual({ page: 1, perPage: 20, total: 1 })
    expect(body.data[0]).toMatchObject({ childName: "Manu", childBirthDate: "2024-03-10", desiredClassroom: "toddler" })
  })

  // Ver em lote gera auditoria, sem dados pessoais
  it("records an audit entry when listing", async () => {
    await createEntry()
    const cookie = await loginAsAdmin()

    const response = await list(cookie)

    const audit = await prisma.auditLog.findFirstOrThrow()
    expect(audit).toMatchObject({ action: "waitlist_entry.listed", targetId: null })
    expect(audit.requestId).toBe(response.headers.get("x-request-id"))
    expect(JSON.stringify(audit)).not.toContain("Manu")
  })

  // Página inválida: 422
  it("returns 422 for an invalid page", async () => {
    const cookie = await loginAsAdmin()

    const response = await list(cookie, "?page=0")

    expect(response.status).toBe(422)
  })

  // Exclusão a pedido: some os dados, fica o consentimento
  it("anonymizes an entry and keeps the consent proof", async () => {
    const entry = await createEntry()
    const cookie = await loginAsAdmin()

    const response = await anonymize(entry.id, cookie)

    expect(response.status).toBe(204)
    const saved = await prisma.waitlistEntry.findUniqueOrThrow({ where: { id: entry.id } })
    expect(saved).toMatchObject({ guardianName: null, email: null, phone: null, childName: null, message: null })
    expect(saved.childBirthDate).toBeNull()
    expect(saved.anonymizedAt).not.toBeNull()
    expect(saved.consentedAt).toEqual(entry.consentedAt)
    const audit = await prisma.auditLog.findFirstOrThrow({ where: { action: "waitlist_entry.anonymized" } })
    expect(audit.targetId).toBe(entry.id)
  })

  // Anonimizado não aparece mais na lista
  it("hides anonymized entries from the list", async () => {
    const entry = await createEntry()
    await createEntry("Theo")
    const cookie = await loginAsAdmin()

    await anonymize(entry.id, cookie)
    const body = (await (await list(cookie)).json()) as ListBody

    expect(body.meta.total).toBe(1)
    expect(body.data[0]?.childName).toBe("Theo")
  })

  // Cadastro inexistente ou já anonimizado: 404
  it("returns 404 for an unknown or already anonymized entry", async () => {
    const entry = await createEntry()
    const cookie = await loginAsAdmin()
    await anonymize(entry.id, cookie)

    const again = await anonymize(entry.id, cookie)
    const unknown = await anonymize("01ARZ3NDEKTSV4RRFFQ69G5FAV", cookie)

    expect(again.status).toBe(404)
    expect(unknown.status).toBe(404)
  })

  // Professor não exclui cadastros
  it("blocks a teacher from anonymizing", async () => {
    const entry = await createEntry()
    const cookie = await loginAs(server.url, "teacher@example.com")

    const response = await anonymize(entry.id, cookie)

    expect(response.status).toBe(403)
    expect((await prisma.waitlistEntry.findUniqueOrThrow({ where: { id: entry.id } })).childName).toBe("Manu")
  })

  // Exclusão vinda de outro site é recusada
  it("rejects an anonymization from another site", async () => {
    const entry = await createEntry()
    const cookie = await loginAsAdmin()

    const response = await fetch(`${server.url}/api/v1/waitlist-entries/${entry.id}`, {
      method: "DELETE",
      headers: { Cookie: cookie, Origin: "https://evil.example" },
    })

    expect(response.status).toBe(403)
  })

  // ID em formato errado: 422
  it("returns 422 for a malformed id", async () => {
    const cookie = await loginAsAdmin()

    const response = await anonymize("nao-e-um-id", cookie)

    expect(response.status).toBe(422)
  })
})
