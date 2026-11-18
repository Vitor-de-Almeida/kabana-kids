import { Navigate } from "react-router-dom"

import { PANEL_MENU } from "../../components/panelMenu"
import { useAuth } from "../../hooks/useAuth"

// Abre o primeiro item do menu do perfil
export function PanelHomePage() {
  const { user } = useAuth()
  const firstItem = PANEL_MENU.find((item) => user && item.roles.includes(user.role))

  if (firstItem) {
    return <Navigate to={firstItem.to} replace />
  }

  return (
    <div className="rounded-3xl border border-ceu-100 bg-white p-8 text-tinta-suave">
      <title>Painel | Kabana Kids</title>
      Ainda não há nada por aqui para o seu perfil.
    </div>
  )
}
