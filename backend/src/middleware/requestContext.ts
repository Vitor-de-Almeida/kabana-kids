import { randomUUID } from "node:crypto"
import type { NextFunction, Request, Response } from "express"

import { logger } from "../logger.ts"

// Dá um ID a cada requisição e registra o resultado (D23).
export function requestContext(request: Request, response: Response, next: NextFunction): void {
  // Sempre gerado aqui: um ID vindo do cliente não é confiável
  const requestId = randomUUID()
  const startedAt = performance.now()

  response.locals.requestId = requestId
  response.setHeader("X-Request-Id", requestId)

  response.on("finish", () => {
    logger.info("http.request", {
      request_id: requestId,
      method: request.method,
      // Sem a query string: pode conter dados
      path: request.originalUrl.split("?")[0] ?? "",
      status: response.statusCode,
      duration_ms: Math.round(performance.now() - startedAt),
    })
  })

  next()
}

export function getRequestId(response: Response): string {
  return String(response.locals.requestId)
}
