import type { NextFunction, Request, Response } from "express"

import { config } from "../config.ts"
import { logger } from "../logger.ts"
import { getRequestId } from "./requestContext.ts"

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"])

// CSRF (D21): todo pedido que altera dados vem do nosso site
export function requireTrustedOrigin(request: Request, response: Response, next: NextFunction): void {
  if (SAFE_METHODS.has(request.method) || request.headers.origin === config.frontendUrl) {
    next()
    return
  }

  logger.info("csrf.blocked", { request_id: getRequestId(response), path: request.path })
  response.status(403).json({ message: "Pedido recusado por segurança. Recarregue a página e tente de novo." })
}
