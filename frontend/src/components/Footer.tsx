import { Link } from "react-router-dom"

import { SCHOOL_INFO } from "./schoolInfo"

const contatos = [
  { rotulo: "Endereço", valor: SCHOOL_INFO.address },
  { rotulo: "Telefone", valor: SCHOOL_INFO.phone },
  { rotulo: "E-mail", valor: SCHOOL_INFO.email },
  { rotulo: "Horário", valor: SCHOOL_INFO.openingHours },
]

export function Footer() {
  return (
    <footer id="contato" className="border-t border-ceu-100 bg-ceu-50">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-ceu-300 to-lilas-300">
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="currentColor">
                <path d="M12 3.6 3 9.2V21h6v-5.4a3 3 0 0 1 6 0V21h6V9.2L12 3.6Z" />
              </svg>
            </span>
            <span className="font-display text-2xl font-bold text-tinta">
              Kabana <span className="text-lilas-500">Kids</span>
            </span>
          </div>
          <p className="mt-5 max-w-sm text-tinta-suave">
            Do Berçário ao 5º ano, tendo a metodologia Montessori como referência. Um espaço seguro e acolhedor para
            as crianças crescerem no próprio ritmo.
          </p>
        </div>

        <div>
          <h3 className="font-display text-lg font-bold text-tinta">Visite a escola</h3>
          <ul className="mt-5 space-y-4">
            {contatos.map((contato) => (
              <li key={contato.rotulo}>
                <span className="block text-xs font-bold uppercase tracking-wide text-lilas-500">
                  {contato.rotulo}
                </span>
                <span className="text-tinta-suave">{contato.valor}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-lg font-bold text-tinta">Institucional</h3>
          <ul className="mt-5 space-y-3 text-tinta-suave">
            <li>
              <a href="/#sobre" className="transition hover:text-lilas-600">
                Sobre a escola
              </a>
            </li>
            <li>
              <a href="/#turmas" className="transition hover:text-lilas-600">
                Turmas e horários
              </a>
            </li>
            <li>
              <a href="/#matricula" className="transition hover:text-lilas-600">
                Matrícula
              </a>
            </li>
            <li>
              <Link to="/politica-de-privacidade" className="transition hover:text-lilas-600">
                Política de Privacidade
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ceu-100">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-6 text-sm text-tinta-suave sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>© {new Date().getFullYear()} Kabana Kids. Todos os direitos reservados.</p>
          <p>Fotos ilustrativas. Depoimentos de exemplo, até a escola enviar os reais.</p>
        </div>
      </div>
    </footer>
  )
}
