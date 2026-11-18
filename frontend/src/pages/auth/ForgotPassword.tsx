import { useState } from "react"
import type { FormEvent } from "react"
import { Link } from "react-router-dom"

import { Header } from "../../components/Header"
import { Footer } from "../../components/Footer"
import { requestPasswordReset } from "../../services/auth"
import { describeApiError, toApiError } from "../../services/apiError"

const campo =
  "w-full rounded-2xl border border-ceu-200 bg-white px-4 py-3 text-tinta outline-none transition placeholder:text-tinta-suave/60 focus:border-lilas-400 focus:ring-4 focus:ring-lilas-100"

export function ForgotPasswordPage() {
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const email = String(new FormData(evento.currentTarget).get("email") ?? "")
    setSending(true)
    setError(null)
    try {
      // A resposta é a mesma, exista ou não a conta (D45)
      setMessage(await requestPasswordReset(email))
    } catch (caught) {
      setError(describeApiError(toApiError(caught)))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="bg-white">
      <title>Esqueci minha senha | Kabana Kids</title>
      <Header />

      <main className="relative overflow-hidden py-20 lg:py-28">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-lilas-50 via-white to-ceu-50" />

        <div className="mx-auto max-w-md px-5 sm:px-8">
          <h1 className="font-display text-center text-3xl font-bold text-tinta sm:text-4xl">Esqueci minha senha</h1>
          <p className="mt-3 text-center text-tinta-suave">
            Digite o e-mail da sua conta. Vamos mandar um link para você criar uma senha nova.
          </p>

          <div className="mt-10 rounded-3xl border border-ceu-100 bg-white p-7 shadow-xl shadow-ceu-100/60 sm:p-10">
            {message ? (
              <p role="status" className="rounded-2xl bg-ceu-50 p-4 text-sm font-semibold text-ceu-700">
                {message}
              </p>
            ) : (
              <form onSubmit={handleSubmit}>
                <label className="mb-2 block text-sm font-semibold text-tinta" htmlFor="email">
                  E-mail
                </label>
                <input id="email" name="email" type="email" autoComplete="email" required maxLength={254} className={campo} />
                {error && (
                  <p role="alert" className="mt-6 rounded-2xl bg-lilas-50 p-4 text-sm font-semibold text-lilas-700">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={sending}
                  className="mt-8 w-full rounded-full bg-lilas-500 px-8 py-4 font-bold text-white shadow-lg shadow-lilas-200 transition hover:bg-lilas-600 disabled:cursor-wait disabled:opacity-70"
                >
                  {sending ? "Enviando..." : "Enviar link"}
                </button>
              </form>
            )}
            <Link to="/login" className="mt-6 block text-center text-sm font-semibold text-lilas-600">
              Voltar para o login
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
