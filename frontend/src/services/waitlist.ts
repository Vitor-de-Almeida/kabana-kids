import { api } from "./api"
import type { Paginated } from "../types/pagination"
import type { WaitlistEntry, WaitlistEntryForSchool, WaitlistEntryInput } from "../types/waitlist"

export async function createWaitlistEntry(input: WaitlistEntryInput): Promise<WaitlistEntry> {
  const response = await api.post<{ data: WaitlistEntry }>("/waitlist-entries", input)
  return response.data.data
}

// Painel da escola: só admin
export async function listWaitlistEntries(page: number): Promise<Paginated<WaitlistEntryForSchool>> {
  const response = await api.get<Paginated<WaitlistEntryForSchool>>("/waitlist-entries", { params: { page } })
  return response.data
}

// Apaga os dados pessoais; fica só a prova do consentimento
export async function anonymizeWaitlistEntry(id: string): Promise<void> {
  await api.delete(`/waitlist-entries/${encodeURIComponent(id)}`)
}
