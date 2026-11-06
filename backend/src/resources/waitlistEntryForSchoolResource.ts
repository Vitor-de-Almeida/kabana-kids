import type { WaitlistEntry } from "../generated/prisma/client.ts"

// Painel da escola (só admin): dados necessários para o contato
export function waitlistEntryForSchoolResource(entry: WaitlistEntry) {
  return {
    id: entry.id,
    guardianName: entry.guardianName,
    email: entry.email,
    phone: entry.phone,
    childName: entry.childName,
    childBirthDate: entry.childBirthDate?.toISOString().slice(0, 10) ?? null,
    desiredClassroom: entry.desiredClassroom,
    message: entry.message,
    status: entry.status,
    createdAt: entry.createdAt.toISOString(),
  }
}
