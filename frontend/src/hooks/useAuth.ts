import { createContext, useContext } from "react"

import type { LoginInput, LoginResult, User } from "../types/user"

export type AuthState = {
  /** undefined enquanto confere a sessão; null se ninguém está logado */
  user: User | null | undefined
  signIn: (input: LoginInput) => Promise<LoginResult>
  signOut: () => Promise<void>
  // Busca de novo quem está logado (ex.: depois de ligar o 2FA)
  refreshUser: () => Promise<void>
  // Chamado quando a API responde 401 (sessão expirada)
  forgetUser: () => void
}

export const AuthContext = createContext<AuthState | null>(null)

export function useAuth(): AuthState {
  const auth = useContext(AuthContext)
  if (!auth) {
    throw new Error("useAuth precisa estar dentro do AuthProvider")
  }
  return auth
}
