import { useState } from "react"
import type { FormEvent } from "react"

import { FieldError } from "./FieldError"
import { toApiError } from "../services/apiError"
import type { ApiError } from "../services/apiError"
import { createWaitlistEntry } from "../services/waitlist"
import type { DesiredClassroom, WaitlistEntryInput } from "../types/waitlist"

const turmas: { value: DesiredClassroom; label: string }[] = [
  { value: "nursery", label: "Berçário (4 meses a 1 ano)" },
  { value: "toddler", label: "Maternal (2 a 3 anos)" },
  { value: "preschool", label: "Pré-escola (4 a 5 anos)" },
  { value: "undecided", label: "Ainda não sei" },
]

// Campo da API → id do campo na tela, na ordem da tela
const inputIds: Record<keyof WaitlistEntryInput, string> = {
  guardianName: "responsavel",
  email: "email",
  phone: "telefone",
  childName: "crianca",
  childBirthDate: "nascimento",
  desiredClassroom: "turma",
  message: "mensagem",
  consent: "consentimento",
}

const rotuloCampo = "mb-2 block text-sm font-semibold text-tinta"
const campo =
  "w-full rounded-2xl border border-ceu-200 bg-white px-4 py-3 text-tinta outline-none transition placeholder:text-tinta-suave/60 focus:border-lilas-400 focus:ring-4 focus:ring-lilas-100 aria-invalid:border-lilas-500"

function readForm(form: HTMLFormElement): WaitlistEntryInput {
  const data = new FormData(form)
  const text = (name: string) => String(data.get(name) ?? "")

  return {
    guardianName: text("responsavel"),
    email: text("email"),
    phone: text("telefone"),
    childName: text("crianca"),
    childBirthDate: text("nascimento"),
    desiredClassroom: text("turma") as DesiredClassroom,
    message: text("mensagem"),
    consent: data.get("consentimento") === "on",
  }
}

function errorMessage(error: ApiError): string {
  switch (error.kind) {
    case "validation":
    case "rateLimit":
      return error.message
    case "network":
      return "Não conseguimos falar com a escola agora. Confira sua internet e tente de novo."
    case "unexpected":
      return error.requestId
        ? `Algo deu errado do nosso lado. Tente de novo em alguns minutos. Se continuar, fale com a escola e informe o código ${error.requestId}.`
        : "Algo deu errado do nosso lado. Tente de novo em alguns minutos."
  }
}

export function WaitlistForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "success">("idle")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [formError, setFormError] = useState<string | null>(null)

  async function handleSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const input = readForm(evento.currentTarget)
    setStatus("sending")
    setFieldErrors({})
    setFormError(null)

    try {
      await createWaitlistEntry(input)
      setStatus("success")
    } catch (error) {
      const apiError = toApiError(error)
      const errors = apiError.kind === "validation" ? apiError.fieldErrors : {}
      setFieldErrors(errors)
      setFormError(errorMessage(apiError))
      setStatus("idle")

      const firstInvalid = Object.entries(inputIds).find(([field]) => errors[field])
      if (firstInvalid) {
        document.getElementById(firstInvalid[1])?.focus()
      }
    }
  }

  // Liga o campo à mensagem de erro, para leitores de tela
  function errorProps(field: keyof WaitlistEntryInput, extraDescription?: string) {
    const hasError = Boolean(fieldErrors[field]?.length)
    const describedBy = [hasError ? `erro-${field}` : null, extraDescription].filter(Boolean).join(" ")
    return { "aria-invalid": hasError || undefined, "aria-describedby": describedBy || undefined }
  }

  if (status === "success") {
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
          onClick={() => setStatus("idle")}
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
          <input id="responsavel" name="responsavel" type="text" required placeholder="Ex.: Ana Almeida" className={campo} {...errorProps("guardianName")} />
          <FieldError id="erro-guardianName" messages={fieldErrors.guardianName} />
        </div>

        <div>
          <label className={rotuloCampo} htmlFor="email">
            E-mail
          </label>
          <input id="email" name="email" type="email" required placeholder="ana@email.com" className={campo} {...errorProps("email")} />
          <FieldError id="erro-email" messages={fieldErrors.email} />
        </div>

        <div>
          <label className={rotuloCampo} htmlFor="telefone">
            WhatsApp
          </label>
          <input id="telefone" name="telefone" type="tel" required placeholder="(11) 90000-0000" className={campo} {...errorProps("phone")} />
          <FieldError id="erro-phone" messages={fieldErrors.phone} />
        </div>

        <div>
          <label className={rotuloCampo} htmlFor="crianca">
            Nome da criança
          </label>
          <input id="crianca" name="crianca" type="text" required placeholder="Ex.: Manu" className={campo} {...errorProps("childName")} />
          <FieldError id="erro-childName" messages={fieldErrors.childName} />
        </div>

        <div>
          <label className={rotuloCampo} htmlFor="nascimento">
            Data de nascimento
          </label>
          <input id="nascimento" name="nascimento" type="date" required className={campo} {...errorProps("childBirthDate")} />
          <FieldError id="erro-childBirthDate" messages={fieldErrors.childBirthDate} />
        </div>

        <div className="sm:col-span-2">
          <label className={rotuloCampo} htmlFor="turma">
            Turma de interesse
          </label>
          <select id="turma" name="turma" required defaultValue="" className={campo} {...errorProps("desiredClassroom")}>
            <option value="" disabled>
              Selecione uma opção
            </option>
            {turmas.map((turma) => (
              <option key={turma.value} value={turma.value}>
                {turma.label}
              </option>
            ))}
          </select>
          <FieldError id="erro-desiredClassroom" messages={fieldErrors.desiredClassroom} />
        </div>

        <div className="sm:col-span-2">
          <label className={rotuloCampo} htmlFor="mensagem">
            Quer nos contar algo? <span className="font-normal text-tinta-suave">(opcional)</span>
          </label>
          <textarea
            id="mensagem"
            name="mensagem"
            rows={3}
            maxLength={1000}
            placeholder="Rotina da família, horário desejado, etc."
            className={campo}
            {...errorProps("message", "aviso-saude")}
          />
          {/* Dado de saúde é sensível (LGPD art. 11) */}
          <p id="aviso-saude" className="mt-2 text-xs text-tinta-suave">
            Por segurança, não escreva aqui informações de saúde da criança, como alergias, remédios ou diagnósticos.
          </p>
          <FieldError id="erro-message" messages={fieldErrors.message} />
        </div>
      </div>

      <label className="mt-6 flex items-start gap-3 rounded-2xl bg-lilas-50 p-4 text-sm text-tinta-suave">
        <input
          id="consentimento"
          type="checkbox"
          name="consentimento"
          required
          className="mt-0.5 h-5 w-5 shrink-0 rounded border-ceu-300 accent-lilas-500"
          {...errorProps("consent")}
        />
        <span>
          Autorizo a Kabana Kids a usar meus dados para contato sobre a matrícula, conforme a{" "}
          <a href="#privacidade" className="font-semibold text-lilas-600 underline decoration-lilas-300">
            Política de Privacidade
          </a>
          .
        </span>
      </label>
      <FieldError id="erro-consent" messages={fieldErrors.consent} />

      {formError && (
        <p role="alert" className="mt-6 rounded-2xl bg-lilas-50 p-4 text-sm font-semibold text-lilas-700">
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-6 w-full rounded-full bg-lilas-500 px-8 py-4 font-bold text-white shadow-lg shadow-lilas-200 transition hover:bg-lilas-600 disabled:cursor-wait disabled:opacity-70"
      >
        {status === "sending" ? "Enviando..." : "Quero fazer a matrícula"}
      </button>

      <p className="mt-4 text-center text-xs text-tinta-suave">
        Sem compromisso. Você pode pedir a exclusão dos seus dados quando quiser.
      </p>
    </form>
  )
}
