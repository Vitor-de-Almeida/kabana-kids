import { useState } from "react"
import type { FormEvent } from "react"

import { FieldError } from "./FieldError"
import { useAuth } from "../hooks/useAuth"
import { changePassword } from "../services/auth"
import { describeApiError, toApiError } from "../services/apiError"

// Mesmas regras do backend (D32); quem decide é a API
const regrasDaSenha = [
  "Pelo menos 10 caracteres",
  "Uma letra maiúscula e uma minúscula",
  "Um número",
  "Um caractere especial, como ! @ # ou %",
  "Bem diferente da senha atual",
]

const rotuloCampo = "mb-2 block text-sm font-semibold text-tinta"
const campo =
  "w-full rounded-2xl border border-ceu-200 bg-white px-4 py-3 text-tinta outline-none transition focus:border-lilas-400 focus:ring-4 focus:ring-lilas-100 aria-invalid:border-lilas-500"

export function ChangePasswordForm() {
  const { user, refreshUser } = useAuth()
  const isTemporary = user?.mustChangePassword === true
  const [status, setStatus] = useState<"idle" | "sending" | "success">("idle")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [formError, setFormError] = useState<string | null>(null)

  async function handleSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const form = evento.currentTarget
    const data = new FormData(form)
    const newPassword = String(data.get("novaSenha") ?? "")
    setFieldErrors({})
    setFormError(null)

    if (newPassword !== String(data.get("confirmacao") ?? "")) {
      setFieldErrors({ confirmation: ["A confirmação não é igual à nova senha."] })
      return
    }

    setStatus("sending")
    try {
      await changePassword({ currentPassword: String(data.get("senhaAtual") ?? ""), newPassword })
      form.reset()
      setStatus("success")
      // Libera o painel se era a senha temporária
      await refreshUser()
    } catch (caught) {
      const apiError = toApiError(caught)
      setFieldErrors(apiError.kind === "validation" ? apiError.fieldErrors : {})
      setFormError(describeApiError(apiError))
      setStatus("idle")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-ceu-100 bg-white p-6 shadow-lg shadow-ceu-100/60 sm:p-8">
      <h2 className="font-display text-xl font-bold text-tinta">{isTemporary ? "Crie a sua senha" : "Trocar senha"}</h2>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-tinta-suave">
        {regrasDaSenha.map((regra) => (
          <li key={regra}>{regra}</li>
        ))}
      </ul>

      <div className="mt-6 space-y-5">
        <div>
          <label className={rotuloCampo} htmlFor="senhaAtual">
            {isTemporary ? "Senha temporária que você recebeu" : "Senha atual"}
          </label>
          <input id="senhaAtual" name="senhaAtual" type="password" autoComplete="current-password" required maxLength={128} className={campo} aria-invalid={Boolean(fieldErrors.currentPassword) || undefined} aria-describedby={fieldErrors.currentPassword ? "erro-currentPassword" : undefined} />
          <FieldError id="erro-currentPassword" messages={fieldErrors.currentPassword} />
        </div>
        <div>
          <label className={rotuloCampo} htmlFor="novaSenha">
            Nova senha
          </label>
          <input id="novaSenha" name="novaSenha" type="password" autoComplete="new-password" required minLength={10} maxLength={128} className={campo} aria-invalid={Boolean(fieldErrors.newPassword) || undefined} aria-describedby={fieldErrors.newPassword ? "erro-newPassword" : undefined} />
          <FieldError id="erro-newPassword" messages={fieldErrors.newPassword} />
        </div>
        <div>
          <label className={rotuloCampo} htmlFor="confirmacao">
            Repita a nova senha
          </label>
          <input id="confirmacao" name="confirmacao" type="password" autoComplete="new-password" required maxLength={128} className={campo} aria-invalid={Boolean(fieldErrors.confirmation) || undefined} aria-describedby={fieldErrors.confirmation ? "erro-confirmation" : undefined} />
          <FieldError id="erro-confirmation" messages={fieldErrors.confirmation} />
        </div>
      </div>

      {formError && !Object.keys(fieldErrors).length && (
        <p role="alert" className="mt-6 rounded-2xl bg-lilas-50 p-4 text-sm font-semibold text-lilas-700">
          {formError}
        </p>
      )}
      {status === "success" && (
        <p role="status" className="mt-6 rounded-2xl bg-ceu-50 p-4 text-sm font-semibold text-ceu-700">
          Senha trocada. Os outros aparelhos em que você estava logado foram desconectados.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-6 rounded-full bg-lilas-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-lilas-600 disabled:cursor-wait disabled:opacity-70"
      >
        {status === "sending" ? "Salvando..." : "Trocar senha"}
      </button>
    </form>
  )
}
