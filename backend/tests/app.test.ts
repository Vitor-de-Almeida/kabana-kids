// Testes do esqueleto da API: saúde, erros e segurança.
import { afterAll, beforeAll, describe, expect, it } from "vitest"

import { startTestServer } from "./helpers.ts"

const FRONTEND_URL = "http://localhost:5173"

describe("app", () => {
  let server: Awaited<ReturnType<typeof startTestServer>>

  // Liga a API uma vez antes dos testes
  beforeAll(async () => {
    server = await startTestServer()
  })

  // Desliga a API ao final
  afterAll(async () => {
    await server.close()
  })

  // A API está no ar e responde
  it("responds to the health check", async () => {
    const response = await fetch(`${server.url}/up`)

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ status: "ok" })
  })

  // Rota inexistente: 404 em JSON, sem detalhes internos
  it("returns 404 in JSON for unknown routes", async () => {
    const response = await fetch(`${server.url}/api/v1/does-not-exist`)

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ message: "Não encontrado." })
  })

  // Cabeçalhos de segurança ativos e Express escondido
  it("sends security headers and hides the framework", async () => {
    const response = await fetch(`${server.url}/up`)

    expect(response.headers.get("x-content-type-options")).toBe("nosniff")
    expect(response.headers.get("x-powered-by")).toBeNull()
  })

  // CORS: só o nosso site pode chamar a API
  it("allows CORS only for the frontend address", async () => {
    const allowed = await fetch(`${server.url}/up`, { headers: { Origin: FRONTEND_URL } })
    const other = await fetch(`${server.url}/up`, { headers: { Origin: "https://site-estranho.example" } })

    expect(allowed.headers.get("access-control-allow-origin")).toBe(FRONTEND_URL)
    expect(other.headers.get("access-control-allow-origin")).not.toBe("https://site-estranho.example")
  })

  // JSON quebrado: mensagem própria, sem repetir o que veio
  it("answers malformed JSON with its own message", async () => {
    const response = await fetch(`${server.url}/api/v1/waitlist-entries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: '{"email": segredo',
    })
    const text = await response.text()

    expect(response.status).toBe(400)
    expect(text).not.toContain("segredo")
    expect(JSON.parse(text)).toEqual({
      message: "Não foi possível ler os dados enviados. Confira o formulário e tente de novo.",
    })
  })

  // O site consegue ler o ID da requisição (CORS)
  it("lets the frontend read the request id", async () => {
    const response = await fetch(`${server.url}/up`, { headers: { Origin: FRONTEND_URL } })

    expect(response.headers.get("access-control-expose-headers")).toBe("X-Request-Id")
  })

  // Rastreabilidade: ID próprio e novo em cada requisição
  it("gives each request its own id and ignores the client's", async () => {
    const first = await fetch(`${server.url}/up`, { headers: { "X-Request-Id": "inventado" } })
    const second = await fetch(`${server.url}/up`)

    const firstId = first.headers.get("x-request-id")
    expect(firstId).toMatch(/^[0-9a-f-]{36}$/)
    expect(firstId).not.toBe(second.headers.get("x-request-id"))
  })
})
