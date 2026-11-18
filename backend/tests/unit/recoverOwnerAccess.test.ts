// Testes da recuperação do dono pelo terminal (npm run user:reset-access).
import { afterAll, afterEach, beforeEach, describe, expect, it } from "vitest"

import {
  findOwnerByEmail,
  recordDeniedRecovery,
  recoverOwnerAccess,
} from "../../src/actions/users/recoverOwnerAccess.ts"
import { prisma } from "../../src/db.ts"
import type { User } from "../../src/generated/prisma/client.ts"
import { FRONTEND_ORIGIN, cleanDatabase, createTestUser, enableTestTwoFactor, startTestServer } from "../helpers.ts"

describe("recoverOwnerAccess", () => {
  let server: Awaited<ReturnType<typeof startTestServer>>
  let owner: User

  beforeEach(async () => {
    server = await startTestServer()
    await cleanDatabase()
    owner = await createTestUser("admin")
    await enableTestTwoFactor(owner.id)
  })

  afterEach(async () => {
    await server.close()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  function login(password: string) {
    return fetch(`${server.url}/api/v1/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: FRONTEND_ORIGIN },
      body: JSON.stringify({ email: "admin@example.com", password }),
    })
  }

  // Só aceita o dono
  it("accepts only the owner", async () => {
    const manager = await createTestUser("manager")

    expect((await findOwnerByEmail(" ADMIN@example.com ")).kind).toBe("found")
    expect((await findOwnerByEmail("manager@example.com")).kind).toBe("not_owner")
    expect((await findOwnerByEmail("ninguem@example.com")).kind).toBe("not_found")
    await expect(recoverOwnerAccess(manager, "terminal:teste")).rejects.toThrow()
  })

  // Senha temporária de uso único, 2FA desligado, sessões encerradas
  it("resets the password, turns off two-factor and ends sessions", async () => {
    await prisma.session.create({
      data: { userId: owner.id, tokenHash: "c".repeat(64), expiresAt: new Date(Date.now() + 60_000), lastUsedAt: new Date() },
    })

    const temporary = await recoverOwnerAccess(owner, "terminal:teste")

    const saved = await prisma.user.findUniqueOrThrow({ where: { id: owner.id } })
    expect(saved).toMatchObject({ role: "admin", isOwner: true, mustChangePassword: true, twoFactorSecret: null })
    expect(saved.twoFactorEnabledAt).toBeNull()
    expect(await prisma.session.count()).toBe(0)
    expect((await login(temporary)).status).toBe(201)
    expect((await login(temporary)).status).toBe(401)
  })

  // Com a senha temporária, só dá para criar uma senha nova
  it("forces a new password before anything else", async () => {
    const temporary = await recoverOwnerAccess(owner, "terminal:teste")
    const cookie = ((await login(temporary)).headers.get("set-cookie") ?? "").split(";")[0] ?? ""
    const call = (method: string, path: string, body?: unknown) =>
      fetch(`${server.url}/api/v1${path}`, {
        method,
        headers: { "Content-Type": "application/json", Origin: FRONTEND_ORIGIN, Cookie: cookie },
        body: body === undefined ? undefined : JSON.stringify(body),
      })

    const blocked = await call("GET", "/me/logins")
    const changed = await call("PUT", "/me/password", { currentPassword: temporary, newPassword: "Girassol#Azul88" })
    const allowed = await call("GET", "/me/logins")

    expect(blocked.status).toBe(403)
    expect(changed.status).toBe(204)
    expect(allowed.status).toBe(200)
  })

  // A senha temporária vence em 24 horas
  it("expires the temporary password after 24 hours", async () => {
    const temporary = await recoverOwnerAccess(owner, "terminal:teste")
    await prisma.user.update({ where: { id: owner.id }, data: { temporaryPasswordExpiresAt: new Date(Date.now() - 1000) } })

    expect((await login(temporary)).status).toBe(401)
  })

  // Auditoria: origem terminal, sem senha
  it("audits the recovery as coming from the terminal", async () => {
    const temporary = await recoverOwnerAccess(owner, "terminal:teste")

    const audit = await prisma.auditLog.findFirstOrThrow({ where: { action: "user.access_recovery" } })
    expect(audit).toMatchObject({ userId: null, targetId: owner.id, origin: "terminal", operator: "terminal:teste", result: "success" })
    expect(JSON.stringify(audit)).not.toContain(temporary)
  })

  // Tentativa recusada também fica registrada
  it("audits a denied attempt", async () => {
    await recordDeniedRecovery(null, "terminal:teste")

    const audit = await prisma.auditLog.findFirstOrThrow()
    expect(audit).toMatchObject({ result: "denied", origin: "terminal" })
  })
})
