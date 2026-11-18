// Testes do link de senha por e-mail: "esqueci minha senha" e convite (D45).
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { prisma } from "../../../../src/db.ts"
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

const NEW_PASSWORD = "Girassol#Azul88"

describe("password resets", () => {
  let server: Awaited<ReturnType<typeof startTestServer>>

  beforeEach(async () => {
    server = await startTestServer()
    await cleanDatabase()
    await createTestUser("admin")
    await createTestUser("teacher")
  })

  afterEach(async () => {
    vi.restoreAllMocks()
    await server.close()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  function post(path: string, body: unknown, origin = FRONTEND_ORIGIN) {
    return fetch(`${server.url}/api/v1${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: origin },
      body: JSON.stringify(body),
    })
  }

  const requestReset = (email: string) => post("/password-reset-requests", { email })
  const completeReset = (token: string, newPassword = NEW_PASSWORD) => post("/password-resets", { token, newPassword })
  const login = (email: string, password: string, code?: string) => post("/sessions", { email, password, code })

  async function linkFor(email: string): Promise<string> {
    await requestReset(email)
    return tokenFromMail(await waitForMail(email))
  }

  // Mesma resposta para conta que existe, que não existe e para o dono
  it("answers the same way whether or not the account exists", async () => {
    const known = await requestReset("teacher@example.com")
    const unknown = await requestReset("ninguem@example.com")
    const owner = await requestReset("admin@example.com")

    const bodies = await Promise.all([known.json(), unknown.json(), owner.json()])
    expect([known.status, unknown.status, owner.status]).toEqual([202, 202, 202])
    expect(bodies[1]).toEqual(bodies[0])
    expect(bodies[2]).toEqual(bodies[0])
  })

  // Só a conta que existe recebe e-mail; o dono só pelo terminal
  it("emails only existing accounts and never the owner", async () => {
    await requestReset("teacher@example.com")
    await requestReset("admin@example.com")

    await waitForMail("teacher@example.com")
    expect(await mailsTo("admin@example.com")).toHaveLength(0)
  })

  // O link troca a senha e só vale uma vez
  it("resets the password with a single-use link", async () => {
    const token = await linkFor("teacher@example.com")

    const first = await completeReset(token)
    const second = await completeReset(token, "Outra#Senha2031")

    expect(first.status).toBe(204)
    expect(second.status).toBe(422)
    expect((await login("teacher@example.com", NEW_PASSWORD)).status).toBe(201)
    expect((await login("teacher@example.com", TEST_PASSWORD)).status).toBe(401)
  })

  // Link vencido não funciona
  it("rejects an expired link", async () => {
    const token = await linkFor("teacher@example.com")
    await prisma.passwordResetToken.updateMany({ data: { expiresAt: new Date(Date.now() - 1000) } })

    const response = await completeReset(token)

    expect(response.status).toBe(422)
  })

  // Pedir de novo cancela o link anterior
  it("cancels the previous link when a new one is requested", async () => {
    const oldToken = await linkFor("teacher@example.com")
    await requestReset("teacher@example.com")
    await new Promise((resolve) => setTimeout(resolve, 100))

    const response = await completeReset(oldToken)

    expect(response.status).toBe(422)
  })

  // Ao redefinir, todas as sessões caem
  it("ends every session after the reset", async () => {
    const cookie = await loginAs(server.url, "teacher@example.com")
    const token = await linkFor("teacher@example.com")

    await completeReset(token)

    const me = await fetch(`${server.url}/api/v1/me`, { headers: { Cookie: cookie } })
    expect(me.status).toBe(401)
  })

  // O 2FA continua valendo depois da redefinição
  it("keeps two-factor after the reset", async () => {
    const teacher = await prisma.user.findUniqueOrThrow({ where: { email: "teacher@example.com" } })
    await enableTestTwoFactor(teacher.id)
    const token = await linkFor("teacher@example.com")

    await completeReset(token)

    expect((await login("teacher@example.com", NEW_PASSWORD)).status).toBe(401)
    expect((await login("teacher@example.com", NEW_PASSWORD, testTwoFactorCode())).status).toBe(201)
  })

  // A senha nova segue as regras da D32
  it("applies the password rules", async () => {
    const token = await linkFor("teacher@example.com")

    const response = await completeReset(token, "fraca")

    expect(response.status).toBe(422)
    expect((await login("teacher@example.com", TEST_PASSWORD)).status).toBe(201)
  })

  // O banco guarda só o hash, e o token nunca vai para o log
  it("stores only the token hash and never logs it", async () => {
    const logSpy = vi.spyOn(console, "log")

    const token = await linkFor("teacher@example.com")
    await completeReset(token)

    const saved = await prisma.passwordResetToken.findFirstOrThrow()
    expect(saved.tokenHash).not.toBe(token)
    expect(logSpy.mock.calls.map((call) => String(call[0])).join("\n")).not.toContain(token)
  })

  // O link usa "#", que o navegador não manda ao servidor
  it("puts the token after # in the link", async () => {
    await requestReset("teacher@example.com")

    const mail = await waitForMail("teacher@example.com")

    expect(mail.text).toContain(`${FRONTEND_ORIGIN}/redefinir-senha#token=`)
    expect(mail.text).not.toContain("?token=")
  })

  // Pedido e conclusão ficam na auditoria
  it("audits the request and the completion", async () => {
    const token = await linkFor("teacher@example.com")
    await completeReset(token)

    const actions = (await prisma.auditLog.findMany({ orderBy: { createdAt: "asc" } })).map((audit) => audit.action)
    expect(actions).toEqual(["user.password_reset_requested", "user.password_reset_completed"])
  })

  // Muitos pedidos para o mesmo e-mail: bloqueado
  it("limits requests for the same email", async () => {
    for (let attempt = 1; attempt <= 3; attempt++) {
      await requestReset("teacher@example.com")
    }

    const blocked = await requestReset("teacher@example.com")

    expect(blocked.status).toBe(429)
  })

  // Pedido vindo de outro site é recusado
  it("rejects a request from another site", async () => {
    const response = await post("/password-reset-requests", { email: "teacher@example.com" }, "https://evil.example")

    expect(response.status).toBe(403)
  })
})
