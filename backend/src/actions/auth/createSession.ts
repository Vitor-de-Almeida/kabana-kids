import { prisma } from "../../db.ts"
import type { User } from "../../generated/prisma/client.ts"
import { logger } from "../../logger.ts"
import type { CreateSessionInput } from "../../schemas/auth/createSession.ts"
import { verifyAgainstDummyHash, verifyPassword } from "../../security/password.ts"
import { SESSION_MAX_AGE_MS, createSessionToken, hashSessionToken, toSessionUser } from "../../security/session.ts"
import type { SessionUser } from "../../security/session.ts"
import { checkTwoFactorCode } from "../twoFactor/checkTwoFactorCode.ts"

export type CreateSessionResult =
  | { kind: "created"; user: SessionUser; token: string }
  | { kind: "invalid_credentials" }
  | { kind: "temporary_password_expired" }
  | { kind: "two_factor_required" }
  | { kind: "invalid_two_factor_code" }

// De onde veio o login (D43): só IP e navegador
export type LoginClient = { ip: string; userAgent: string }

async function findUserByPassword(input: CreateSessionInput): Promise<User | null> {
  const user = await prisma.user.findUnique({ where: { email: input.email } })
  if (!user) {
    await verifyAgainstDummyHash(input.password)
    return null
  }

  return (await verifyPassword(input.password, user.passwordHash)) ? user : null
}

function isTemporaryPasswordValid(user: User, now: Date): boolean {
  return (
    user.temporaryPasswordUsedAt === null &&
    user.temporaryPasswordExpiresAt !== null &&
    user.temporaryPasswordExpiresAt > now
  )
}

async function openSession(user: User, client: LoginClient, requestId: string): Promise<CreateSessionResult> {
  const now = new Date()
  const token = createSessionToken()

  const { session, updatedUser } = await prisma.$transaction(async (transaction) => {
    // Senha temporária: só um login consegue "gastar" (D41)
    if (user.mustChangePassword) {
      const spent = await transaction.user.updateMany({
        where: { id: user.id, temporaryPasswordUsedAt: null },
        data: { temporaryPasswordUsedAt: now },
      })
      if (spent.count === 0) {
        return { session: null, updatedUser: null }
      }
    }

    await transaction.session.deleteMany({ where: { userId: user.id, expiresAt: { lt: now } } })
    const created = await transaction.session.create({
      data: {
        userId: user.id,
        tokenHash: hashSessionToken(token),
        expiresAt: new Date(now.getTime() + SESSION_MAX_AGE_MS),
        lastUsedAt: now,
      },
    })
    await transaction.loginEvent.create({ data: { userId: user.id, ip: client.ip, userAgent: client.userAgent } })
    const counted = await transaction.user.update({ where: { id: user.id }, data: { loginCount: { increment: 1 } } })
    return { session: created, updatedUser: counted }
  })

  if (!session || !updatedUser) {
    return { kind: "temporary_password_expired" }
  }

  logger.info("session.created", { request_id: requestId, user_id: user.id, session_id: session.id })
  return { kind: "created", user: toSessionUser(updatedUser, session.id), token }
}

export async function createSession(
  input: CreateSessionInput,
  previousToken: string | null,
  client: LoginClient,
  requestId: string,
): Promise<CreateSessionResult> {
  // Sessão anterior nunca é reaproveitada (fixação de sessão)
  if (previousToken) {
    await prisma.session.deleteMany({ where: { tokenHash: hashSessionToken(previousToken) } })
  }

  const user = await findUserByPassword(input)
  if (!user) {
    logger.info("session.login_failed", { request_id: requestId })
    return { kind: "invalid_credentials" }
  }

  if (user.mustChangePassword && !isTemporaryPasswordValid(user, new Date())) {
    logger.info("session.temporary_password_rejected", { request_id: requestId, user_id: user.id })
    return { kind: "temporary_password_expired" }
  }

  if (user.twoFactorEnabledAt) {
    if (!input.code) {
      return { kind: "two_factor_required" }
    }
    if (!(await checkTwoFactorCode(user, input.code))) {
      logger.info("session.two_factor_failed", { request_id: requestId, user_id: user.id })
      return { kind: "invalid_two_factor_code" }
    }
  }

  return openSession(user, client, requestId)
}
