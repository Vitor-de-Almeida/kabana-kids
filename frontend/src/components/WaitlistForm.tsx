import { useState } from "react"
import type { FormEvent } from "react"

const turmas = [
  "Berçário (4 meses a 1 ano)",
  "Maternal (2 a 3 anos)",
  "Pré-escola (4 a 5 anos)",
  "Ainda não sei",
]

const rotuloCampo = "mb-2 block text-sm font-semibold text-tinta"
const campo =
  "w-full rounded-2xl border border-ceu-200 bg-white px-4 py-3 text-tinta outline-none transition placeholder:text-tinta-suave/60 focus:border-lilas-400 focus:ring-4 focus:ring-lilas-100"

export function WaitlistForm() {
  const [enviado, setEnviado] = useState(false)

  // Ainda sem backend: quando a API `POST /api/v1/waitlist-entries` existir, o envio acontece aqui.
  function handleSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setEnviado(true)
  }

  if (enviado) {
    return (
      <div className="rounded-3xl border border-ceu-100 bg-white p-10 text-center shadow-xl shadow-ceu-100/60">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-ceu-100">
          <svg viewBox="0 0 24 24" className="h-8 w-8 text-ceu-600" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <h3 className="font-display mt-6 text-2xl font-bold text-tinta">Recebemos seu cadastro!</h3>
        <p className="mx-auto mt-3 max-w-md text-tinta-suave">
          Nossa equipe entra em contato em até 2 dias úteis para conversar sobre a turma da sua criança e agendar uma
          visita.
        </p>
        <button
          type="button"
          onClick={() => setEnviado(false)}
          className="mt-8 rounded-full border border-lilas-200 px-6 py-3 text-sm font-bold text-lilas-600 transition hover:bg-lilas-50"
        >
          Cadastrar outra criança
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-ceu-100 bg-white p-7 shadow-xl shadow-ceu-100/60 sm:p-10"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={rotuloCampo} htmlFor="responsavel">
            Nome do responsável
          </label>
          <input id="responsavel" name="responsavel" type="text" required placeholder="Ex.: Ana Almeida" className={campo} />
        </div>

        <div>
          <label className={rotuloCampo} htmlFor="email">
            E-mail
          </label>
          <input id="email" name="email" type="email" required placeholder="ana@email.com" className={campo} />
        </div>

        <div>
          <label className={rotuloCampo} htmlFor="telefone">
            WhatsApp
          </label>
          <input id="telefone" name="telefone" type="tel" required placeholder="(11) 90000-0000" className={campo} />
        </div>

        <div>
          <label className={rotuloCampo} htmlFor="crianca">
            Nome da criança
          </label>
          <input id="crianca" name="crianca" type="text" required placeholder="Ex.: Manu" className={campo} />
        </div>

        <div>
          <label className={rotuloCampo} htmlFor="nascimento">
            Data de nascimento
          </label>
          <input id="nascimento" name="nascimento" type="date" required className={campo} />
        </div>

        <div className="sm:col-span-2">
          <label className={rotuloCampo} htmlFor="turma">
            Turma de interesse
          </label>
          <select id="turma" name="turma" required defaultValue="" className={campo}>
            <option value="" disabled>
              Selecione uma opção
            </option>
            {turmas.map((turma) => (
              <option key={turma} value={turma}>
                {turma}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className={rotuloCampo} htmlFor="mensagem">
            Quer nos contar algo? <span className="font-normal text-tinta-suave">(opcional)</span>
          </label>
          <textarea
            id="mensagem"
            name="mensagem"
            rows={3}
            placeholder="Rotina da família, cuidados especiais, horário desejado..."
            className={campo}
          />
        </div>
      </div>

      <label className="mt-6 flex items-start gap-3 rounded-2xl bg-lilas-50 p-4 text-sm text-tinta-suave">
        <input
          type="checkbox"
          name="consentimento"
          required
          className="mt-0.5 h-5 w-5 shrink-0 rounded border-ceu-300 accent-lilas-500"
        />
        <span>
          Autorizo a Kabana Kids a usar meus dados para contato sobre a matrícula, conforme a{" "}
          <a href="#privacidade" className="font-semibold text-lilas-600 underline decoration-lilas-300">
            Política de Privacidade
          </a>
          .
        </span>
      </label>

      <button
        type="submit"
        className="mt-6 w-full rounded-full bg-lilas-500 px-8 py-4 font-bold text-white shadow-lg shadow-lilas-200 transition hover:bg-lilas-600"
      >
        Quero fazer a matrícula
      </button>

      <p className="mt-4 text-center text-xs text-tinta-suave">
        Sem compromisso. Você pode pedir a exclusão dos seus dados quando quiser.
      </p>
    </form>
  )
}
