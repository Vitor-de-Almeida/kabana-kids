import { api } from "./api"
import type { NewTeamMemberInput, TeamMember } from "../types/user"

export async function listTeam(): Promise<TeamMember[]> {
  const response = await api.get<{ data: TeamMember[] }>("/users")
  return response.data.data
}

// A pessoa recebe um convite por e-mail para criar a senha (D45)
export async function createTeamMember(input: NewTeamMemberInput): Promise<TeamMember> {
  const response = await api.post<{ data: TeamMember }>("/users", input)
  return response.data.data
}

export async function sendPasswordResetLink(id: string): Promise<void> {
  await api.post(`/users/${encodeURIComponent(id)}/password-reset-link`)
}
