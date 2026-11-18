import { randomUUID } from "node:crypto"
import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"
import nodemailer from "nodemailer"
import type { Transporter } from "nodemailer"

import { config } from "../config.ts"
import type { MailConfig } from "../config.ts"

export type MailMessage = { to: string; subject: string; text: string }

let smtp: Transporter | null = null

// TLS sempre: na porta 465 desde o início; nas outras, STARTTLS obrigatório
function smtpTransport(mail: Extract<MailConfig, { transport: "smtp" }>): Transporter {
  smtp ??= nodemailer.createTransport({
    host: mail.host,
    port: mail.port,
    secure: mail.port === 465,
    requireTLS: mail.port !== 465,
    auth: { user: mail.user, pass: mail.password },
    tls: { minVersion: "TLSv1.2" },
  })
  return smtp
}

// Só texto: e-mail em HTML abre espaço para golpes de phishing
export async function sendMail(message: MailMessage): Promise<void> {
  const mail = config.mail

  if (mail.transport === "smtp") {
    await smtpTransport(mail).sendMail({ from: mail.from, ...message })
    return
  }

  // Desenvolvimento e testes: arquivo local, fora do Git e nunca no log
  await mkdir(mail.outboxDir, { recursive: true })
  const file = join(mail.outboxDir, `${Date.now()}-${randomUUID()}.json`)
  await writeFile(file, JSON.stringify({ from: mail.from, ...message }, null, 2), { mode: 0o600 })
}
