// Testes da aba Equipe: criar contas, enviar links de senha e permissões.
import { afterAll, afterEach, beforeEach, describe, expect, it } from "vitest"

import { createV1Router } from "../../../../src/routes/v1.ts"
import { prisma } from "../../../../src/db.ts"
import type { User } from "../../../../src/generated/prisma/client.ts"
import {
  FRONTEND_ORIGIN,
  TEST_PASSWORD,
  cleanDatabase,
  createTestUser,
  enableTestTwoFactor,
  loginAs,
  mailsTo,
  startTestServer,
  testTwoFactorCode,
  tokenFromMail,
  waitForMail,
} from "../../../helpers.ts"

type Body = { data: Record<string, unknown>; message: string }

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

  function post(path: string, body: unknown) {
    return fetch(`${server.url}/api/v1${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: FRONTEND_ORIGIN },
      body: JSON.stringify(body),
    })
  }

  const loginOwner = () => loginAs(server.url, "admin@example.com", testTwoFactorCode())
  const loginManager = () => loginAs(server.url, "manager@example.com", testTwoFactorCode())
  const loginTeacher = () => loginAs(server.url, "teacher@example.com")

  async function createMember(role: string, email = "nova@example.com") {
    const response = await send(await loginOwner(), "POST", "/users", { name: "Nova Pessoa", email, role })
    return { response, text: await response.text() }
  }

  describe("creating accounts", () => {
    // Dono cria a conta; a pessoa recebe um convite por e-mail
    it("lets the owner create an account and emails an invite", async () => {
      const { response, text } = await createMember("manager")

      expect(response.status).toBe(201)
      expect((JSON.parse(text) as Body).data).toMatchObject({ role: "manager", mustChangePassword: true, isOwner: false })
      const mail = await waitForMail("nova@example.com")
      expect(mail.subject).toBe("Crie a sua senha - Kabana Kids")
    })

    // Ninguém vê senha: a resposta não traz senha nem link
    it("never shows a password or the link to the owner", async () => {
      const { text } = await createMember("teacher")

      const token = tokenFromMail(await waitForMail("nova@example.com"))
      const fields = Object.keys((JSON.parse(text) as Body).data)
      expect(fields).not.toContain("password")
      expect(fields).not.toContain("temporaryPassword")
      expect(text).not.toContain(token)
    })

    // O convite cria a senha, e a pessoa entra com ela
    it("lets the invited person create a password and log in", async () => {
      await createMember("teacher")
      const token = tokenFromMail(await waitForMail("nova@example.com"))

      const created = await post("/password-resets", { token, newPassword: NEW_PASSWORD })
      const login = await post("/sessions", { email: "nova@example.com", password: NEW_PASSWORD })

      expect(created.status).toBe(204)
      expect(login.status).toBe(201)
      expect(((await login.json()) as Body).data.mustChangePassword).toBe(false)
    })

    // A criação fica na auditoria
    it("audits the creation", async () => {
      const { text } = await createMember("teacher")

      const audit = await prisma.auditLog.findFirstOrThrow({ where: { action: "user.created" } })
      expect(audit).toMatchObject({ userId: owner.id, targetId: (JSON.parse(text) as Body).data.id, origin: "panel" })
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

  describe("sending reset links", () => {
    const resetLink = (cookie: string, id: string) => send(cookie, "POST", `/users/${id}/password-reset-link`)

    // Dono manda o link ao gerente: sessões caem, 2FA fica
    it("lets the owner send a link to a manager and keeps two-factor", async () => {
      const managerCookie = await loginManager()

      const response = await resetLink(await loginOwner(), manager.id)

      expect(response.status).toBe(202)
      expect(await response.text()).not.toMatch(/#token=/)
      expect((await send(managerCookie, "GET", "/me")).status).toBe(401)
      await waitForMail("manager@example.com")
      const saved = await prisma.user.findUniqueOrThrow({ where: { id: manager.id } })
      expect(saved.twoFactorEnabledAt).not.toBeNull()
      expect(saved.role).toBe("manager")
    })

    // Até usar o link, a senha antiga continua valendo
    it("keeps the old password until the link is used", async () => {
      await resetLink(await loginOwner(), teacher.id)

      const login = await post("/sessions", { email: "teacher@example.com", password: TEST_PASSWORD })

      expect(login.status).toBe(201)
    })

    // Gerente manda link a professor e pais
    it("lets a manager send links to teachers and parents", async () => {
      const parent = await createTestUser("parent")
      const cookie = await loginManager()

      const teacherLink = await resetLink(cookie, teacher.id)
      const parentLink = await resetLink(cookie, parent.id)

      expect(teacherLink.status).toBe(202)
      expect(parentLink.status).toBe(202)
    })

    // Gerente não mexe em outro gerente nem no dono
    it("blocks a manager from resetting another manager or the owner", async () => {
      const otherManager = await createTestUser("manager", "gerente2@example.com")
      const cookie = await loginManager()

      const managerLink = await resetLink(cookie, otherManager.id)
      const ownerLink = await resetLink(cookie, owner.id)

      expect(managerLink.status).toBe(403)
      expect(ownerLink.status).toBe(403)
      expect(await mailsTo("gerente2@example.com")).toHaveLength(0)
    })

    // Professor não manda link para ninguém
    it("blocks a teacher from sending links", async () => {
      const parent = await createTestUser("parent")

      const response = await resetLink(await loginTeacher(), parent.id)

      expect(response.status).toBe(403)
    })

    // Nem o dono recupera a própria conta pelo site
    it("offers no web route to recover the owner account", async () => {
      const response = await resetLink(await loginOwner(), owner.id)

      const paths = createV1Router()
        .stack.map((layer) => (layer.route as { path?: string } | undefined)?.path ?? "")
        .join(" ")
      expect(response.status).toBe(403)
      expect(paths).not.toMatch(/recover|reset-access/)
    })

    // O envio fica na auditoria
    it("audits the link", async () => {
      await resetLink(await loginOwner(), teacher.id)

      const audit = await prisma.auditLog.findFirstOrThrow({ where: { action: "user.password_reset_link_sent" } })
      expect(audit).toMatchObject({ userId: owner.id, targetId: teacher.id })
    })

    // Conta inexistente: 404
    it("returns 404 for an unknown account", async () => {
      const response = await resetLink(await loginOwner(), "01ARZ3NDEKTSV4RRFFQ69G5FAV")

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
