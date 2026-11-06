import { useState } from "react"
import type { FormEvent } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"

import { Header } from "../../components/Header"
import { Footer } from "../../components/Footer"
import { useAuth } from "../../hooks/useAuth"
import { describeApiError, toApiError } from "../../services/apiError"
import type { LoginInput } from "../../types/user"

const rotuloCampo = "mb-2 block text-sm font-semibold text-tinta"
const campo =
  "w-full rounded-2xl border border-ceu-200 bg-white px-4 py-3 text-tinta outline-none transition placeholder:text-tinta-suave/60 focus:border-lilas-400 focus:ring-4 focus:ring-lilas-100"

export function LoginPage() {
  const { user, signIn } = useAuth()
  const navigate = useNavigate()
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Guardado só em memória entre as duas etapas
  const [credentials, setCredentials] = useState<LoginInput | null>(null)

  if (user) {
    return <Navigate to="/painel" replace />
  }

  async function submit(input: LoginInput) {
    setSending(true)
    setError(null)

    try {
      const result = await signIn(input)
      if (result.kind === "twoFactorRequired") {
        setCredentials(input)
        setSending(false)
        return
      }
      navigate("/painel", { replace: true })
    } catch (caught) {
      setError(describeApiError(toApiError(caught)))
      setSending(false)
    }
  }

  function handlePasswordStep(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const data = new FormData(evento.currentTarget)
    void submit({ email: String(data.get("email") ?? ""), password: String(data.get("senha") ?? "") })
  }

  function handleCodeStep(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const data = new FormData(evento.currentTarget)
    if (credentials) {
      void submit({ ...credentials, code: String(data.get("codigo") ?? "").trim() })
    }
  }

  const errorBox = error && (
    <p role="alert" className="mt-6 rounded-2xl bg-lilas-50 p-4 text-sm font-semibold text-lilas-700">
      {error}
    </p>
  )
  const formBox = "mt-10 rounded-3xl border border-ceu-100 bg-white p-7 shadow-xl shadow-ceu-100/60 sm:p-10"
  const submitButton =
    "mt-8 w-full rounded-full bg-lilas-500 px-8 py-4 font-bold text-white shadow-lg shadow-lilas-200 transition hover:bg-lilas-600 disabled:cursor-wait disabled:opacity-70"

  return (
    <div className="bg-white">
      <title>Entrar | Kabana Kids</title>
      <Header />

      <main className="relative overflow-hidden py-20 lg:py-28">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-lilas-50 via-white to-ceu-50" />

        <div className="mx-auto max-w-md px-5 sm:px-8">
          <h1 className="font-display text-center text-3xl font-bold text-tinta sm:text-4xl">Entrar</h1>
          <p className="mt-3 text-center text-tinta-suave">
            {credentials
              ? "Abra o app autenticador no celular e digite o código de 6 números."
              : "Acesse a área da sua família ou da escola."}
          </p>

          {credentials ? (
            <form onSubmit={handleCodeStep} className={formBox}>
              <label className={rotuloCampo} htmlFor="codigo">
                Código do app
              </label>
              <input
                id="codigo"
                name="codigo"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                autoFocus
                placeholder="000000"
                className={`${campo} text-center text-2xl tracking-[0.5em]`}
              />
              {errorBox}
              <button type="submit" disabled={sending} className={submitButton}>
                {sending ? "Conferindo..." : "Confirmar"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setCredentials(null)
                  setError(null)
                }}
                className="mt-4 w-full text-sm font-semibold text-lilas-600"
              >
                Voltar
              </button>
            </form>
          ) : (
            <form onSubmit={handlePasswordStep} className={formBox}>
              <div className="space-y-5">
                <div>
                  <label className={rotuloCampo} htmlFor="email">
                    E-mail
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={254}
                    placeholder="ana@email.com"
                    className={campo}
                  />
                </div>

                <div>
                  <label className={rotuloCampo} htmlFor="senha">
                    Senha
                  </label>
                  <input
                    id="senha"
                    name="senha"
                    type="password"
                    autoComplete="current-password"
                    required
                    maxLength={128}
                    className={campo}
                  />
                </div>
              </div>
              {errorBox}
              <button type="submit" disabled={sending} className={submitButton}>
                {sending ? "Entrando..." : "Entrar"}
              </button>
              <Link to="/esqueci-a-senha" className="mt-4 block text-center text-sm font-semibold text-lilas-600">
                Esqueci minha senha
              </Link>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
