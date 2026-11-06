import type { DesiredClassroom, WaitlistEntryForSchool, WaitlistStatus } from "../types/waitlist"

const CLASSROOM_LABELS: Record<DesiredClassroom, string> = {
  nursery: "Berçário",
  toddler: "Maternal",
  preschool: "Pré-escola",
  undecided: "Ainda não sabe",
}

const STATUS_LABELS: Record<WaitlistStatus, string> = {
  pending: "Aguardando contato",
  contacted: "Contato feito",
  enrolled: "Matriculada",
  discarded: "Encerrado",
}

// AAAA-MM-DD → DD/MM/AAAA, sem fuso horário no meio
function formatBirthDate(date: string | null): string {
  if (!date) {
    return "—"
  }
  const [year, month, day] = date.split("-")
  return `${day}/${month}/${year}`
}

function formatCreatedAt(date: string): string {
  return new Date(date).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" })
}

type WaitlistEntryCardProps = {
  entry: WaitlistEntryForSchool
  busy: boolean
  onAnonymize: (entry: WaitlistEntryForSchool) => void
}

export function WaitlistEntryCard({ entry, busy, onAnonymize }: WaitlistEntryCardProps) {
  return (
    <article className="rounded-3xl border border-ceu-100 bg-white p-6 shadow-lg shadow-ceu-100/60">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-tinta">{entry.childName}</h2>
          <p className="text-sm text-tinta-suave">
            Nascimento: {formatBirthDate(entry.childBirthDate)} ·{" "}
            {entry.desiredClassroom ? CLASSROOM_LABELS[entry.desiredClassroom] : "—"}
          </p>
        </div>
        <span className="rounded-full bg-ceu-100 px-3 py-1 text-xs font-bold text-ceu-700">
          {STATUS_LABELS[entry.status]}
        </span>
      </div>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        <div>
          <dt className="font-semibold text-tinta">Responsável</dt>
          <dd className="text-tinta-suave">{entry.guardianName}</dd>
        </div>
        <div>
          <dt className="font-semibold text-tinta">E-mail</dt>
          <dd className="break-all text-tinta-suave">{entry.email}</dd>
        </div>
        <div>
          <dt className="font-semibold text-tinta">WhatsApp</dt>
          <dd className="text-tinta-suave">{entry.phone}</dd>
        </div>
      </dl>

      {entry.message && (
        <p className="mt-4 rounded-2xl bg-ceu-50 p-4 text-sm whitespace-pre-line text-tinta-suave">{entry.message}</p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-tinta-suave">Recebido em {formatCreatedAt(entry.createdAt)}</p>
        <button
          type="button"
          disabled={busy}
          onClick={() => onAnonymize(entry)}
          className="rounded-full border border-lilas-200 px-4 py-2 text-xs font-bold text-lilas-700 transition hover:bg-lilas-50 disabled:cursor-wait disabled:opacity-70"
        >
          {busy ? "Excluindo..." : "Excluir dados"}
        </button>
      </div>
    </article>
  )
}
