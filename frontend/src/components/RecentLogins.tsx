import { useEffect, useState } from "react"

import { fetchMyLogins } from "../services/auth"
import type { LoginEvent } from "../types/user"

function formatDate(date: string): string {
  return new Date(date).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" })
}

// A pessoa confere se todos os acessos foram mesmo dela (D43)
export function RecentLogins() {
  const [logins, setLogins] = useState<LoginEvent[] | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    fetchMyLogins()
      .then(setLogins)
      .catch(() => setFailed(true))
  }, [])

  return (
    <section className="rounded-3xl border border-ceu-100 bg-white p-6 shadow-lg shadow-ceu-100/60 sm:p-8">
      <h2 className="font-display text-xl font-bold text-tinta">Meus últimos acessos</h2>
      <p className="mt-2 text-sm text-tinta-suave">
        Se algum acesso não foi seu, troque a senha agora e avise a direção da escola.
      </p>

      {failed && <p className="mt-4 text-sm text-tinta-suave">Não foi possível carregar os acessos agora.</p>}
      {!logins && !failed && <p className="mt-4 text-sm text-tinta-suave">Carregando...</p>}

      <ul className="mt-4 divide-y divide-ceu-100 text-sm">
        {logins?.map((login) => (
          <li key={login.createdAt} className="py-3">
            <p className="font-semibold text-tinta">
              {formatDate(login.createdAt)} · IP {login.ip}
            </p>
            <p className="break-all text-tinta-suave">{login.userAgent || "Navegador não informado"}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
