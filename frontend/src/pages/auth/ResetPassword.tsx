import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { Link } from "react-router-dom"

import { FieldError } from "../../components/FieldError"
import { Footer } from "../../components/Footer"
import { Header } from "../../components/Header"
import { PASSWORD_RULES } from "../../components/passwordRules"
import { completePasswordReset } from "../../services/auth"
import { describeApiError, toApiError } from "../../services/apiError"

const rotuloCampo = "mb-2 block text-sm font-semibold text-tinta"
const campo =
  "w-full rounded-2xl border border-ceu-200 bg-white px-4 py-3 text-tinta outline-none transition focus:border-lilas-400 focus:ring-4 focus:ring-lilas-100 aria-invalid:border-lilas-500"

// O token vem depois do "#", que o navegador não manda ao servidor (D45)
function readTokenFromAddress(): string | null {
  return new URLSearchParams(window.location.hash.slice(1)).get("token")
}

export function ResetPasswordPage() {
  const [token] = useState(readTokenFromAddress)

  // Tira o token do endereço: não fica no histórico nem em prints
  useEffect(() => {
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname)
    }
  }, [])
  const [status, setStatus] = useState<"idle" | "sending" | "success">("idle")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [formError, setFormError] = useState<string | null>(null)

  async function handleSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const data = new FormData(evento.currentTarget)
    const newPassword = String(data.get("novaSenha") ?? "")
    setFieldErrors({})
    setFormError(null)

    if (newPassword !== String(data.get("confirmacao") ?? "")) {
      setFieldErrors({ confirmation: ["A confirmação não é igual à nova senha."] })
      return
    }

    setStatus("sending")
    try {
      await completePasswordReset(token ?? "", newPassword)
      setStatus("success")
    } catch (caught) {
      const apiError = toApiError(caught)
      setFieldErrors(apiError.kind === "validation" ? apiError.fieldErrors : {})
      setFormError(describeApiError(apiError))
      setStatus("idle")
    }
  }

  const linkProblem = !token || fieldErrors.token

  return (
    <div className="bg-white">
      <title>Criar nova senha | Kabana Kids</title>
      {/* O endereço desta página nunca é repassado a outros sites */}
      <meta name="referrer" content="no-referrer" />
      <Header />

      <main className="relative overflow-hidden py-20 lg:py-28">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-lilas-50 via-white to-ceu-50" />

        <div className="mx-auto max-w-md px-5 sm:px-8">
          <h1 className="font-display text-center text-3xl font-bold text-tinta sm:text-4xl">Criar nova senha</h1>

          <div className="mt-10 rounded-3xl border border-ceu-100 bg-white p-7 shadow-xl shadow-ceu-100/60 sm:p-10">
            {status === "success" ? (
              <>
                <p role="status" className="rounded-2xl bg-ceu-50 p-4 text-sm font-semibold text-ceu-700">
                  Senha criada. Por segurança, todos os aparelhos foram desconectados.
                </p>
                <Link to="/login" className="mt-6 block text-center font-bold text-lilas-600">
                  Entrar
                </Link>
              </>
            ) : linkProblem ? (
              <>
                <p role="alert" className="rounded-2xl bg-lilas-50 p-4 text-sm font-semibold text-lilas-700">
                  Este link é inválido ou expirou. Peça um novo.
                </p>
                <Link to="/esqueci-a-senha" className="mt-6 block text-center font-bold text-lilas-600">
                  Pedir um novo link
                </Link>
              </>
            ) : (
              <form onSubmit={handleSubmit}>
                <ul className="list-disc space-y-1 pl-5 text-sm text-tinta-suave">
                  {PASSWORD_RULES.map((regra) => (
                    <li key={regra}>{regra}</li>
                  ))}
                </ul>
                <div className="mt-6 space-y-5">
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
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="mt-8 w-full rounded-full bg-lilas-500 px-8 py-4 font-bold text-white shadow-lg shadow-lilas-200 transition hover:bg-lilas-600 disabled:cursor-wait disabled:opacity-70"
                >
                  {status === "sending" ? "Salvando..." : "Criar senha"}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
