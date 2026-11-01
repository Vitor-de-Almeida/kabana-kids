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
})
