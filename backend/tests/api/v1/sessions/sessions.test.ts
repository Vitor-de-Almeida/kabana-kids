// Testes do login, logout e GET /api/v1/me.
import { afterAll, afterEach, beforeEach, describe, expect, it } from "vitest"

import { prisma } from "../../../../src/db.ts"
import {
  FRONTEND_ORIGIN,
  TEST_PASSWORD,
  cleanDatabase,
  createTestUser,
  loginAs,
  startTestServer,
} from "../../../helpers.ts"

type UserBody = { data: Record<string, string>; errors: Record<string, string[]>; message: string }

describe("sessions", () => {
  let server: Awaited<ReturnType<typeof startTestServer>>

  beforeEach(async () => {
    server = await startTestServer()
    await cleanDatabase()
    await createTestUser("admin")
  })

  afterEach(async () => {
    await server.close()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  function login(body: unknown, headers: Record<string, string> = {}): Promise<Response> {
    return fetch(`${server.url}/api/v1/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: FRONTEND_ORIGIN, ...headers },
      body: JSON.stringify(body),
    })
  }

  function me(cookie?: string): Promise<Response> {
    return fetch(`${server.url}/api/v1/me`, { headers: cookie ? { Cookie: cookie } : {} })
  }

  // Login certo: cookie protegido e usuário sem o hash
  it("logs in with a protected session cookie", async () => {
    const response = await login({ email: "admin@example.com", password: TEST_PASSWORD })
    const body = (await response.json()) as UserBody

    expect(response.status).toBe(201)
    const cookie = response.headers.get("set-cookie") ?? ""
    expect(cookie).toContain("HttpOnly")
    expect(cookie).toContain("SameSite=Lax")
    expect(cookie).not.toContain("Expires")
    expect(Object.keys(body.data).sort()).toEqual([
      "email",
      "id",
      "isOwner",
      "mustChangePassword",
      "name",
      "role",
      "twoFactorEnabled",
      "twoFactorSetupRequired",
    ])
  })

  // O banco guarda só o hash do token
  it("stores only the hash of the session token", async () => {
    const response = await login({ email: "admin@example.com", password: TEST_PASSWORD })
    const token = (response.headers.get("set-cookie") ?? "").split(";")[0]?.split("=")[1] ?? ""

    const session = await prisma.session.findFirstOrThrow()
    expect(token.length).toBeGreaterThan(30)
    expect(session.tokenHash).not.toBe(token)
  })

  // Senha errada e e-mail inexistente: a mesma resposta
  it("gives the same answer for a wrong password and an unknown email", async () => {
    const wrongPassword = await login({ email: "admin@example.com", password: "senha-errada-000" })
    const unknownEmail = await login({ email: "ninguem@example.com", password: TEST_PASSWORD })

    expect(wrongPassword.status).toBe(401)
    expect(unknownEmail.status).toBe(401)
    expect(await wrongPassword.json()).toEqual({ message: "E-mail ou senha inválidos." })
    expect(await unknownEmail.json()).toEqual({ message: "E-mail ou senha inválidos." })
  })

  // O e-mail não diferencia maiúsculas
  it("accepts the email in any letter case", async () => {
    const response = await login({ email: "  ADMIN@Example.com ", password: TEST_PASSWORD })

    expect(response.status).toBe(201)
  })

  // Campos vazios: 422 com o erro de cada campo
  it("returns 422 when fields are missing", async () => {
    const response = await login({})
    const body = (await response.json()) as UserBody

    expect(response.status).toBe(422)
    expect(Object.keys(body.errors).sort()).toEqual(["email", "password"])
  })

  // Rate limit: a 6ª tentativa no mesmo minuto é bloqueada
  it("blocks the sixth attempt in a minute", async () => {
    for (let attempt = 1; attempt <= 5; attempt++) {
      await login({ email: "admin@example.com", password: "senha-errada-000" })
    }

    const blocked = await login({ email: "admin@example.com", password: TEST_PASSWORD })

    expect(blocked.status).toBe(429)
  })

  // Penalidade crescente: cada tentativa bloqueada dobra a espera
  it("doubles the waiting time on each blocked attempt", async () => {
    for (let attempt = 1; attempt <= 5; attempt++) {
      await login({ email: "admin@example.com", password: "senha-errada-000" })
    }

    const waits: number[] = []
    for (let blocked = 1; blocked <= 3; blocked++) {
      const response = await login({ email: "admin@example.com", password: TEST_PASSWORD })
      expect(response.status).toBe(429)
      // O contador bloqueado é o de maior espera
      const row = await prisma.rateLimitHit.findFirstOrThrow({ orderBy: { resetAt: "desc" } })
      waits.push(Math.round((row.resetAt.getTime() - Date.now()) / 60_000))
    }

    expect(waits).toEqual([2, 4, 8])
  })

  // A mensagem diz quanto tempo esperar
  it("tells how long to wait", async () => {
    for (let attempt = 1; attempt <= 7; attempt++) {
      await login({ email: "admin@example.com", password: "senha-errada-000" })
    }

    const response = await login({ email: "admin@example.com", password: TEST_PASSWORD })
    const body = (await response.json()) as UserBody

    expect(body.message).toContain("Aguarde 8 minuto(s)")
  })

  // Mesmo aparelho testando vários e-mails: a 11ª tentativa é bloqueada
  it("blocks the eleventh attempt from one device across emails", async () => {
    for (let attempt = 1; attempt <= 10; attempt++) {
      await login({ email: `pessoa${attempt}@example.com`, password: "senha-errada-000" })
    }

    const blocked = await login({ email: "admin@example.com", password: TEST_PASSWORD })

    expect(blocked.status).toBe(429)
  })

  // CSRF: login vindo de outro site é recusado
  it("rejects a login from another site", async () => {
    const response = await login({ email: "admin@example.com", password: TEST_PASSWORD }, { Origin: "https://evil.example" })

    expect(response.status).toBe(403)
    expect(await prisma.session.count()).toBe(0)
  })

  // Sem cookie: 401
  it("returns 401 on /me without a session", async () => {
    const response = await me()

    expect(response.status).toBe(401)
  })

  // Com cookie: devolve quem está logado
  it("returns the logged user on /me", async () => {
    const cookie = await loginAs(server.url, "admin@example.com")

    const response = await me(cookie)
    const body = (await response.json()) as UserBody

    expect(response.status).toBe(200)
    expect(body.data).toMatchObject({ email: "admin@example.com", role: "admin" })
  })

  // Fixação de sessão: logar de novo invalida o token antigo
  it("revokes the previous session on a new login", async () => {
    const oldCookie = await loginAs(server.url, "admin@example.com")

    await login({ email: "admin@example.com", password: TEST_PASSWORD }, { Cookie: oldCookie })

    expect((await me(oldCookie)).status).toBe(401)
  })

  // Logout encerra a sessão de verdade
  it("revokes the session on logout", async () => {
    const cookie = await loginAs(server.url, "admin@example.com")

    const response = await fetch(`${server.url}/api/v1/sessions/current`, {
      method: "DELETE",
      headers: { Cookie: cookie, Origin: FRONTEND_ORIGIN },
    })

    expect(response.status).toBe(204)
    expect((await me(cookie)).status).toBe(401)
    expect(await prisma.session.count()).toBe(0)
  })

  // Logout vindo de outro site é recusado
  it("rejects a logout from another site", async () => {
    const cookie = await loginAs(server.url, "admin@example.com")

    const response = await fetch(`${server.url}/api/v1/sessions/current`, {
      method: "DELETE",
      headers: { Cookie: cookie, Origin: "https://evil.example" },
    })

    expect(response.status).toBe(403)
    expect((await me(cookie)).status).toBe(200)
  })

  // 60 minutos parado: a sessão expira
  it("expires an idle session after 60 minutes", async () => {
    const cookie = await loginAs(server.url, "admin@example.com")

    await prisma.session.updateMany({ data: { lastUsedAt: new Date(Date.now() - 61 * 60 * 1000) } })

    expect((await me(cookie)).status).toBe(401)
    expect(await prisma.session.count()).toBe(0)
  })

  // Prazo máximo vencido: a sessão expira
  it("expires a session past its maximum age", async () => {
    const cookie = await loginAs(server.url, "admin@example.com")

    await prisma.session.updateMany({ data: { expiresAt: new Date(Date.now() - 1000) } })

    expect((await me(cookie)).status).toBe(401)
  })

  // O contador fica no banco: reiniciar a API não zera
  it("keeps counting attempts after the server restarts", async () => {
    for (let attempt = 1; attempt <= 5; attempt++) {
      await login({ email: "admin@example.com", password: "senha-errada-000" })
    }

    await server.close()
    server = await startTestServer()
    const blocked = await login({ email: "admin@example.com", password: TEST_PASSWORD })

    expect(blocked.status).toBe(429)
    const saved = await prisma.rateLimitHit.findMany()
    expect(JSON.stringify(saved)).not.toContain("admin@example.com")
  })

  // Cookie inventado não dá acesso
  it("rejects a made-up session cookie", async () => {
    const response = await me("kabana_session=token-inventado")

    expect(response.status).toBe(401)
  })
})
