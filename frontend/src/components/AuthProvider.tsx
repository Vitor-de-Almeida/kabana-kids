import { useCallback, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"

import { AuthContext } from "../hooks/useAuth"
import { fetchCurrentUser, login, logout } from "../services/auth"
import type { LoginInput, User } from "../types/user"

type AuthProviderProps = {
  children: ReactNode
}

// Guarda só quem está logado, em memória: nada vai para o localStorage
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null | undefined>(undefined)

  const refreshUser = useCallback(async () => {
    try {
      setUser(await fetchCurrentUser())
    } catch {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    fetchCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
  }, [])

  const signIn = useCallback(async (input: LoginInput) => {
    const result = await login(input)
    if (result.kind === "loggedIn") {
      setUser(result.user)
    }
    return result
  }, [])

  const signOut = useCallback(async () => {
    try {
      await logout()
    } finally {
      setUser(null)
    }
  }, [])

  const forgetUser = useCallback(() => setUser(null), [])

  const value = useMemo(
    () => ({ user, signIn, signOut, refreshUser, forgetUser }),
    [user, signIn, signOut, refreshUser, forgetUser],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
