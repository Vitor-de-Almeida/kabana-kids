import { Navigate, Outlet } from "react-router-dom"

import { useAuth } from "../hooks/useAuth"

// Só melhora a experiência: quem protege os dados é a API
export function RequireAuth() {
  const { user } = useAuth()

  if (user === undefined) {
    return <p className="p-10 text-center text-tinta-suave">Carregando...</p>
  }

  if (user === null) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
