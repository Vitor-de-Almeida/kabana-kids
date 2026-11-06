// Testes de "Minha conta": troca de senha e ativação do 2FA.
import { afterAll, afterEach, beforeEach, describe, expect, it } from "vitest"

import { prisma } from "../../../../src/db.ts"
import { currentTotpStep, totpCodeAt } from "../../../../src/security/totp.ts"
import {
  FRONTEND_ORIGIN,
  TEST_PASSWORD,
  cleanDatabase,
  createTestUser,
  loginAs,
  startTestServer,
} from "../../../helpers.ts"

type ErrorBody = { message: string; errors: Record<string, string[]>; twoFactorRequired?: boolean }
type SetupBody = { data: { secret: string; setupUri: string } }

const NEW_PASSWORD = "Girassol#Azul88"

describe("account", () => {
  let server: Awaited<ReturnType<typeof startTestServer>>
  let cookie: string

  beforeEach(async () => {
    server = await startTestServer()
    await cleanDatabase()
    await createTestUser("admin")
    cookie = await loginAs(server.url, "admin@example.com")
  })

  afterEach(async () => {
    await server.close()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  function send(method: string, path: string, body?: unknown, headers: Record<string, string> = {}) {
    return fetch(`${server.url}/api/v1${path}`, {
      method,
      headers: { "Content-Type": "application/json", Origin: FRONTEND_ORIGIN, Cookie: cookie, ...headers },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  }

  function rawLogin(body: unknown) {
    return send("POST", "/sessions", body, { Cookie: "" })
  }

  describe("change password", () => {
    // Troca certa: a nova vale, a antiga não
    it("changes the password", async () => {
      const response = await send("PUT", "/me/password", { currentPassword: TEST_PASSWORD, newPassword: NEW_PASSWORD })

      expect(response.status).toBe(204)
      expect((await rawLogin({ email: "admin@example.com", password: NEW_PASSWORD })).status).toBe(201)
      expect((await rawLogin({ email: "admin@example.com", password: TEST_PASSWORD })).status).toBe(401)
    })

    // Outros aparelhos logados são desconectados
    it("signs out the other sessions", async () => {
      const otherCookie = await loginAs(server.url, "admin@example.com")

      await send("PUT", "/me/password", { currentPassword: TEST_PASSWORD, newPassword: NEW_PASSWORD })

      const other = await fetch(`${server.url}/api/v1/me`, { headers: { Cookie: otherCookie } })
      const current = await fetch(`${server.url}/api/v1/me`, { headers: { Cookie: cookie } })
      expect(other.status).toBe(401)
      expect(current.status).toBe(200)
    })

    // Senha atual errada: 422 no campo certo
    it("rejects a wrong current password", async () => {
      const response = await send("PUT", "/me/password", { currentPassword: "Errada#Senha99", newPassword: NEW_PASSWORD })
      const body = (await response.json()) as ErrorBody

      expect(response.status).toBe(422)
      expect(body.errors.currentPassword).toEqual(["A senha atual está incorreta."])
    })

    // Cada regra da senha tem a sua mensagem
    it("explains each password rule", async () => {
      const cases: [string, string][] = [
        ["Ab1!", "A senha precisa ter pelo menos 10 caracteres."],
        ["girassol#azul88", "A senha precisa ter pelo menos uma letra maiúscula."],
        ["GIRASSOL#AZUL88", "A senha precisa ter pelo menos uma letra minúscula."],
        ["Girassol#Azul", "A senha precisa ter pelo menos um número."],
        ["GirassolAzul88", "A senha precisa ter pelo menos um caractere especial, como ! @ # ou %."],
      ]

      for (const [newPassword, message] of cases) {
        const response = await send("PUT", "/me/password", { currentPassword: TEST_PASSWORD, newPassword })
        const body = (await response.json()) as ErrorBody
        expect(body.errors.newPassword).toContain(message)
      }
    })

    // Parecida com a atual: recusada
    it("rejects a password similar to the current one", async () => {
      const response = await send("PUT", "/me/password", { currentPassword: TEST_PASSWORD, newPassword: "Senha-de-Teste-124" })
      const body = (await response.json()) as ErrorBody

      expect(response.status).toBe(422)
      expect(body.errors.newPassword).toEqual(["A nova senha é parecida demais com a atual. Escolha uma bem diferente."])
    })

    // Sem login: 401
    it("asks for login", async () => {
      const response = await send("PUT", "/me/password", { currentPassword: TEST_PASSWORD, newPassword: NEW_PASSWORD }, { Cookie: "" })

      expect(response.status).toBe(401)
    })

    // Vindo de outro site: 403
    it("rejects a change from another site", async () => {
      const body = { currentPassword: TEST_PASSWORD, newPassword: NEW_PASSWORD }

      const response = await send("PUT", "/me/password", body, { Origin: "https://evil.example" })

      expect(response.status).toBe(403)
    })
  })

  describe("two-factor", () => {
    async function startSetup(): Promise<string> {
      const response = await send("POST", "/me/two-factor")
      return ((await response.json()) as SetupBody).data.secret
    }

    // Início: devolve o segredo e o endereço para o app, sem cache
    it("starts the setup with a secret for the app", async () => {
      const response = await send("POST", "/me/two-factor")
      const body = (await response.json()) as SetupBody

      expect(response.status).toBe(201)
      expect(response.headers.get("cache-control")).toBe("no-store")
      expect(body.data.secret).toMatch(/^[A-Z2-7]{32}$/)
      expect(body.data.setupUri).toContain("otpauth://totp/")
    })

    // O banco guarda o segredo criptografado
    it("stores the secret encrypted", async () => {
      const secret = await startSetup()

      const user = await prisma.user.findUniqueOrThrow({ where: { email: "admin@example.com" } })
      expect(user.twoFactorSecret).not.toContain(secret)
      expect(user.twoFactorEnabledAt).toBeNull()
    })

    // Código certo: o 2FA liga
    it("enables two-factor with a valid code", async () => {
      const secret = await startSetup()

      const response = await send("POST", "/me/two-factor/confirm", { code: totpCodeAt(secret, currentTotpStep()) })

      expect(response.status).toBe(204)
      const me = (await (await send("GET", "/me")).json()) as { data: { twoFactorEnabled: boolean } }
      expect(me.data.twoFactorEnabled).toBe(true)
    })

    // Código errado: o 2FA continua desligado
    it("rejects a wrong code", async () => {
      await startSetup()

      const response = await send("POST", "/me/two-factor/confirm", { code: "000000" })

      expect(response.status).toBe(422)
      const user = await prisma.user.findUniqueOrThrow({ where: { email: "admin@example.com" } })
      expect(user.twoFactorEnabledAt).toBeNull()
    })

    // Já ativo: não dá para trocar pelo site
    it("refuses to restart the setup once enabled", async () => {
      const secret = await startSetup()
      await send("POST", "/me/two-factor/confirm", { code: totpCodeAt(secret, currentTotpStep()) })

      const response = await send("POST", "/me/two-factor")

      expect(response.status).toBe(409)
    })

    // Depois de ligado, o login pede o código
    it("requires the code to log in once enabled", async () => {
      const secret = await startSetup()
      // Um passo fixo: o teste não depende da virada dos 30 s
      const step = currentTotpStep()
      await send("POST", "/me/two-factor/confirm", { code: totpCodeAt(secret, step) })
      const credentials = { email: "admin@example.com", password: TEST_PASSWORD }

      const withoutCode = await rawLogin(credentials)
      const wrongCode = await rawLogin({ ...credentials, code: "000000" })
      const reusedCode = await rawLogin({ ...credentials, code: totpCodeAt(secret, step) })
      const nextCode = await rawLogin({ ...credentials, code: totpCodeAt(secret, step + 1) })

      expect(withoutCode.status).toBe(401)
      expect(((await withoutCode.json()) as ErrorBody).twoFactorRequired).toBe(true)
      expect(wrongCode.status).toBe(401)
      expect(reusedCode.status).toBe(401)
      expect(nextCode.status).toBe(201)
    })

    // Senha errada com 2FA: mesma mensagem genérica
    it("does not ask for the code when the password is wrong", async () => {
      const secret = await startSetup()
      await send("POST", "/me/two-factor/confirm", { code: totpCodeAt(secret, currentTotpStep()) })

      const response = await rawLogin({ email: "admin@example.com", password: "Errada#Senha99" })

      expect(response.status).toBe(401)
      expect(await response.json()).toEqual({ message: "E-mail ou senha inválidos." })
    })
  })
})
