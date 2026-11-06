type TemporaryPasswordNoticeProps = {
  name: string
  password: string
  onClose: () => void
}

// A senha aparece uma vez só: depois de fechar, some (D41)
export function TemporaryPasswordNotice({ name, password, onClose }: TemporaryPasswordNoticeProps) {
  return (
    <div role="status" className="rounded-3xl border border-lilas-200 bg-lilas-50 p-6">
      <p className="font-display text-lg font-bold text-tinta">Senha temporária de {name}</p>
      <p className="mt-3 rounded-2xl bg-white p-4 text-center font-mono text-xl font-bold tracking-wider break-all text-tinta">
        {password}
      </p>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-tinta-suave">
        <li>Entregue pessoalmente. Não mande por e-mail, mensagem ou print.</li>
        <li>Vale por 24 horas e para um único login.</li>
        <li>No primeiro acesso, a pessoa é obrigada a criar uma senha nova.</li>
        <li>Esta senha não aparece de novo depois que você fechar este aviso.</li>
      </ul>
      <button
        type="button"
        onClick={onClose}
        className="mt-4 rounded-full bg-lilas-500 px-5 py-2 text-sm font-bold text-white transition hover:bg-lilas-600"
      >
        Já anotei, fechar
      </button>
    </div>
  )
}
