import type { FormEvent } from "react"
import { Header } from "../../components/Header"
import { Footer } from "../../components/Footer"

const rotuloCampo = "mb-2 block text-sm font-semibold text-tinta"
const campo =
  "w-full rounded-2xl border border-ceu-200 bg-white px-4 py-3 text-tinta outline-none transition placeholder:text-tinta-suave/60 focus:border-lilas-400 focus:ring-4 focus:ring-lilas-100"

export function LoginPage() {
  // Ainda sem backend: o login real chega na Parte B.
  function handleSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
  }

  return (
    <div className="bg-white">
      <title>Entrar | Kabana Kids</title>
      <Header />

      <main className="relative overflow-hidden py-20 lg:py-28">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-lilas-50 via-white to-ceu-50" />

        <div className="mx-auto max-w-md px-5 sm:px-8">
          <h1 className="font-display text-center text-3xl font-bold text-tinta sm:text-4xl">Entrar</h1>
          <p className="mt-3 text-center text-tinta-suave">Acesse a área da sua família ou da escola.</p>

          <form
            onSubmit={handleSubmit}
            className="mt-10 rounded-3xl border border-ceu-100 bg-white p-7 shadow-xl shadow-ceu-100/60 sm:p-10"
          >
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
                  className={campo}
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-8 w-full rounded-full bg-lilas-500 px-8 py-4 font-bold text-white shadow-lg shadow-lilas-200 transition hover:bg-lilas-600"
            >
              Entrar
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}
