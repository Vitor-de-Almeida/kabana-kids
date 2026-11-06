import { useState } from "react"
import type { FormEvent } from "react"

import { FieldError } from "./FieldError"
import { describeApiError, toApiError } from "../services/apiError"
import { createTeamMember } from "../services/users"
import type { NewTeamMemberInput, TeamMember } from "../types/user"

const rotuloCampo = "mb-2 block text-sm font-semibold text-tinta"
const campo =
  "w-full rounded-2xl border border-ceu-200 bg-white px-4 py-3 text-tinta outline-none transition focus:border-lilas-400 focus:ring-4 focus:ring-lilas-100 aria-invalid:border-lilas-500"

type NewTeamMemberFormProps = {
  onCreated: (user: TeamMember, temporaryPassword: string) => void
}

export function NewTeamMemberForm({ onCreated }: NewTeamMemberFormProps) {
  const [sending, setSending] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [formError, setFormError] = useState<string | null>(null)

  async function handleSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const form = evento.currentTarget
    const data = new FormData(form)
    setSending(true)
    setFieldErrors({})
    setFormError(null)

    try {
      const created = await createTeamMember({
        name: String(data.get("nome") ?? ""),
        email: String(data.get("emailMembro") ?? ""),
        role: String(data.get("perfil") ?? "") as NewTeamMemberInput["role"],
      })
      form.reset()
      onCreated(created.user, created.temporaryPassword)
    } catch (caught) {
      const apiError = toApiError(caught)
      setFieldErrors(apiError.kind === "validation" ? apiError.fieldErrors : {})
      setFormError(describeApiError(apiError))
    } finally {
      setSending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-ceu-100 bg-white p-6 shadow-lg shadow-ceu-100/60 sm:p-8">
      <h2 className="font-display text-xl font-bold text-tinta">Nova pessoa na equipe</h2>
      <p className="mt-2 text-sm text-tinta-suave">
        O sistema cria uma senha temporária. A pessoa troca a senha e ativa o 2FA no primeiro acesso.
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={rotuloCampo} htmlFor="nome">
            Nome
          </label>
          <input id="nome" name="nome" type="text" required maxLength={120} className={campo} aria-invalid={Boolean(fieldErrors.name) || undefined} aria-describedby={fieldErrors.name ? "erro-name" : undefined} />
          <FieldError id="erro-name" messages={fieldErrors.name} />
        </div>
        <div>
          <label className={rotuloCampo} htmlFor="emailMembro">
            E-mail
          </label>
          <input id="emailMembro" name="emailMembro" type="email" required maxLength={254} className={campo} aria-invalid={Boolean(fieldErrors.email) || undefined} aria-describedby={fieldErrors.email ? "erro-email" : undefined} />
          <FieldError id="erro-email" messages={fieldErrors.email} />
        </div>
        <div>
          <label className={rotuloCampo} htmlFor="perfil">
            Perfil
          </label>
          <select id="perfil" name="perfil" required defaultValue="" className={campo} aria-invalid={Boolean(fieldErrors.role) || undefined} aria-describedby={fieldErrors.role ? "erro-role" : undefined}>
            <option value="" disabled>
              Selecione
            </option>
            <option value="manager">Gerente</option>
            <option value="teacher">Professor(a)</option>
          </select>
          <FieldError id="erro-role" messages={fieldErrors.role} />
        </div>
      </div>

      {formError && !Object.keys(fieldErrors).length && (
        <p role="alert" className="mt-6 rounded-2xl bg-lilas-50 p-4 text-sm font-semibold text-lilas-700">
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={sending}
        className="mt-6 rounded-full bg-lilas-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-lilas-600 disabled:cursor-wait disabled:opacity-70"
      >
        {sending ? "Criando..." : "Criar conta"}
      </button>
    </form>
  )
}
