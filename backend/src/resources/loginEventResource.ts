import type { LoginEvent } from "../generated/prisma/client.ts"

export function loginEventResource(event: LoginEvent) {
  return {
    ip: event.ip,
    userAgent: event.userAgent,
    createdAt: event.createdAt.toISOString(),
  }
}
