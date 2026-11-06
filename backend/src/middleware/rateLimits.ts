import type { Request, Response } from "express"
import { ipKeyGenerator, rateLimit } from "express-rate-limit"
import type { AugmentedRequest } from "express-rate-limit"

import { logger } from "../logger.ts"
import { databaseRateLimitStore } from "./rateLimitStore.ts"
import { getCurrentUser } from "./requireAuth.ts"
import { getRequestId } from "./requestContext.ts"

const ONE_MINUTE_MS = 60_000
const WAIT_MESSAGE = "Aguarde um minuto e tente de novo."

type LimitOptions = {
  // Nome do contador no banco; cada limite tem o seu
  name: string
  limit: number
  message: string
  key?: (request: Request, response: Response) => string
  // Login (D36): a espera dobra a cada tentativa bloqueada
  escalate?: boolean
  windowMs?: number
}

// "Aguarde 1 minuto" ou "Aguarde 8 minutos", conforme a penalidade
function loginWaitMessage(request: Request): string {
  const resetTime = (request as AugmentedRequest).rateLimit?.resetTime
  // Arredonda: relógios do banco e da API diferem por milissegundos
  const minutes = resetTime ? Math.max(1, Math.round((resetTime.getTime() - Date.now()) / ONE_MINUTE_MS)) : 1
  const wait = minutes >= 60 ? `${Math.ceil(minutes / 60)} hora(s)` : `${minutes} minuto(s)`
  return `Muitas tentativas de login. Aguarde ${wait} e tente de novo. Cada nova tentativa antes disso aumenta a espera.`
}

function limitPerMinute({ name, limit, message, key, escalate = false, windowMs = ONE_MINUTE_MS }: LimitOptions) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    store: databaseRateLimitStore(name, { escalate }),
    ...(key ? { keyGenerator: key } : {}),
    handler: (request, response) => {
      logger.info("rate_limit.blocked", { request_id: getRequestId(response), path: request.path, limit: name })
      response.status(429).json({ message: escalate ? loginWaitMessage(request) : message })
    },
  })
}

function loginEmail(request: Request): string {
  const email: unknown = request.body?.email
  return typeof email === "string" ? email.trim().toLowerCase().slice(0, 254) : ""
}

const ipKey = (request: Request) => ipKeyGenerator(request.ip ?? "")

// Formulários públicos: 5 envios por minuto por IP
export function publicFormLimit() {
  return limitPerMinute({ name: "public-form", limit: 5, message: `Muitas tentativas de cadastro. ${WAIT_MESSAGE}` })
}

// Login: 5 tentativas por minuto por e-mail + IP (seguranca.md)
export function loginLimit() {
  return limitPerMinute({
    name: "login",
    limit: 5,
    message: `Muitas tentativas de login. ${WAIT_MESSAGE}`,
    key: (request) => `${ipKey(request)}:${loginEmail(request)}`,
    escalate: true,
  })
}

// Um IP testando vários e-mails também é barrado
export function loginIpLimit() {
  return limitPerMinute({ name: "login-ip", limit: 10, message: `Muitas tentativas de login. ${WAIT_MESSAGE}`, escalate: true })
}

// Troca de senha e 2FA: 5 por minuto por conta (depois do login)
export function accountLimit() {
  return limitPerMinute({
    name: "account",
    limit: 5,
    message: `Muitas tentativas. ${WAIT_MESSAGE}`,
    key: (_request, response) => getCurrentUser(response).id,
  })
}

// Aba Equipe (criar contas e redefinir senhas): 20 por minuto por conta
export function teamLimit() {
  return limitPerMinute({
    name: "team",
    limit: 20,
    message: `Muitas alterações seguidas na equipe. ${WAIT_MESSAGE}`,
    key: (_request, response) => getCurrentUser(response).id,
  })
}

const FIFTEEN_MINUTES_MS = 15 * ONE_MINUTE_MS
const RESET_WAIT = "Muitas tentativas. Aguarde 15 minutos e tente de novo."

// "Esqueci minha senha": 5 pedidos por IP e 3 por e-mail a cada 15 minutos
export function passwordResetRequestLimits() {
  return [
    limitPerMinute({ name: "reset-request-ip", limit: 5, windowMs: FIFTEEN_MINUTES_MS, message: RESET_WAIT }),
    limitPerMinute({
      name: "reset-request-email",
      limit: 3,
      windowMs: FIFTEEN_MINUTES_MS,
      message: RESET_WAIT,
      key: (request) => loginEmail(request),
    }),
  ]
}

// Criar a senha pelo link: 10 tentativas por IP a cada 15 minutos
export function passwordResetLimit() {
  return limitPerMinute({ name: "reset-complete", limit: 10, windowMs: FIFTEEN_MINUTES_MS, message: RESET_WAIT })
}
