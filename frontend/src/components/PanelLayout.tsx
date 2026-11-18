import { NavLink, Outlet, useNavigate } from "react-router-dom"

import { PANEL_MENU } from "./panelMenu"
import { useAuth } from "../hooks/useAuth"
import type { UserRole } from "../types/user"

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Dono(a) da escola",
  manager: "Gerente",
  teacher: "Professor(a)",
  parent: "Família",
}

export function PanelLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  if (!user) {
    return null
  }

  const items = PANEL_MENU.filter((item) => item.roles.includes(user.role))

  async function handleSignOut() {
    await signOut()
    navigate("/login", { replace: true })
  }

  return (
    <div className="min-h-screen bg-ceu-50/70 lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="border-b border-ceu-100 bg-white p-5 lg:border-r lg:border-b-0">
        <span className="font-display text-2xl font-bold text-tinta">
          Kabana <span className="text-lilas-500">Kids</span>
        </span>
        <p className="mt-4 text-sm font-semibold text-tinta">{user.name}</p>
        <p className="text-xs text-tinta-suave">{ROLE_LABELS[user.role]}</p>

        <nav className="mt-6 flex gap-2 lg:flex-col" aria-label="Menu do painel">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                  isActive ? "bg-lilas-100 text-lilas-700" : "text-tinta-suave hover:bg-ceu-50"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          onClick={handleSignOut}
          className="mt-6 rounded-full border border-lilas-200 px-5 py-2 text-sm font-bold text-lilas-600 transition hover:bg-lilas-50"
        >
          Sair
        </button>
      </aside>

      <main className="p-5 sm:p-8">
        <Outlet />
      </main>
    </div>
  )
}
