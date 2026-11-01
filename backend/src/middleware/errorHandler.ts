import type { NextFunction, Request, Response } from "express"

type HttpError = Error & { status?: number; expose?: boolean }

// Nunca expõe detalhes internos do erro.
export function errorHandler(error: HttpError, _request: Request, response: Response, _next: NextFunction): void {
  const status = error.status ?? 500

  if (status >= 500) {
    // Sem o corpo do pedido: pode ter dados pessoais
    console.error(`[erro] ${error.name}: ${error.message}`)
    response.status(500).json({ message: "Erro interno. Tente novamente mais tarde." })
    return
  }

  response.status(status).json({ message: error.expose ? error.message : "Requisição inválida." })
}
