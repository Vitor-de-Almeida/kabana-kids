import type { UserRole } from "../types/user"

// Cada perfil vê só os seus itens; quem protege é a API (D22)
export const PANEL_MENU: { to: string; label: string; roles: UserRole[] }[] = [
  { to: "/painel/matriculas", label: "Matrículas", roles: ["admin", "manager"] },
  { to: "/painel/equipe", label: "Equipe", roles: ["admin", "manager"] },
  { to: "/painel/minha-conta", label: "Minha conta", roles: ["admin", "manager", "teacher", "parent"] },
]
