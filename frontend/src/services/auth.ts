import axios from "axios"

import { api } from "./api"
import type { ChangePasswordInput, LoginEvent, LoginInput, LoginResult, TwoFactorSetup, User } from "../types/user"

// O cookie da sessão é gravado pelo navegador; o JavaScript não o lê
export async function login(input: LoginInput): Promise<LoginResult> {
  try {
    const response = await api.post<{ data: User }>("/sessions", input)
    return { kind: "loggedIn", user: response.data.data }
  } catch (error) {
    // Senha certa, falta o código do app: segunda etapa
    const needsCode =
      axios.isAxiosError<{ twoFactorRequired?: boolean }>(error) &&
      error.response?.status === 401 &&
      error.response.data?.twoFactorRequired === true
    if (needsCode && !input.code) {
      return { kind: "twoFactorRequired" }
    }
    throw error
  }
}

export async function logout(): Promise<void> {
  await api.delete("/sessions/current")
}

/** Retorna null quando ninguém está logado. */
export async function fetchCurrentUser(): Promise<User | null> {
  try {
    const response = await api.get<{ data: User }>("/me")
    return response.data.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return null
    }
    throw error
  }
}

export async function changePassword(input: ChangePasswordInput): Promise<void> {
  await api.put("/me/password", input)
}

export async function startTwoFactorSetup(): Promise<TwoFactorSetup> {
  const response = await api.post<{ data: TwoFactorSetup }>("/me/two-factor")
  return response.data.data
}

export async function confirmTwoFactor(code: string): Promise<void> {
  await api.post("/me/two-factor/confirm", { code })
}

export async function fetchMyLogins(): Promise<LoginEvent[]> {
  const response = await api.get<{ data: LoginEvent[] }>("/me/logins")
  return response.data.data
}

// "Esqueci minha senha": a resposta é sempre a mesma (D45)
export async function requestPasswordReset(email: string): Promise<string> {
  const response = await api.post<{ message: string }>("/password-reset-requests", { email })
  return response.data.message
}

export async function completePasswordReset(token: string, newPassword: string): Promise<void> {
  await api.post("/password-resets", { token, newPassword })
}
