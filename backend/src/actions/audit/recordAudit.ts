import type { Prisma } from "../../generated/prisma/client.ts"

import { prisma } from "../../db.ts"

export type AuditEntry = {
  // null quando a ação veio do terminal
  userId: string | null
  action: string
  targetType: string
  targetId: string | null
  requestId: string | null
  // site = página pública, como "esqueci minha senha"
  origin?: "panel" | "terminal" | "site"
  result?: "success" | "denied"
  // Usuário do servidor, quando veio do terminal
  operator?: string | null
}

type Database = typeof prisma | Prisma.TransactionClient

// Só IDs: nunca copia os dados pessoais do alvo
export async function recordAudit(entry: AuditEntry, database: Database = prisma): Promise<void> {
  await database.auditLog.create({
    data: {
      userId: entry.userId,
      action: entry.action,
      targetType: entry.targetType,
      targetId: entry.targetId,
      requestId: entry.requestId,
      origin: entry.origin ?? "panel",
      result: entry.result ?? "success",
      operator: entry.operator ?? null,
    },
  })
}
