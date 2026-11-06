import { useCallback, useEffect, useState } from "react"

import { WaitlistEntryCard } from "../../components/WaitlistEntryCard"
import { useAuth } from "../../hooks/useAuth"
import { toApiError } from "../../services/apiError"
import type { ApiError } from "../../services/apiError"
import { anonymizeWaitlistEntry, listWaitlistEntries } from "../../services/waitlist"
import type { Paginated } from "../../types/pagination"
import type { WaitlistEntryForSchool } from "../../types/waitlist"

const pageButton =
  "rounded-full border border-lilas-200 px-5 py-2 text-sm font-bold text-lilas-600 transition hover:bg-lilas-50 disabled:opacity-40"

// Mensagem para a equipe, dizendo o que não deu certo
function panelErrorMessage(error: ApiError, action: string): string {
  switch (error.kind) {
    case "network":
    case "unavailable":
      return `Não foi possível ${action}: o sistema não respondeu. Confira a internet e tente de novo em alguns minutos.`
    case "unexpected":
      return error.requestId
        ? `Não foi possível ${action}. Tente de novo em alguns minutos. Se continuar, informe ao suporte o código ${error.requestId}.`
        : `Não foi possível ${action}. Tente de novo em alguns minutos.`
    default:
      return error.message
  }
}

export function WaitlistEntriesPage() {
  const { forgetUser } = useAuth()
  const [page, setPage] = useState(1)
  const [reloadCount, setReloadCount] = useState(0)
  const [result, setResult] = useState<Paginated<WaitlistEntryForSchool> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  // Sessão expirada: volta para o login
  const showError = useCallback(
    (caught: unknown, action: string) => {
      const apiError = toApiError(caught)
      if (apiError.kind === "rejected" && apiError.status === 401) {
        forgetUser()
        return
      }
      setError(panelErrorMessage(apiError, action))
    },
    [forgetUser],
  )

  useEffect(() => {
    let active = true
    listWaitlistEntries(page)
      .then((loaded) => {
        if (active) {
          setResult(loaded)
          setError(null)
        }
      })
      .catch((caught: unknown) => {
        if (active) {
          showError(caught, "carregar as matrículas")
        }
      })
    return () => {
      active = false
    }
  }, [page, reloadCount, showError])

  async function handleAnonymize(entry: WaitlistEntryForSchool) {
    const confirmed = window.confirm(
      `Excluir os dados do cadastro de ${entry.childName}? Use quando a família pedir. Isso não pode ser desfeito.`,
    )
    if (!confirmed) {
      return
    }

    setBusyId(entry.id)
    try {
      await anonymizeWaitlistEntry(entry.id)
      setReloadCount((count) => count + 1)
    } catch (caught) {
      showError(caught, "excluir os dados deste cadastro")
    } finally {
      setBusyId(null)
    }
  }

  const totalPages = result ? Math.max(1, Math.ceil(result.meta.total / result.meta.perPage)) : 1

  return (
    <div className="mx-auto max-w-4xl">
      <title>Matrículas | Painel Kabana Kids</title>
      <h1 className="font-display text-3xl font-bold text-tinta">Matrículas</h1>
      <p className="mt-2 text-tinta-suave">
        Famílias que preencheram o formulário do site. Cada acesso a esta lista fica registrado.
      </p>

      {error && (
        <div role="alert" className="mt-6 rounded-2xl bg-lilas-50 p-4 text-sm font-semibold text-lilas-700">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => {
              setError(null)
              setReloadCount((count) => count + 1)
            }}
            className="mt-3 rounded-full border border-lilas-300 px-4 py-2 text-xs font-bold transition hover:bg-white"
          >
            Tentar de novo
          </button>
        </div>
      )}

      {!result && !error && <p className="mt-8 text-tinta-suave">Carregando as matrículas...</p>}

      {result && result.data.length === 0 && (
        <div className="mt-8 rounded-3xl border border-ceu-100 bg-white p-8 text-center">
          <p className="font-display text-xl font-bold text-tinta">Ainda não há matrículas</p>
          <p className="mt-2 text-tinta-suave">
            Quando uma família preencher o formulário do site, o cadastro aparece aqui.
          </p>
        </div>
      )}

      <div className="mt-8 space-y-5">
        {result?.data.map((entry) => (
          <WaitlistEntryCard key={entry.id} entry={entry} busy={busyId === entry.id} onAnonymize={handleAnonymize} />
        ))}
      </div>

      {result && result.meta.total > result.meta.perPage && (
        <nav className="mt-8 flex items-center justify-between" aria-label="Páginas">
          <button type="button" className={pageButton} disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Anterior
          </button>
          <span className="text-sm text-tinta-suave">
            Página {page} de {totalPages}
          </span>
          <button type="button" className={pageButton} disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            Próxima
          </button>
        </nav>
      )}
    </div>
  )
}
