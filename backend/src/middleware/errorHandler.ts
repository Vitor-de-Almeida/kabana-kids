import type { NextFunction, Request, Response } from "express"

import { logger } from "../logger.ts"
import { getRequestId } from "./requestContext.ts"

type HttpError = Error & { status?: number; code?: unknown }

// Mensagens próprias: as das bibliotecas repetem o valor enviado
const CLIENT_ERROR_MESSAGES: Record<number, string> = {
  400: "Não foi possível ler os dados enviados. Confira o formulário e tente de novo.",
  413: "Os dados enviados passaram do tamanho permitido.",
}

// Nunca expõe detalhes internos do erro.
export function errorHandler(error: HttpError, _request: Request, response: Response, _next: NextFunction): void {
  const status = error.status ?? 500

  if (status >= 500) {
    // Sem a mensagem: erros do banco podem citar valores
    logger.error("http.error", {
      request_id: getRequestId(response),
      error_name: error.name,
      error_code: typeof error.code === "string" ? error.code : null,
    })
    response.status(500).json({ message: "Erro interno. Tente novamente mais tarde." })
    return
  }

  response.status(status).json({ message: CLIENT_ERROR_MESSAGES[status] ?? "Requisição inválida." })
}
