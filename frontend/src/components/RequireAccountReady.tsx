import { Navigate, Outlet } from "react-router-dom"

import { useAuth } from "../hooks/useAuth"

// Senha temporária ou 2FA pendente: só Minha conta (a API também bloqueia)
export function RequireAccountReady() {
  const { user } = useAuth()

  if (user?.mustChangePassword || user?.twoFactorSetupRequired) {
    return <Navigate to="/painel/minha-conta" replace />
  }

  return <Outlet />
}
