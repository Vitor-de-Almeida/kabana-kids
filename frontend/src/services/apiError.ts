import axios from "axios"

// Os tipos de erro que a tela precisa tratar
export type ApiError =
  | { kind: "validation"; message: string; fieldErrors: Record<string, string[]> }
  | { kind: "rateLimit"; message: string }
  | { kind: "network" }
  | { kind: "unexpected"; requestId: string | null }

type ErrorBody = { message?: string; errors?: Record<string, string[]> }

export function toApiError(error: unknown): ApiError {
  if (!axios.isAxiosError<ErrorBody>(error)) {
    return { kind: "unexpected", requestId: null }
  }

  const response = error.response
  if (!response) {
    return { kind: "network" }
  }

  if (response.status === 422) {
    return {
      kind: "validation",
      message: response.data?.message ?? "Confira os campos destacados.",
      fieldErrors: response.data?.errors ?? {},
    }
  }

  if (response.status === 429) {
    return { kind: "rateLimit", message: response.data?.message ?? "Muitas tentativas. Aguarde um minuto e tente de novo." }
  }

  // O código liga a reclamação da família ao log (D25)
  const requestId = response.headers["x-request-id"]
  return { kind: "unexpected", requestId: typeof requestId === "string" ? requestId : null }
}
