import type { WaitlistEntry } from "../generated/prisma/client.ts"

// Resposta pública: nunca devolve os dados da família.
export function waitlistEntryResource(entry: WaitlistEntry) {
  return {
    id: entry.id,
    status: entry.status,
    createdAt: entry.createdAt.toISOString(),
  }
}
