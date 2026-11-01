import { useState } from "react"
import { Link } from "react-router-dom"

const links = [
  { href: "/#sobre", label: "Sobre" },
  { href: "/#turmas", label: "Turmas" },
  { href: "/#rotina", label: "Rotina" },
  { href: "/#galeria", label: "Galeria" },
  { href: "/#depoimentos", label: "Famílias" },
  { href: "/#matricula", label: "Matrículas" },
]

export function Header() {
  const [aberto, setAberto] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-ceu-100/80 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 sm:px-8">
        <a href="/#inicio" className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-ceu-300 to-lilas-300 shadow-sm">
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="currentColor">
              <path d="M12 3.6 3 9.2V21h6v-5.4a3 3 0 0 1 6 0V21h6V9.2L12 3.6Z" />
            </svg>
          </span>
          <span className="font-display text-2xl leading-none font-bold text-tinta">
            Kabana <span className="text-lilas-500">Kids</span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Navegação principal">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-tinta-suave transition-colors hover:text-lilas-600"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="hidden rounded-full bg-lilas-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-lilas-200 transition hover:bg-lilas-600 sm:block"
          >
            Entrar
          </Link>
          <button
            type="button"
            onClick={() => setAberto((valor) => !valor)}
            aria-expanded={aberto}
            aria-label="Abrir menu"
            className="grid h-11 w-11 place-items-center rounded-xl border border-ceu-200 text-tinta lg:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
              {aberto ? (
                <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {aberto && (
        <nav className="border-t border-ceu-100 bg-white px-5 pb-6 pt-2 lg:hidden" aria-label="Navegação mobile">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setAberto(false)}
              className="block rounded-xl px-3 py-3 font-semibold text-tinta-suave hover:bg-ceu-50 hover:text-lilas-600"
            >
              {link.label}
            </a>
          ))}
          <Link
            to="/login"
            onClick={() => setAberto(false)}
            className="mt-3 block rounded-full bg-lilas-500 px-6 py-3 text-center font-bold text-white"
          >
            Entrar
          </Link>
        </nav>
      )}
    </header>
  )
}
