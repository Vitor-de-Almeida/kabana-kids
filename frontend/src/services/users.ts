import { api } from "./api"
import type { NewTeamMemberInput, TeamMember } from "../types/user"

export async function listTeam(): Promise<TeamMember[]> {
  const response = await api.get<{ data: TeamMember[] }>("/users")
  return response.data.data
}

// A senha temporária volta só nesta resposta (D41)
export async function createTeamMember(
  input: NewTeamMemberInput,
): Promise<{ user: TeamMember; temporaryPassword: string }> {
  const response = await api.post<{ data: { user: TeamMember; temporaryPassword: string } }>("/users", input)
  return response.data.data
}

export async function resetMemberPassword(id: string): Promise<string> {
  const response = await api.post<{ data: { temporaryPassword: string } }>(
    `/users/${encodeURIComponent(id)}/password-reset`,
  )
  return response.data.data.temporaryPassword
}
