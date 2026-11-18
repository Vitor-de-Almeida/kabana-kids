import { readFile, readdir, rm } from "node:fs/promises"
import type { Server } from "node:http"
import { join } from "node:path"

import { createUser } from "../src/actions/users/createUser.ts"
import { createApp } from "../src/app.ts"
import { prisma } from "../src/db.ts"
import type { User, UserRole } from "../src/generated/prisma/client.ts"
import { encryptSecret } from "../src/security/secretBox.ts"
import { currentTotpStep, totpCodeAt } from "../src/security/totp.ts"

// Mesmo endereço do FRONTEND_URL do vitest.config.ts
export const FRONTEND_ORIGIN = "http://localhost:5173"

// Senha e segredo do 2FA fictícios, só para testes
export const TEST_PASSWORD = "Senha-de-Teste-123"
export const TEST_TOTP_SECRET = "JBSWY3DPEHPK3PXP"

// Sobe a API numa porta livre para o teste.
export async function startTestServer(): Promise<{ url: string; close: () => Promise<void> }> {
  const server: Server = await new Promise((resolve) => {
    const started = createApp().listen(0, () => resolve(started))
  })
  const address = server.address()
  if (address === null || typeof address === "string") {
    throw new Error("Não foi possível descobrir a porta do servidor de teste")
  }

  return {
    url: `http://127.0.0.1:${address.port}`,
    close: () => new Promise((resolve) => server.close(() => resolve())),
  }
}

// TRUNCATE: o banco protege histórico e dono contra DELETE (D40, D44).
// Só o banco de testes (*_test) passa por aqui.
export async function cleanDatabase(): Promise<void> {
  await prisma.$executeRaw`TRUNCATE rate_limit_hits, audit_logs, login_events, password_reset_tokens, sessions, users, waitlist_entries`
  await rm(TEST_OUTBOX, { recursive: true, force: true })
}

// Mesma pasta do MAIL_OUTBOX_DIR do vitest.config.ts
const TEST_OUTBOX = "storage/test-mail-outbox"

export type SentMail = { to: string; subject: string; text: string }

async function readOutbox(): Promise<SentMail[]> {
  const files = (await readdir(TEST_OUTBOX).catch(() => [])).sort()
  return Promise.all(files.map(async (file) => JSON.parse(await readFile(join(TEST_OUTBOX, file), "utf8")) as SentMail))
}

export async function mailsTo(to: string): Promise<SentMail[]> {
  return (await readOutbox()).filter((mail) => mail.to === to)
}

// Alguns envios não são esperados pela API (D45): aguarda até 2 s
export async function waitForMail(to: string): Promise<SentMail> {
  for (let attempt = 0; attempt < 40; attempt++) {
    const mails = await mailsTo(to)
    const last = mails[mails.length - 1]
    if (last) {
      return last
    }
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
  throw new Error(`Nenhum e-mail para ${to}`)
}

export function tokenFromMail(mail: SentMail): string {
  const match = /#token=([A-Za-z0-9_-]+)/.exec(mail.text)
  if (!match?.[1]) {
    throw new Error("E-mail sem link de senha")
  }
  return match[1]
}

export function createTestUser(role: UserRole, email = `${role}@example.com`): Promise<User> {
  return createUser({ name: `Pessoa ${role}`, email, password: TEST_PASSWORD }, role)
}

// Liga o 2FA direto no banco, com o segredo fictício
export async function enableTestTwoFactor(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { twoFactorSecret: encryptSecret(TEST_TOTP_SECRET), twoFactorEnabledAt: new Date() },
  })
}

// offset 1 = o próximo código (para um segundo login no teste)
export function testTwoFactorCode(offset = 0): string {
  return totpCodeAt(TEST_TOTP_SECRET, currentTotpStep() + offset)
}

// Faz login e devolve o cookie para os próximos pedidos
export async function loginAs(serverUrl: string, email: string, code?: string): Promise<string> {
  const response = await fetch(`${serverUrl}/api/v1/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: FRONTEND_ORIGIN },
    body: JSON.stringify({ email, password: TEST_PASSWORD, code }),
  })
  const cookie = response.headers.get("set-cookie")
  if (response.status !== 201 || !cookie) {
    throw new Error(`Login de teste falhou (${response.status})`)
  }

  return cookie.split(";")[0] ?? ""
}
