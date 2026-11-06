// Testes do POST /api/v1/waitlist-entries (formulário "Matrícula").
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { prisma } from "../../../../src/db.ts"
import { startTestServer } from "../../../helpers.ts"

type ApiBody = {
  data: Record<string, string>
  errors: Record<string, string[]>
  message: string
}

async function readBody(response: Response): Promise<ApiBody> {
  return (await response.json()) as ApiBody
}

function dateYearsAgo(years: number): string {
  const date = new Date()
  date.setUTCFullYear(date.getUTCFullYear() - years)
  return date.toISOString().slice(0, 10)
}

// Dados fictícios de um envio válido
function validEntry(): Record<string, unknown> {
  return {
    guardianName: "Ana Almeida",
    email: "ana@example.com",
    phone: "(11) 90000-0000",
    childName: "Manu",
    childBirthDate: dateYearsAgo(2),
    desiredClassroom: "toddler",
    message: "Horário da manhã",
    consent: true,
  }
}

describe("POST /api/v1/waitlist-entries", () => {
  let server: Awaited<ReturnType<typeof startTestServer>>

  // API nova (contador de tentativas zerado) e tabela limpa
  beforeEach(async () => {
    server = await startTestServer()
    await prisma.waitlistEntry.deleteMany()
  })

  afterEach(async () => {
    vi.restoreAllMocks()
    await server.close()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  function post(body: unknown): Promise<Response> {
    return fetch(`${server.url}/api/v1/waitlist-entries`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    })
  }

  // Sucesso: 201, só id, status e data na resposta
  it("creates an entry and returns only id, status and createdAt", async () => {
    const response = await post(validEntry())
    const body = await readBody(response)

    expect(response.status).toBe(201)
    expect(Object.keys(body.data).sort()).toEqual(["createdAt", "id", "status"])
    expect(body.data.status).toBe("pending")
    expect(body.data).not.toHaveProperty("childName")
    expect(body.data).not.toHaveProperty("email")
  })

  // Banco: todos os campos, incluindo turma e mensagem
  it("stores every field, the classroom and the message", async () => {
    const response = await post(validEntry())
    const { data } = await readBody(response)

    const saved = await prisma.waitlistEntry.findUniqueOrThrow({ where: { id: data.id } })
    expect(saved.guardianName).toBe("Ana Almeida")
    expect(saved.desiredClassroom).toBe("toddler")
    expect(saved.message).toBe("Horário da manhã")
  })

  // Consentimento: data e versão da política registradas
  it("records when consent was given and the policy version", async () => {
    const before = new Date()

    const response = await post(validEntry())
    const { data } = await readBody(response)

    const saved = await prisma.waitlistEntry.findUniqueOrThrow({ where: { id: data.id } })
    expect(saved.consentedAt.getTime()).toBeGreaterThanOrEqual(before.getTime() - 1000)
    expect(saved.privacyPolicyVersion).toBe("rascunho")
  })

  // Mensagem vazia vira nulo no banco
  it("stores an empty message as null", async () => {
    const response = await post({ ...validEntry(), message: "   " })
    const { data } = await readBody(response)

    const saved = await prisma.waitlistEntry.findUniqueOrThrow({ where: { id: data.id } })
    expect(saved.message).toBeNull()
  })

  // O cliente não escolhe o status
  it("ignores a status sent by the client", async () => {
    const response = await post({ ...validEntry(), status: "enrolled" })
    const { data } = await readBody(response)

    expect(data.status).toBe("pending")
  })

  // Validação: 422 com o erro de cada campo
  it("returns 422 with field errors when fields are missing", async () => {
    const response = await post({})
    const body = await readBody(response)

    expect(response.status).toBe(422)
    expect(Object.keys(body.errors).sort()).toEqual([
      "childBirthDate",
      "childName",
      "consent",
      "desiredClassroom",
      "email",
      "guardianName",
      "phone",
    ])
  })

  // Mensagem exata: diz a regra que falhou em cada campo
  it("explains exactly what is wrong in each field", async () => {
    const response = await post({ ...validEntry(), guardianName: "A", email: "ana", childName: "x".repeat(121) })
    const body = await readBody(response)

    expect(response.status).toBe(422)
    expect(body.errors.guardianName).toEqual(["O nome do responsável precisa ter pelo menos 2 letras."])
    expect(body.errors.email).toEqual(["Confira o e-mail: ele precisa ter o formato nome@provedor.com."])
    expect(body.errors.childName).toEqual(["O nome da criança pode ter no máximo 120 caracteres."])
  })

  // Campo vazio pede o dado, sem acumular outros erros
  it("asks for a missing field with a single message", async () => {
    const response = await post({ ...validEntry(), guardianName: "", email: undefined })
    const body = await readBody(response)

    expect(body.errors.guardianName).toEqual(["Informe o nome do responsável."])
    expect(body.errors.email).toEqual(["Informe o e-mail."])
  })

  // A mensagem nunca repete o valor enviado
  it("never echoes the submitted value in error messages", async () => {
    const response = await post({ ...validEntry(), email: "<script>ana</script>" })

    expect(await response.text()).not.toContain("<script>")
  })

  // Sem autorização da família, nada é guardado
  it("returns 422 when consent is not given", async () => {
    const response = await post({ ...validEntry(), consent: false })
    const body = await readBody(response)

    expect(response.status).toBe(422)
    expect(body.errors).toHaveProperty("consent")
    expect(await prisma.waitlistEntry.count()).toBe(0)
  })

  // Data de nascimento no futuro ou velha demais
  it("returns 422 for an implausible birth date", async () => {
    const future = await post({ ...validEntry(), childBirthDate: dateYearsAgo(-1) })
    const tooOld = await post({ ...validEntry(), childBirthDate: dateYearsAgo(10) })

    expect(future.status).toBe(422)
    expect((await readBody(future)).errors.childBirthDate).toEqual(["A data de nascimento não pode estar no futuro."])
    expect(tooOld.status).toBe(422)
    expect((await readBody(tooOld)).errors.childBirthDate).toEqual(["A criança precisa ter no máximo 7 anos."])
  })

  // Turma fora da lista é recusada
  it("returns 422 for an unknown classroom", async () => {
    const response = await post({ ...validEntry(), desiredClassroom: "university" })
    const body = await readBody(response)

    expect(response.status).toBe(422)
    expect(body.errors).toHaveProperty("desiredClassroom")
  })

  // Rate limit: o 6º envio no mesmo minuto é bloqueado
  it("blocks the sixth submission in a minute", async () => {
    for (let attempt = 1; attempt <= 5; attempt++) {
      expect((await post(validEntry())).status).toBe(201)
    }

    const blocked = await post(validEntry())

    expect(blocked.status).toBe(429)
    expect(await readBody(blocked)).toEqual({ message: "Muitas tentativas de cadastro. Aguarde um minuto e tente de novo." })
  })

  // Um IP falso no cabeçalho não fura o rate limit
  it("does not let a fake X-Forwarded-For bypass the rate limit", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    const postFromFakeIp = (attempt: number) =>
      fetch(`${server.url}/api/v1/waitlist-entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Forwarded-For": `203.0.113.${attempt}` },
        body: JSON.stringify(validEntry()),
      })

    for (let attempt = 1; attempt <= 5; attempt++) {
      await postFromFakeIp(attempt)
    }
    const blocked = await postFromFakeIp(6)

    expect(blocked.status).toBe(429)
  })

  // Rastreabilidade: log com IDs e sem dados pessoais
  it("logs the creation with ids and no personal data", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {})

    const response = await post(validEntry())
    const { data } = await readBody(response)

    const lines = logSpy.mock.calls.map((call) => String(call[0]))
    const created = lines.map((line) => JSON.parse(line)).find((log) => log.event === "waitlist_entry.created")
    expect(created).toMatchObject({
      waitlist_entry_id: data.id,
      request_id: response.headers.get("x-request-id"),
    })
    for (const personalValue of ["Ana Almeida", "ana@example.com", "90000-0000", "Manu"]) {
      expect(lines.join("\n")).not.toContain(personalValue)
    }
  })
})
