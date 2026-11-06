import { hasPermission } from "../security/permissions.ts"
import type { SessionUser } from "../security/session.ts"

// Dono e gerente veem os cadastros (D40)
export function canListWaitlistEntries(user: SessionUser): boolean {
  return hasPermission(user.role, "waitlist.view")
}

export function canAnonymizeWaitlistEntry(user: SessionUser): boolean {
  return hasPermission(user.role, "waitlist.anonymize")
}
