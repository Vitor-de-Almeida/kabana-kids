import { createHash } from "node:crypto"
import type { IncrementResponse, Options, Store } from "express-rate-limit"

import { prisma } from "../db.ts"
import { Prisma } from "../generated/prisma/client.ts"

type HitRow = { hits: number; reset_at: Date }

type StoreOptions = {
  // Login (D36): cada tentativa durante o bloqueio dobra a espera
  escalate?: boolean
}

// Teto da penalidade: 24 horas
const MAX_PENALTY_SECONDS = 24 * 60 * 60
// 2^20 já passa do teto; evita números enormes no banco
const MAX_DOUBLINGS = 20

// Guarda as tentativas no banco: reiniciar a API não zera (D34)
export function databaseRateLimitStore(prefix: string, { escalate = false }: StoreOptions = {}): Store {
  let windowSeconds = 60
  let limit = 5

  // Só o hash: o banco nunca vê o IP ou o e-mail
  const hashKey = (key: string) => createHash("sha256").update(`${prefix}:${key}`).digest("hex")

  return {
    init(options: Options) {
      windowSeconds = Math.ceil(options.windowMs / 1000)
      if (typeof options.limit === "number") {
        limit = options.limit
      }
    },

    // Um único comando: soma 1, reabre a janela vencida ou aumenta a penalidade
    async increment(key: string): Promise<IncrementResponse> {
      const now = Prisma.sql`(now() AT TIME ZONE 'UTC')`
      // Passou do limite: espera = janela × 2^(tentativas além do limite)
      const blockedResetAt = escalate
        ? Prisma.sql`${now} + make_interval(secs => LEAST(
            ${windowSeconds} * power(2, LEAST(rate_limit_hits.hits + 1 - ${limit}, ${MAX_DOUBLINGS})),
            ${MAX_PENALTY_SECONDS}))`
        : Prisma.sql`rate_limit_hits.reset_at`

      const rows = await prisma.$queryRaw<HitRow[]>`
        INSERT INTO rate_limit_hits (key_hash, hits, reset_at)
        VALUES (${hashKey(key)}, 1, ${now} + make_interval(secs => ${windowSeconds}))
        ON CONFLICT (key_hash) DO UPDATE SET
          hits = CASE WHEN rate_limit_hits.reset_at <= ${now} THEN 1 ELSE rate_limit_hits.hits + 1 END,
          reset_at = CASE
            WHEN rate_limit_hits.reset_at <= ${now} THEN EXCLUDED.reset_at
            WHEN rate_limit_hits.hits + 1 > ${limit} THEN ${blockedResetAt}
            ELSE rate_limit_hits.reset_at
          END
        RETURNING hits, reset_at`
      const row = rows[0]
      if (!row) {
        throw new Error("O banco não devolveu o contador de tentativas")
      }
      return { totalHits: row.hits, resetTime: row.reset_at }
    },

    async decrement(key: string): Promise<void> {
      await prisma.rateLimitHit.updateMany({ where: { keyHash: hashKey(key), hits: { gt: 0 } }, data: { hits: { decrement: 1 } } })
    },

    async resetKey(key: string): Promise<void> {
      await prisma.rateLimitHit.deleteMany({ where: { keyHash: hashKey(key) } })
    },
  }
}
