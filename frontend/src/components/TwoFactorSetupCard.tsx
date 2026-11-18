import { useState } from "react"
import type { FormEvent } from "react"

import { FieldError } from "./FieldError"
import { useAuth } from "../hooks/useAuth"
import { confirmTwoFactor, startTwoFactorSetup } from "../services/auth"
import { describeApiError, toApiError } from "../services/apiError"
import type { TwoFactorSetup } from "../types/user"

const botao =
  "rounded-full bg-lilas-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-lilas-600 disabled:cursor-wait disabled:opacity-70"

// "ABCD EFGH ...": mais fácil de digitar no app
function groupInFours(secret: string): string {
  return secret.match(/.{1,4}/g)?.join(" ") ?? secret
}

export function TwoFactorSetupCard() {
  const { user, refreshUser } = useAuth()
  // O segredo só existe em memória, enquanto esta tela está aberta
  const [setup, setSetup] = useState<TwoFactorSetup | null>(null)
  const [sending, setSending] = useState(false)
  const [codeErrors, setCodeErrors] = useState<string[] | undefined>()
  const [formError, setFormError] = useState<string | null>(null)

  if (user?.twoFactorEnabled) {
    return (
      <section className="rounded-3xl border border-ceu-100 bg-white p-6 shadow-lg shadow-ceu-100/60 sm:p-8">
        <h2 className="font-display text-xl font-bold text-tinta">Verificação em duas etapas</h2>
        <p className="mt-3 text-sm text-tinta-suave">
          Ativa. Ao entrar, além da senha, o site pede o código do app autenticador do seu celular.
        </p>
      </section>
    )
  }

  async function handleStart() {
    setSending(true)
    setFormError(null)
    try {
      setSetup(await startTwoFactorSetup())
    } catch (caught) {
      setFormError(describeApiError(toApiError(caught)))
    } finally {
      setSending(false)
    }
  }

  async function handleConfirm(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const code = String(new FormData(evento.currentTarget).get("codigo2fa") ?? "").trim()
    setSending(true)
    setCodeErrors(undefined)
    setFormError(null)
    try {
      await confirmTwoFactor(code)
      setSetup(null)
      await refreshUser()
    } catch (caught) {
      const apiError = toApiError(caught)
      if (apiError.kind === "validation") {
        setCodeErrors(apiError.fieldErrors.code)
      } else {
        setFormError(describeApiError(apiError))
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="rounded-3xl border border-lilas-200 bg-white p-6 shadow-lg shadow-lilas-200/60 sm:p-8">
      <h2 className="font-display text-xl font-bold text-tinta">Verificação em duas etapas</h2>
      <p className="mt-3 text-sm text-tinta-suave">
        {user?.twoFactorSetupRequired
          ? "Obrigatória para continuar usando o painel."
          : "Recomendada. Fica obrigatória a partir do 4º acesso."}{" "}
        Mesmo que alguém descubra a sua senha, não consegue entrar sem o código que aparece no seu celular.
      </p>

      {!setup ? (
        <button type="button" onClick={handleStart} disabled={sending} className={`mt-6 ${botao}`}>
          {sending ? "Preparando..." : "Ativar agora"}
        </button>
      ) : (
        <form onSubmit={handleConfirm} className="mt-6 space-y-4 text-sm text-tinta-suave">
          <p>
            <strong className="text-tinta">1.</strong> Instale no celular um app autenticador, como o Google
            Authenticator ou o Microsoft Authenticator.
          </p>
          <p>
            <strong className="text-tinta">2.</strong> No app, escolha "inserir chave de configuração" e digite a chave
            abaixo. Se estiver no celular, toque em{" "}
            <a href={setup.setupUri} className="font-semibold text-lilas-600 underline">
              abrir no app
            </a>
            .
          </p>
          <p className="rounded-2xl bg-ceu-50 p-4 text-center font-mono text-lg font-bold tracking-wider break-all text-tinta">
            {groupInFours(setup.secret)}
          </p>
          <p>Não mostre esta chave a ninguém e não tire foto dela.</p>
          <div>
            <label className="mb-2 block font-semibold text-tinta" htmlFor="codigo2fa">
              <strong>3.</strong> Digite o código de 6 números que o app mostra
            </label>
            <input
              id="codigo2fa"
              name="codigo2fa"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              className="w-40 rounded-2xl border border-ceu-200 px-4 py-3 text-center text-xl tracking-[0.4em] text-tinta outline-none focus:border-lilas-400 focus:ring-4 focus:ring-lilas-100"
              aria-invalid={Boolean(codeErrors) || undefined}
              aria-describedby={codeErrors ? "erro-codigo2fa" : undefined}
            />
            <FieldError id="erro-codigo2fa" messages={codeErrors} />
          </div>
          <button type="submit" disabled={sending} className={botao}>
            {sending ? "Conferindo..." : "Confirmar e ativar"}
          </button>
        </form>
      )}

      {formError && (
        <p role="alert" className="mt-6 rounded-2xl bg-lilas-50 p-4 text-sm font-semibold text-lilas-700">
          {formError}
        </p>
      )}
    </section>
  )
}
