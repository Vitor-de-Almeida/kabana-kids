// Testes da aba Equipe: criar contas, redefinir senhas e permissões.
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { createV1Router } from "../../../../src/routes/v1.ts"
import { prisma } from "../../../../src/db.ts"
import type { User } from "../../../../src/generated/prisma/client.ts"
import { passwordSchema } from "../../../../src/schemas/users/passwordSchema.ts"
import {
  FRONTEND_ORIGIN,
  TEST_PASSWORD,
  cleanDatabase,
  createTestUser,
  enableTestTwoFactor,
  loginAs,
  startTestServer,
  testTwoFactorCode,
} from "../../../helpers.ts"

type Body = {
  data: { temporaryPassword: string; user: Record<string, unknown> } & Record<string, unknown>
  message: string
  passwordChangeRequired?: boolean
}

const NEW_PASSWORD = "Girassol#Azul88"

describe("team", () => {
  let server: Awaited<ReturnType<typeof startTestServer>>
  let owner: User
  let manager: User
  let teacher: User

  beforeEach(async () => {
    server = await startTestServer()
    await cleanDatabase()
    owner = await createTestUser("admin")
    manager = await createTestUser("manager")
    teacher = await createTestUser("teacher")
    await enableTestTwoFactor(owner.id)
    await enableTestTwoFactor(manager.id)
  })

  afterEach(async () => {
    vi.restoreAllMocks()
    await server.close()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  function send(cookie: string, method: string, path: string, body?: unknown) {
    return fetch(`${server.url}/api/v1${path}`, {
      method,
      headers: { "Content-Type": "application/json", Origin: FRONTEND_ORIGIN, Cookie: cookie },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  }

  function login(email: string, password: string, code?: string) {
    return fetch(`${server.url}/api/v1/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: FRONTEND_ORIGIN },
      body: JSON.stringify({ email, password, code }),
    })
  }

  const loginOwner = () => loginAs(server.url, "admin@example.com", testTwoFactorCode())
  const loginManager = () => loginAs(server.url, "manager@example.com", testTwoFactorCode())
  const loginTeacher = () => loginAs(server.url, "teacher@example.com")

  async function createMember(role: string, email = "nova@example.com") {
    const response = await send(await loginOwner(), "POST", "/users", { name: "Nova Pessoa", email, role })
    return { response, body: (await response.json()) as Body }
  }

  describe("creating accounts", () => {
    // Dono cria gerente: senha temporária forte, sem cache
    it("lets the owner create a manager with a temporary password", async () => {
      const { response, body } = await createMember("manager")

      expect(response.status).toBe(201)
      expect(response.headers.get("cache-control")).toBe("no-store")
      expect(passwordSchema.safeParse(body.data.temporaryPassword).success).toBe(true)
      expect(body.data.user).toMatchObject({ role: "manager", mustChangePassword: true, isOwner: false })
    })

    // A auditoria registra, sem a senha
    it("audits the creation without the password", async () => {
      const { body } = await createMember("teacher")

      const audit = await prisma.auditLog.findFirstOrThrow({ where: { action: "user.created" } })
      expect(audit).toMatchObject({ userId: owner.id, targetId: body.data.user.id, origin: "panel", result: "success" })
      expect(JSON.stringify(audit)).not.toContain(body.data.temporaryPassword)
    })

    // Nenhum log mostra a senha temporária
    it("never writes the temporary password to the logs", async () => {
      const logSpy = vi.spyOn(console, "log")

      const { body } = await createMember("teacher")

      const logs = logSpy.mock.calls.map((call) => String(call[0])).join("\n")
      expect(logs).not.toContain(body.data.temporaryPassword)
    })

    // Ninguém cria um segundo admin (dono)
    it("refuses to create another admin", async () => {
      const { response } = await createMember("admin")

      expect(response.status).toBe(422)
      expect(await prisma.user.count({ where: { role: "admin" } })).toBe(1)
    })

    // Gerente e professor não criam contas
    it("blocks managers and teachers from creating accounts", async () => {
      const byManager = await send(await loginManager(), "POST", "/users", { name: "X Y", email: "x@example.com", role: "teacher" })
      const byTeacher = await send(await loginTeacher(), "POST", "/users", { name: "X Y", email: "x@example.com", role: "teacher" })

      expect(byManager.status).toBe(403)
      expect(byTeacher.status).toBe(403)
    })

    // E-mail repetido: 422
    it("rejects an email that already has an account", async () => {
      const { response } = await createMember("teacher", "teacher@example.com")

      expect(response.status).toBe(422)
    })
  })

  describe("temporary password", () => {
    // Primeiro login: só dá para trocar a senha
    it("forces a password change on the first login", async () => {
      const { body } = await createMember("teacher")
      const temporary = body.data.temporaryPassword

      const first = await login("nova@example.com", temporary)
      const cookie = (first.headers.get("set-cookie") ?? "").split(";")[0] ?? ""
      const blocked = await send(cookie, "GET", "/me/logins")
      const changed = await send(cookie, "PUT", "/me/password", { currentPassword: temporary, newPassword: NEW_PASSWORD })
      const allowed = await send(cookie, "GET", "/me/logins")

      expect(first.status).toBe(201)
      expect(blocked.status).toBe(403)
      expect(((await blocked.json()) as Body).passwordChangeRequired).toBe(true)
      expect(changed.status).toBe(204)
      expect(allowed.status).toBe(200)
    })

    // Vale uma vez só
    it("works only once", async () => {
      const { body } = await createMember("teacher")

      const first = await login("nova@example.com", body.data.temporaryPassword)
      const second = await login("nova@example.com", body.data.temporaryPassword)

      expect(first.status).toBe(201)
      expect(second.status).toBe(401)
    })

    // Vence em 24 horas
    it("expires after 24 hours", async () => {
      const { body } = await createMember("teacher")
      await prisma.user.update({
        where: { email: "nova@example.com" },
        data: { temporaryPasswordExpiresAt: new Date(Date.now() - 1000) },
      })

      const response = await login("nova@example.com", body.data.temporaryPassword)

      expect(response.status).toBe(401)
    })
  })

  describe("resetting passwords", () => {
    // Dono redefine a senha do gerente: sessões caem, 2FA fica
    it("lets the owner reset a manager and keeps two-factor", async () => {
      const managerCookie = await loginManager()

      const response = await send(await loginOwner(), "POST", `/users/${manager.id}/password-reset`)

      expect(response.status).toBe(201)
      expect((await send(managerCookie, "GET", "/me")).status).toBe(401)
      const saved = await prisma.user.findUniqueOrThrow({ where: { id: manager.id } })
      expect(saved.twoFactorEnabledAt).not.toBeNull()
      expect(saved.role).toBe("manager")
      expect(saved.mustChangePassword).toBe(true)
    })

    // Gerente redefine professor e pais
    it("lets a manager reset teachers and parents", async () => {
      const parent = await createTestUser("parent")
      const cookie = await loginManager()

      const teacherReset = await send(cookie, "POST", `/users/${teacher.id}/password-reset`)
      const parentReset = await send(cookie, "POST", `/users/${parent.id}/password-reset`)

      expect(teacherReset.status).toBe(201)
      expect(parentReset.status).toBe(201)
    })

    // Gerente não mexe em outro gerente nem no dono
    it("blocks a manager from resetting another manager or the owner", async () => {
      const otherManager = await createTestUser("manager", "gerente2@example.com")
      const cookie = await loginManager()

      const managerReset = await send(cookie, "POST", `/users/${otherManager.id}/password-reset`)
      const ownerReset = await send(cookie, "POST", `/users/${owner.id}/password-reset`)

      expect(managerReset.status).toBe(403)
      expect(ownerReset.status).toBe(403)
    })

    // Professor não redefine senhas de ninguém
    it("blocks a teacher from resetting passwords", async () => {
      const parent = await createTestUser("parent")

      const response = await send(await loginTeacher(), "POST", `/users/${parent.id}/password-reset`)

      expect(response.status).toBe(403)
    })

    // Nem o dono recupera a própria conta pelo site
    it("offers no web route to recover the owner account", async () => {
      const response = await send(await loginOwner(), "POST", `/users/${owner.id}/password-reset`)

      const paths = createV1Router()
        .stack.map((layer) => (layer.route as { path?: string } | undefined)?.path ?? "")
        .join(" ")
      expect(response.status).toBe(403)
      expect(paths).not.toMatch(/recover|reset-access/)
    })

    // A redefinição fica na auditoria
    it("audits the reset", async () => {
      await send(await loginOwner(), "POST", `/users/${teacher.id}/password-reset`)

      const audit = await prisma.auditLog.findFirstOrThrow({ where: { action: "user.password_reset" } })
      expect(audit).toMatchObject({ userId: owner.id, targetId: teacher.id })
    })

    // Conta inexistente: 404
    it("returns 404 for an unknown account", async () => {
      const response = await send(await loginOwner(), "POST", "/users/01ARZ3NDEKTSV4RRFFQ69G5FAV/password-reset")

      expect(response.status).toBe(404)
    })
  })

  describe("login trail and two-factor deadline", () => {
    // Cada login guarda IP e navegador
    it("records the ip and browser of each login", async () => {
      const response = await fetch(`${server.url}/api/v1/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Origin: FRONTEND_ORIGIN, "User-Agent": "NavegadorDeTeste/1.0" },
        body: JSON.stringify({ email: "teacher@example.com", password: TEST_PASSWORD }),
      })
      const cookie = (response.headers.get("set-cookie") ?? "").split(";")[0] ?? ""

      const logins = (await (await send(cookie, "GET", "/me/logins")).json()) as { data: Record<string, string>[] }

      expect(logins.data[0]).toMatchObject({ userAgent: "NavegadorDeTeste/1.0" })
      expect(logins.data[0]?.ip).toBeTruthy()
    })

    // Professor: 3 logins livres; no 4º, o 2FA vira obrigatório
    it("requires two-factor for a teacher from the fourth login", async () => {
      const required: boolean[] = []
      for (let attempt = 1; attempt <= 4; attempt++) {
        const me = await send(await loginTeacher(), "GET", "/me")
        required.push(((await me.json()) as { data: { twoFactorSetupRequired: boolean } }).data.twoFactorSetupRequired)
      }

      expect(required).toEqual([false, false, false, true])
    })
  })
})
