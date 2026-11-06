import axios from "axios"

// Os tipos de erro que a tela precisa tratar
export type ApiError =
  | { kind: "validation"; message: string; fieldErrors: Record<string, string[]> }
  | { kind: "rateLimit"; message: string }
  | { kind: "rejected"; status: 401 | 403 | 404; message: string }
  | { kind: "network" }
  // A API não respondeu (fora do ar ou reiniciando)
  | { kind: "unavailable" }
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

  // Login, permissão e "não encontrado": mensagem da própria API
  if (response.status === 401 || response.status === 403 || response.status === 404) {
    return { kind: "rejected", status: response.status, message: response.data?.message ?? "Pedido recusado." }
  }

  // O código liga a reclamação da família ao log (D25)
  const requestId = response.headers["x-request-id"]
  if (typeof requestId !== "string") {
    // Sem o código da API: quem respondeu foi o proxy
    return { kind: "unavailable" }
  }
  return { kind: "unexpected", requestId }
}

// Mensagem para a pessoa, sem termos técnicos (D25)
export function describeApiError(error: ApiError): string {
  switch (error.kind) {
    case "validation":
    case "rateLimit":
    case "rejected":
      return error.message
    case "network":
      return "Não conseguimos falar com a escola agora. Confira sua internet e tente de novo."
    case "unavailable":
      return "O sistema está fora do ar no momento. Tente de novo em alguns minutos."
    case "unexpected":
      return error.requestId
        ? `Algo deu errado do nosso lado. Tente de novo em alguns minutos. Se continuar, fale com a escola e informe o código ${error.requestId}.`
        : "Algo deu errado do nosso lado. Tente de novo em alguns minutos."
  }
}
