import { api } from "./api"
import type { WaitlistEntry, WaitlistEntryInput } from "../types/waitlist"

export async function createWaitlistEntry(input: WaitlistEntryInput): Promise<WaitlistEntry> {
  const response = await api.post<{ data: WaitlistEntry }>("/waitlist-entries", input)
  return response.data.data
}
