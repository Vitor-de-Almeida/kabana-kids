import { useCallback, useEffect, useState } from "react"

import { NewTeamMemberForm } from "../../components/NewTeamMemberForm"
import { TemporaryPasswordNotice } from "../../components/TemporaryPasswordNotice"
import { useAuth } from "../../hooks/useAuth"
import { describeApiError, toApiError } from "../../services/apiError"
import { listTeam, resetMemberPassword } from "../../services/users"
import type { TeamMember, User, UserRole } from "../../types/user"

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Dono(a) da escola",
  manager: "Gerente",
  teacher: "Professor(a)",
  parent: "Família",
}

// Só para mostrar o botão; quem decide é a API (D40)
const RESETTABLE_BY: Record<UserRole, readonly UserRole[]> = {
  admin: ["manager", "teacher", "parent"],
  manager: ["teacher", "parent"],
  teacher: [],
  parent: [],
}

function canShowReset(actor: User, member: TeamMember): boolean {
  return member.id !== actor.id && !member.isOwner && RESETTABLE_BY[actor.role].includes(member.role)
}

export function TeamPage() {
  const { user, forgetUser } = useAuth()
  const [members, setMembers] = useState<TeamMember[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<{ name: string; password: string } | null>(null)
  const [reloadCount, setReloadCount] = useState(0)

  const showError = useCallback(
    (caught: unknown) => {
      const apiError = toApiError(caught)
      if (apiError.kind === "rejected" && apiError.status === 401) {
        forgetUser()
        return
      }
      setError(describeApiError(apiError))
    },
    [forgetUser],
  )

  useEffect(() => {
    let active = true
    listTeam()
      .then((loaded) => active && setMembers(loaded))
      .catch((caught: unknown) => active && showError(caught))
    return () => {
      active = false
    }
  }, [reloadCount, showError])

  async function handleReset(member: TeamMember) {
    const confirmed = window.confirm(
      `Redefinir a senha de ${member.name}? A pessoa será desconectada de todos os aparelhos.`,
    )
    if (!confirmed) {
      return
    }
    setError(null)
    try {
      setNotice({ name: member.name, password: await resetMemberPassword(member.id) })
      setReloadCount((count) => count + 1)
    } catch (caught) {
      showError(caught)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <title>Equipe | Painel Kabana Kids</title>
      <h1 className="font-display text-3xl font-bold text-tinta">Equipe</h1>

      {notice && (
        <TemporaryPasswordNotice name={notice.name} password={notice.password} onClose={() => setNotice(null)} />
      )}
      {error && (
        <p role="alert" className="rounded-2xl bg-lilas-50 p-4 text-sm font-semibold text-lilas-700">
          {error}
        </p>
      )}

      {user.isOwner && (
        <NewTeamMemberForm
          onCreated={(created, password) => {
            setNotice({ name: created.name, password })
            setReloadCount((count) => count + 1)
          }}
        />
      )}

      {!members && !error && <p className="text-tinta-suave">Carregando a equipe...</p>}

      <ul className="space-y-3">
        {members?.map((member) => (
          <li
            key={member.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-ceu-100 bg-white p-5 shadow-lg shadow-ceu-100/60"
          >
            <div>
              <p className="font-semibold text-tinta">{member.name}</p>
              <p className="text-sm break-all text-tinta-suave">{member.email}</p>
              <p className="mt-1 text-xs text-tinta-suave">
                {ROLE_LABELS[member.role]} · {member.twoFactorEnabled ? "2FA ativo" : "2FA não ativado"}
                {member.mustChangePassword && " · aguardando o primeiro acesso"}
              </p>
            </div>
            {canShowReset(user, member) && (
              <button
                type="button"
                onClick={() => handleReset(member)}
                className="rounded-full border border-lilas-200 px-4 py-2 text-xs font-bold text-lilas-700 transition hover:bg-lilas-50"
              >
                Redefinir senha
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
